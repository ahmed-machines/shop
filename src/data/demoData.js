// Demo catalog.
// 1) It is the fallback data when Supabase is not configured (so the store can still be browsed).
// 2) `node scripts/generate-seed.js` turns it into supabase/03_seed.sql so the database
//    contains exactly the same products.

// Images are stored inside the project in public/images (served from the site root).
const productImage = (name) => `/images/products/${name}.jpg`
const categoryImage = (slug) => `/images/categories/${slug}.jpg`

export const demoCategories = [
  { id: 'electronics', name: 'Electronics', slug: 'electronics', description: 'Audio, wearables and smart gadgets.', image_url: categoryImage('electronics') },
  { id: 'fashion', name: 'Fashion', slug: 'fashion', description: 'Clothing, shoes and accessories.', image_url: categoryImage('fashion') },
  { id: 'home-living', name: 'Home & Living', slug: 'home-living', description: 'Furniture, lighting and decor.', image_url: categoryImage('home-living') },
  { id: 'beauty', name: 'Beauty', slug: 'beauty', description: 'Skincare, fragrance and makeup.', image_url: categoryImage('beauty') },
  { id: 'sports', name: 'Sports & Outdoors', slug: 'sports', description: 'Gear for training and adventure.', image_url: categoryImage('sports') },
]

