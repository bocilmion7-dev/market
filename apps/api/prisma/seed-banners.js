const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await client.connect();
  
  const banners = [
    { id: 'b1', title: 'Flash Sale 50% OFF', subtitle: 'Berlaku hingga akhir minggu', imageUrl: 'https://picsum.photos/seed/banner1/1200/400', link: '/products', active: true },
    { id: 'b2', title: 'Koleksi Fashion Terbaru', subtitle: 'Tampil stylish dengan koleksi kami', imageUrl: 'https://picsum.photos/seed/banner2/1200/400', link: '/products', active: true },
    { id: 'b3', title: 'Elektronik Terbaik', subtitle: 'Gadget premium harga terjangkau', imageUrl: 'https://picsum.photos/seed/banner3/1200/400', link: '/products', active: true },
  ];

  await client.query(`
    INSERT INTO settings (id, key, value, created_at, updated_at)
    VALUES (gen_random_uuid(), 'home_banners', $1, NOW(), NOW())
    ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()
  `, [JSON.stringify({ banners })]);

  console.log('Seeded 3 banners');
  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
