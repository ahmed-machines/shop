-- =====================================================================
-- ShopSphere - STEP 2: ROW LEVEL SECURITY POLICIES + IMAGE STORAGE
-- Run this after 01_schema.sql.
-- With RLS on, a table is locked unless a policy allows the action.
-- =====================================================================

alter table public.categories  enable row level security;
alter table public.profiles    enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.favorites   enable row level security;

-- ---------- categories: everyone reads, admins write ----------
drop policy if exists "Anyone can read categories" on public.categories;
create policy "Anyone can read categories" on public.categories
  for select using (true);

drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- products: everyone reads, admins write ----------
drop policy if exists "Anyone can read products" on public.products;
create policy "Anyone can read products" on public.products
  for select using (true);

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- profiles: own row only (admins can read all) ----------
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles
  for insert with check (auth.uid() = id and role = 'customer');

-- A user may edit their own profile but can NOT change their own role.
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id and role = public.my_role());

-- ---------- orders: customers see their own, admins see and update all ----------
-- There is no INSERT policy on purpose: customers create orders through place_order().
drop policy if exists "Users read own orders" on public.orders;
create policy "Users read own orders" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

-- ---------- order_items: visible when the parent order is visible ----------
drop policy if exists "Users read own order items" on public.order_items;
create policy "Users read own order items" on public.order_items
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

-- ---------- favorites: private to each user ----------
drop policy if exists "Users read own favorites" on public.favorites;
create policy "Users read own favorites" on public.favorites
  for select using (auth.uid() = user_id);

drop policy if exists "Users add own favorites" on public.favorites;
create policy "Users add own favorites" on public.favorites
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users remove own favorites" on public.favorites;
create policy "Users remove own favorites" on public.favorites
  for delete using (auth.uid() = user_id);

-- =====================================================================
-- Storage bucket for product images (public read, admin write)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can view product images" on storage.objects;
create policy "Anyone can view product images" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "Admins upload product images" on storage.objects;
create policy "Admins upload product images" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins update product images" on storage.objects;
create policy "Admins update product images" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins delete product images" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());

