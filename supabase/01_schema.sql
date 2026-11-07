-- =====================================================================
-- ShopSphere - STEP 1: TABLES, TRIGGERS AND THE place_order FUNCTION
-- Run this file first in the Supabase SQL Editor.
-- =====================================================================

-- ---------- categories ----------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text not null unique,
  description text,
  image_url   text,
  created_at  timestamptz not null default now()
);

-- ---------- profiles (one row per auth user) ----------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  phone      text,
  address    text,
  city       text,
  role       text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

-- ---------- products ----------
create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  description      text,
  price            numeric(10, 2) not null check (price >= 0),
  discount_percent integer not null default 0 check (discount_percent between 0 and 90),
  category_id      uuid references public.categories (id) on delete set null,
  image_url        text,
  rating           numeric(2, 1) not null default 4.5 check (rating between 0 and 5),
  stock            integer not null default 0 check (stock >= 0),
  sales_count      integer not null default 0,
  created_at       timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category_id);

-- ---------- orders ----------
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  status           text not null default 'pending'
                   check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  subtotal         numeric(10, 2) not null,
  shipping_cost    numeric(10, 2) not null,
  total            numeric(10, 2) not null,
  payment_method   text not null default 'cash_on_delivery',
  customer_name    text not null,
  phone            text not null,
  shipping_address text not null,
  city             text not null,
  notes            text,
  created_at       timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders (user_id);

-- ---------- order_items ----------
-- product_name and unit_price are copied from the product at purchase time,
-- so old orders keep their original data even if the product changes later.
create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders (id) on delete cascade,
  product_id   uuid references public.products (id) on delete set null,
  product_name text not null,
  image_url    text,
  unit_price   numeric(10, 2) not null,
  quantity     integer not null check (quantity > 0)
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- ---------- favorites ----------
create table if not exists public.favorites (
  user_id    uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- =====================================================================
-- Automatically create a profile when someone registers
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- Helper functions used by the security policies
-- =====================================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.my_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- =====================================================================
-- place_order: the ONLY way a customer can create an order.
-- It runs on the server, so prices and stock cannot be faked in the browser.
-- p_items looks like: [{"product_id": "...", "quantity": 2}, ...]
-- Shipping rule: free when subtotal >= 100, otherwise 9.99.
-- =====================================================================
create or replace function public.place_order(
  p_customer_name    text,
  p_phone            text,
  p_shipping_address text,
  p_city             text,
  p_notes            text,
  p_items            jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id  uuid := auth.uid();
  v_order_id uuid;
  v_item     jsonb;
  v_product  public.products%rowtype;
  v_qty      integer;
  v_price    numeric(10, 2);
  v_subtotal numeric(10, 2) := 0;
  v_shipping numeric(10, 2);
begin
  if v_user_id is null then
    raise exception 'You must be logged in to place an order';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty';
  end if;

  -- Create the order first with zero totals; we update them below.
  insert into public.orders
    (user_id, subtotal, shipping_cost, total, customer_name, phone, shipping_address, city, notes)
  values
    (v_user_id, 0, 0, 0, p_customer_name, p_phone, p_shipping_address, p_city, p_notes)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item ->> 'quantity')::integer;

    -- "for update" locks the row so two buyers cannot take the same last item
    select * into v_product
    from public.products
    where id = (v_item ->> 'product_id')::uuid
    for update;

    if not found then
      raise exception 'A product in your cart no longer exists';
    end if;
    if v_qty is null or v_qty < 1 then
      raise exception 'Invalid quantity for %', v_product.name;
    end if;
    if v_product.stock < v_qty then
      raise exception 'Only % left in stock for %', v_product.stock, v_product.name;
    end if;

    v_price := round(v_product.price * (100 - v_product.discount_percent) / 100.0, 2);
    v_subtotal := v_subtotal + v_price * v_qty;

    insert into public.order_items (order_id, product_id, product_name, image_url, unit_price, quantity)
    values (v_order_id, v_product.id, v_product.name, v_product.image_url, v_price, v_qty);

    update public.products
    set stock = stock - v_qty, sales_count = sales_count + v_qty
    where id = v_product.id;
  end loop;

  v_shipping := case when v_subtotal >= 100 then 0 else 9.99 end;

  update public.orders
  set subtotal = v_subtotal, shipping_cost = v_shipping, total = v_subtotal + v_shipping
  where id = v_order_id;

  return v_order_id;
end;
$$;

revoke all on function public.place_order(text, text, text, text, text, jsonb) from public;
grant execute on function public.place_order(text, text, text, text, text, jsonb) to authenticated;