// daysAgo is used to create different "created_at" dates so "Newest" sorting works.
const rawProducts = [
  // ----- Electronics -----
  { name: 'Aurora Wireless Headphones', category: 'electronics', price: 199.0, discount: 20, rating: 4.8, stock: 35, sales: 420, daysAgo: 40, image: 'aurora-headphones', description: 'Over-ear Bluetooth headphones with active noise cancelling, 40-hour battery life and ultra-soft memory-foam ear cushions.' },
  { name: 'Pulse Smart Watch', category: 'electronics', price: 249.0, discount: 0, rating: 4.6, stock: 22, sales: 310, daysAgo: 8, image: 'pulse-smartwatch', description: 'Fitness smart watch with heart-rate tracking, GPS, sleep analysis and a bright always-on AMOLED display.' },
  { name: 'Lumen Mirrorless Camera', category: 'electronics', price: 899.0, discount: 10, rating: 4.9, stock: 8, sales: 95, daysAgo: 60, image: 'lumen-camera', description: '24MP mirrorless camera with 4K video, fast autofocus and a lightweight magnesium body. Kit lens included.' },
  { name: 'Echo Portable Speaker', category: 'electronics', price: 89.0, discount: 15, rating: 4.5, stock: 60, sales: 280, daysAgo: 20, image: 'echo-speaker', description: 'Waterproof Bluetooth speaker with deep bass, 12-hour playtime and a rugged design made for the outdoors.' },
  { name: 'Nova Ultrabook 14"', category: 'electronics', price: 1099.0, discount: 5, rating: 4.7, stock: 12, sales: 140, daysAgo: 4, image: 'nova-ultrabook', description: 'Thin and light 14-inch laptop with a sharp 2.2K display, 16GB RAM, 512GB SSD and all-day battery.' },
  { name: 'Bud Pro True Wireless Earbuds', category: 'electronics', price: 129.0, discount: 25, rating: 4.4, stock: 80, sales: 510, daysAgo: 15, image: 'bud-pro-earbuds', description: 'Compact earbuds with crystal-clear calls, transparency mode and a wireless charging case.' },

  // ----- Fashion -----
  { name: 'Velocity Street Sneakers', category: 'fashion', price: 120.0, discount: 0, rating: 4.7, stock: 45, sales: 365, daysAgo: 6, image: 'velocity-sneakers', description: 'Lightweight everyday sneakers with a cushioned sole, breathable mesh upper and bold colour-block design.' },
  { name: 'Alpine Puffer Jacket', category: 'fashion', price: 189.0, discount: 30, rating: 4.6, stock: 28, sales: 220, daysAgo: 50, image: 'alpine-jacket', description: 'Warm, water-resistant puffer jacket with recycled insulation and a packable hood.' },
  { name: 'Aviator Classic Sunglasses', category: 'fashion', price: 79.0, discount: 0, rating: 4.3, stock: 70, sales: 190, daysAgo: 25, image: 'aviator-sunglasses', description: 'Polarised UV400 sunglasses with a lightweight metal frame that suits every face shape.' },
  { name: 'Metro Everyday Backpack', category: 'fashion', price: 69.0, discount: 10, rating: 4.5, stock: 55, sales: 250, daysAgo: 12, image: 'metro-backpack', description: 'Water-repellent 22L backpack with a padded laptop sleeve, hidden pocket and ergonomic straps.' },
  { name: 'Essential Cotton T-Shirt', category: 'fashion', price: 29.0, discount: 0, rating: 4.4, stock: 150, sales: 600, daysAgo: 3, image: 'cotton-tshirt', description: 'Soft 100% organic cotton tee with a relaxed fit. Pre-washed so it stays soft and keeps its shape.' },

  // ----- Home & Living -----
  { name: 'Halo Desk Lamp', category: 'home-living', price: 59.0, discount: 0, rating: 4.5, stock: 40, sales: 175, daysAgo: 18, image: 'halo-desk-lamp', description: 'Adjustable LED desk lamp with three colour temperatures, touch dimming and a USB charging port.' },
  { name: 'Nordic Lounge Chair', category: 'home-living', price: 349.0, discount: 15, rating: 4.8, stock: 10, sales: 85, daysAgo: 35, image: 'nordic-lounge-chair', description: 'Scandinavian-style armchair with solid oak legs and a deep, comfortable linen-blend seat.' },
  { name: 'Stoneware Mug Set (4 pcs)', category: 'home-living', price: 38.0, discount: 0, rating: 4.6, stock: 90, sales: 230, daysAgo: 10, image: 'stoneware-mugs', description: 'Handmade-look stoneware mugs with a reactive glaze. Dishwasher and microwave safe.' },
  { name: 'Monstera Plant with Pot', category: 'home-living', price: 45.0, discount: 0, rating: 4.7, stock: 25, sales: 120, daysAgo: 2, image: 'monstera-plant', description: 'A healthy, easy-care indoor plant delivered in a minimalist ceramic pot. Great for bright rooms.' },
  { name: 'Amber Soy Candle', category: 'home-living', price: 24.0, discount: 20, rating: 4.4, stock: 100, sales: 330, daysAgo: 22, image: 'amber-candle', description: 'Hand-poured soy wax candle with notes of amber, vanilla and cedarwood. Burns for 45 hours.' },

  // ----- Beauty -----
  { name: 'Glow Hydrating Serum', category: 'beauty', price: 42.0, discount: 0, rating: 4.7, stock: 65, sales: 410, daysAgo: 7, image: 'glow-serum', description: 'Lightweight serum with hyaluronic acid and vitamin C for visibly brighter, smoother skin.' },
  { name: 'Noir Eau de Parfum 50ml', category: 'beauty', price: 95.0, discount: 10, rating: 4.6, stock: 30, sales: 160, daysAgo: 28, image: 'noir-perfume', description: 'A warm, elegant fragrance with notes of bergamot, jasmine and sandalwood.' },
  { name: 'Velvet Matte Lipstick', category: 'beauty', price: 22.0, discount: 0, rating: 4.5, stock: 120, sales: 380, daysAgo: 5, image: 'velvet-lipstick', description: 'Long-wearing matte lipstick with a creamy, non-drying formula in a rich berry shade.' },
  { name: 'Pure Daily Skincare Set', category: 'beauty', price: 74.0, discount: 25, rating: 4.8, stock: 38, sales: 270, daysAgo: 45, image: 'daily-skincare-set', description: 'Cleanser, toner and moisturiser trio for a simple, gentle routine suitable for sensitive skin.' },

  // ----- Sports & Outdoors -----
  { name: 'Flow Non-Slip Yoga Mat', category: 'sports', price: 49.0, discount: 0, rating: 4.6, stock: 75, sales: 290, daysAgo: 14, image: 'yoga-mat', description: '6mm eco-friendly yoga mat with a grippy surface and alignment lines. Includes a carry strap.' },
  { name: 'Iron Adjustable Dumbbells', category: 'sports', price: 159.0, discount: 12, rating: 4.7, stock: 20, sales: 205, daysAgo: 30, image: 'iron-dumbbells', description: 'Space-saving adjustable dumbbell pair from 2 to 24 kg with a quick-change dial system.' },
  { name: 'Glacier Insulated Bottle 750ml', category: 'sports', price: 32.0, discount: 0, rating: 4.8, stock: 110, sales: 450, daysAgo: 9, image: 'glacier-bottle', description: 'Double-wall stainless steel bottle that keeps drinks cold for 24 hours or hot for 12.' },
  { name: 'Stride Pro Running Shoes', category: 'sports', price: 135.0, discount: 15, rating: 4.7, stock: 42, sales: 340, daysAgo: 1, image: 'stride-running-shoes', description: 'Responsive running shoes with a carbon-infused midsole and a breathable knit upper.' },
  { name: 'Trail City Hybrid Bike', category: 'sports', price: 649.0, discount: 8, rating: 4.5, stock: 6, sales: 40, daysAgo: 55, image: 'trail-hybrid-bike', description: 'Lightweight aluminium hybrid bike with 21 speeds and reliable disc brakes for city and trail.' },
]

export const demoProducts = rawProducts.map((product, index) => ({
  id: `demo-${index + 1}`,
  name: product.name,
  description: product.description,
  price: product.price,
  discount_percent: product.discount,
  category_id: product.category,
  image_url: productImage(product.image),
  rating: product.rating,
  stock: product.stock,
  sales_count: product.sales,
  // created_at is spread over the past days so "Newest" sorting is meaningful
  created_at: new Date(Date.now() - product.daysAgo * 86400000).toISOString(),
  daysAgo: product.daysAgo,
}))
