import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calcPrice(bestPrice: number) {
  const adminFeePct = 10;
  const adminFeeAmt = Math.round(bestPrice * (adminFeePct / 100));
  const marketplacePrice = bestPrice + adminFeeAmt;
  return { adminFeePct, adminFeeAmt, marketplacePrice };
}

// ============================================================
// CATEGORY DEFINITIONS
// ============================================================
const CATEGORIES = [
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Pakaian, sepatu, dan aksesoris fashion',
    categoryFields: [
      { fieldKey: 'material', label: 'Material', fieldType: 'select', required: true, options: ['Katun', 'Linen', 'Sutra', 'Denim', 'Kulit', 'Polyester', 'Rayon'] },
      { fieldKey: 'gender', label: 'Gender', fieldType: 'select', required: true, options: ['Pria', 'Wanita', 'Unisex'] },
    ],
    variantFields: [
      { fieldKey: 'ukuran', label: 'Ukuran', fieldType: 'select', required: true, options: ['S', 'M', 'L', 'XL', 'XXL'] },
      { fieldKey: 'warna', label: 'Warna', fieldType: 'select', required: true, options: ['Hitam', 'Putih', 'Navy', 'Abu-abu', 'Merah', 'Biru', 'Hijau', 'Krem'] },
    ],
    products: [
      { name: 'Kaos Polos Katun Premium', desc: 'Kaos polos katun 30s, nyaman dipakai sehari-hari. Tersedia berbagai ukuran dan warna.' },
      { name: 'Kemeja Flannel Pria', desc: 'Kemeja flannel motif kotak-kotak, bahan tebal dan hangat. Cocok untuk cuaca dingin.' },
      { name: 'Celana Chino Slim Fit', desc: 'Celana chino bahan twill, potongan slim fit. Cocok untuk formal maupun kasual.' },
      { name: 'Jaket Denim Oversized', desc: 'Jaket denim unisex oversized, bahan denim premium. Trendi dan nyaman.' },
      { name: 'Dress Floral Wanita', desc: 'Dress bermotif bunga, bahan rayon flowy. Cocok untuk jalan-jalan atau acara kasual.' },
      { name: 'Hoodie Zipper Polos', desc: 'Hoodie zipper bahan fleece, cocok untuk olahraga atau santai. Tersedia banyak warna.' },
      { name: 'Rok Plisket Midi', desc: 'Rok plisket panjang midi, bahan saten halus. Elegan dan feminin.' },
      { name: 'Sepatu Sneakers Casual', desc: 'Sneakers canvas casual, sol karet anti slip. Ringan dan nyaman untuk aktivitas harian.' },
      { name: 'Tas Ransel Kulit Sintetis', desc: 'Tas ransel bahan kulit sintetis, desain modern. Cocok untuk kerja atau kuliah.' },
      { name: 'Topi Bucket Hat', desc: 'Topi bucket hat bahan katun, desain simple. Perlindungan dari sinar matahari.' },
    ],
  },
  {
    name: 'Elektronik',
    slug: 'elektronik',
    description: 'Gadget, aksesoris, dan perangkat elektronik',
    categoryFields: [
      { fieldKey: 'merk', label: 'Merk', fieldType: 'text', required: true },
      { fieldKey: 'daya', label: 'Daya (Watt)', fieldType: 'text', required: false },
    ],
    variantFields: [
      { fieldKey: 'storage', label: 'Storage', fieldType: 'select', required: true, options: ['64GB', '128GB', '256GB', '512GB'] },
      { fieldKey: 'warna', label: 'Warna', fieldType: 'select', required: true, options: ['Hitam', 'Putih', 'Silver', 'Biru', 'Merah', 'Gold'] },
    ],
    products: [
      { name: 'TWS Earbuds Pro Max', desc: 'Earbuds Bluetooth 5.3, noise cancelling aktif, baterai tahan 30 jam dengan case.' },
      { name: 'Power Bank 20000mAh', desc: 'Power bank kapasitas besar, support fast charging 65W. Bisa charge laptop.' },
      { name: 'Smartwatch Ultra Sport', desc: 'Smartwatch dengan GPS, heart rate monitor, water resistant IP68. Baterai tahan 7 hari.' },
      { name: 'Keyboard Mechanical RGB', desc: 'Keyboard mechanical switch, backlight RGB, anti-ghosting. Cocok untuk gaming dan kerja.' },
      { name: 'Mouse Wireless Ergonomis', desc: 'Mouse wireless ergonomis, DPI adjustable hingga 16000. Nyaman untuk penggunaan lama.' },
      { name: 'Webcam HD 1080p', desc: 'Webcam full HD 1080p, built-in microphone, auto focus. Cocok untuk video call.' },
      { name: 'Speaker Bluetooth Portable', desc: 'Speaker portable waterproof IPX7, bass kuat, baterai 12 jam. Cocok untuk outdoor.' },
      { name: 'Hardisk External 1TB', desc: 'Hardisk external USB 3.0, kapasitas 1TB, kompatibel PC dan laptop.' },
      { name: 'Charger GaN 65W', desc: 'Charger GaN compact 65W, 3 port (2 USB-C + 1 USB-A). Fast charging universal.' },
      { name: 'Kabel Data Type-C Premium', desc: 'Kabel data Type-C to Type-C, support 100W charging dan data transfer 480Mbps.' },
    ],
  },
  {
    name: 'Makanan & Minuman',
    slug: 'makanan-minuman',
    description: 'Makanan ringan, minuman, dan bahan masakan',
    categoryFields: [
      { fieldKey: 'bahan_utama', label: 'Bahan Utama', fieldType: 'text', required: true },
      { fieldKey: 'tanggal_kadaluarsa', label: 'Tanggal Kadaluarsa', fieldType: 'text', required: true },
    ],
    variantFields: [
      { fieldKey: 'rasa', label: 'Rasa', fieldType: 'select', required: true, options: ['Original', 'Pedas', 'Manis', 'Asin', 'Balado', 'BBQ', 'Keju'] },
      { fieldKey: 'berat', label: 'Berat', fieldType: 'select', required: true, options: ['250gr', '500gr', '1kg'] },
    ],
    products: [
      { name: 'Keripik Singkong Balado', desc: 'Keripik singkong renyah dengan bumbu balado pedas. Cocok untuk camilan.' },
      { name: 'Sambal Oelek Tradisional', desc: 'Sambal ulek tradisional, bahan cabe segar. Pedas dan menggugah selera.' },
      { name: 'Kopi Arabika Gayo', desc: 'Biji kopi arabika Gayo specialty, roast medium. Aroma harum dan rasa bold.' },
      { name: 'Madu Murni Hutan Sulawesi', desc: 'Madu murni 100% dari hutan Sulawesi, tanpa tambahan gula. Berkhasiat untuk kesehatan.' },
      { name: 'Teh Hijau Organik', desc: 'Teh hijau organik pilihan, dipetik dari kebun teh premium. Kaya antioksidan.' },
      { name: 'Sosis Sapi Premium', desc: 'Sosis sapi premium daging asli, tanpa pengawet. Cocok untuk grill atau rebus.' },
      { name: 'Bumbu Rendang Instan', desc: 'Bumbu rendang instan, tinggal campur daging dan santan. Praktis dan lezat.' },
      { name: 'Kacang Mete Panggang', desc: 'Kacang mete panggang rasa original, kaya protein dan vitamin. Camilan sehat.' },
      { name: 'Sari Buah Mangga', desc: 'Sari buah mangga asli, tanpa pewarna. Segar dan menyegarkan.' },
      { name: 'Mie Instan Soto Betawi', desc: 'Mie instan rasa soto Betawi, kuah santan gurih. Variasi rasa baru yang unik.' },
    ],
  },
  {
    name: 'Rumah & Dapur',
    slug: 'rumah-dapur',
    description: 'Peralatan rumah tangga dan dapur',
    categoryFields: [
      { fieldKey: 'material', label: 'Material', fieldType: 'select', required: true, options: ['Stainless Steel', 'Teflon', 'Keramik', 'Kaca', 'Plastik BPA Free', 'Kayu'] },
      { fieldKey: 'dimensi', label: 'Dimensi', fieldType: 'text', required: false },
    ],
    variantFields: [
      { fieldKey: 'warna', label: 'Warna', fieldType: 'select', required: true, options: ['Silver', 'Hitam', 'Putih', 'Merah', 'Biru', 'Green'] },
      { fieldKey: 'kapasitas', label: 'Kapasitas', fieldType: 'select', required: true, options: ['Small', 'Medium', 'Large'] },
    ],
    products: [
      { name: 'Panci Presto 5L', desc: 'Panci presto stainless steel 5L, inner pot anti lengket. Memasak lebih cepat.' },
      { name: 'Blender Portable USB', desc: 'Blender portable mini, charge USB. Cocok untuk smoothie di mana saja.' },
      { name: 'Set Pisau Dapur 6pcs', desc: 'Set pisau dapur stainless steel 6 buah, dengan block kayu. Tajam dan awet.' },
      { name: 'Rak Piring Lipat', desc: 'Rak piring lipat stainless steel, mudah disimpan. Cocok untuk dapur minimalis.' },
      { name: 'Wajan Anti Lengket 28cm', desc: 'Wajan anti lengket marble coating, diameter 28cm. Masak tanpa banyak minyak.' },
      { name: 'Termos Air Panas 1L', desc: 'Termos air panas vacuum insulation, tahan panas 12 jam. Bahan stainless steel.' },
      { name: 'Gelas Kaca Borosilicate', desc: 'Gelas kaca borosilicate tahan panas, kapasitas 350ml. Aman untuk hot & cold drinks.' },
      { name: 'Spatula Silicone Set', desc: 'Set spatula silicone heat resistant hingga 230°C, 5 pcs. Aman untuk teflon.' },
      { name: 'Container Makanan Kaca', desc: 'Container makanan kaca dengan tutup silicone, microwave & dishwasher safe.' },
      { name: 'Kitchen Timer Digital', desc: 'Timer digital magnet, alarm keras. Cocok untuk memasak dan baking.' },
    ],
  },
  {
    name: 'Kecantikan',
    slug: 'kecantikan',
    description: 'Skincare, makeup, dan produk kecantikan',
    categoryFields: [
      { fieldKey: 'jenis_kulit', label: 'Jenis Kulit', fieldType: 'select', required: true, options: ['Semua Jenis Kulit', 'Kulit Kering', 'Kulit Berminyak', 'Kulit Sensitif', 'Kulit Kombinasi'] },
      { fieldKey: 'exp_date', label: 'Tanggal Kadaluarsa', fieldType: 'text', required: true },
    ],
    variantFields: [
      { fieldKey: 'ukuran', label: 'Ukuran', fieldType: 'select', required: true, options: ['15ml', '30ml', '50ml', '100ml'] },
      { fieldKey: 'varian', label: 'Varian', fieldType: 'select', required: true, options: ['Original', 'Sensitive', 'Brightening', 'Anti-Aging', 'Acne Care'] },
    ],
    products: [
      { name: 'Serum Vitamin C 10%', desc: 'Serum Vitamin C 10%, mencerahkan dan melawan tanda penuaan. Cocok untuk semua jenis kulit.' },
      { name: 'Sunscreen SPF 50 PA+++', desc: 'Sunscreen mineral SPF 50, tidak lengket, tidak whitecast. Perlindungan UVA/UVB optimal.' },
      { name: 'Cleanser Gel Gentle', desc: 'Cleanser gel pH balanced, lembut untuk kulit. Membersihkan tanpa membuat kering.' },
      { name: 'Moisturizer Aloe Vera', desc: 'Moisturizer gel aloe vera, melembapkan dan menenangkan kulit. Ringan dan tidak berminyak.' },
      { name: 'Toner Rose Water', desc: 'Toner rose water natural, menyeimbangkan pH kulit. Menyegarkan dan mengecilkan pori.' },
      { name: 'Sheet Mask Collagen', desc: 'Sheet mask collagen, melembapkan intensif. Kulit tampak kenyal dan bercahaya.' },
      { name: 'Lip Tint Velvet', desc: 'Lip tint velvet finish, warna tahan lama. Ringan di bibir dan tidak cracking.' },
      { name: 'Eye Cream Anti Dark Circle', desc: 'Eye cream dengan retinol & caffeine, mengurangi dark circle dan garis halus.' },
      { name: 'Face Oil Rosehip', desc: 'Face oil rosehip organik, meregenerasi kulit. Kaya akan omega fatty acids.' },
      { name: 'Scrub Gula Coffee', desc: 'Scrub gula coffee, exfoliating alami. Membuang sel kulit mati dan menghaluskan.' },
    ],
  },
];

// ============================================================
// PUBLISHER DEFINITIONS
// ============================================================
const PUBLISHERS = [
  { fullName: 'Toko Fashion Nusantara', phone: '081234567890', address: 'Jl. Sudirman No. 123, Jakarta Selatan', provinceId: '31', cityId: '3171', districtId: '317101', postalCode: '12190' },
  { fullName: 'Elektronik Jaya Store', phone: '081234567891', address: 'Jl. Pemuda No. 45, Surabaya', provinceId: '35', cityId: '3578', districtId: '357801', postalCode: '60281' },
  { fullName: 'Kuliner Nusantara', phone: '081234567892', address: 'Jl. Malioboro No. 67, Yogyakarta', provinceId: '34', cityId: '3471', districtId: '347101', postalCode: '55271' },
  { fullName: 'Dapur Home Living', phone: '081234567893', address: 'Jl. Asia Afrika No. 89, Bandung', provinceId: '32', cityId: '3273', districtId: '327301', postalCode: '40261' },
  { fullName: 'Beauty Corner Shop', phone: '081234567894', address: 'Jl. Gatot Subroto No. 101, Denpasar', provinceId: '51', cityId: '5171', districtId: '517101', postalCode: '80231' },
];

const PUBLISHER_EMAILS = [
  'fashion@marketplace.com',
  'elektronik@marketplace.com',
  'kuliner@marketplace.com',
  'dapur@marketplace.com',
  'beauty@marketplace.com',
];

const IMAGE_BASE = 'https://picsum.photos/seed';

async function main() {
  console.log('Seeding categories, brands, publishers, and products...');

  // Ensure ADMIN_MAKER role exists
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN_MAKER' },
    update: {},
    create: { name: 'ADMIN_MAKER', description: 'Full admin access' },
  });

  // Ensure PRODUCT_PUBLISHER role exists
  const publisherRole = await prisma.role.upsert({
    where: { name: 'PRODUCT_PUBLISHER' },
    update: {},
    create: { name: 'PRODUCT_PUBLISHER', description: 'Product publisher' },
  });

  // Get admin user for schema createdBy
  const adminUser = await prisma.user.findFirst({ where: { email: 'admin@marketplace.com' } });

  // ============================================================
  // 1. CREATE CATEGORIES + FORM SCHEMAS
  // ============================================================
  const categoryMap: Record<string, string> = {};
  const catSchemaMap: Record<string, string> = {};
  const varSchemaMap: Record<string, string> = {};

  for (const cat of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        status: 'ACTIVE',
      },
    });
    categoryMap[cat.slug] = category.id;
    console.log(`  Category: ${cat.name} (${category.id})`);

    // Category Form Schema (published)
    const catSchema = await prisma.categoryFormSchema.upsert({
      where: { categoryId_version: { categoryId: category.id, version: 1 } },
      update: {},
      create: {
        categoryId: category.id,
        version: 1,
        status: 'PUBLISHED',
        createdBy: adminUser?.id,
      },
    });
    catSchemaMap[cat.slug] = catSchema.id;

    // Category Form Fields
    for (let i = 0; i < cat.categoryFields.length; i++) {
      const f = cat.categoryFields[i];
      await prisma.categoryFormField.upsert({
        where: { schemaId_fieldKey: { schemaId: catSchema.id, fieldKey: f.fieldKey } },
        update: {},
        create: {
          schemaId: catSchema.id,
          fieldKey: f.fieldKey,
          label: f.label,
          fieldType: f.fieldType,
          required: f.required,
          options: f.options || undefined,
          sortOrder: i + 1,
          status: 'ACTIVE',
        },
      });
    }

    // Variant Form Schema (published)
    const varSchema = await prisma.variantFormSchema.upsert({
      where: { categoryId_version: { categoryId: category.id, version: 1 } },
      update: {},
      create: {
        categoryId: category.id,
        version: 1,
        status: 'PUBLISHED',
        createdBy: adminUser?.id,
      },
    });
    varSchemaMap[cat.slug] = varSchema.id;

    // Variant Form Fields
    for (let i = 0; i < cat.variantFields.length; i++) {
      const f = cat.variantFields[i];
      await prisma.variantFormField.upsert({
        where: { schemaId_fieldKey: { schemaId: varSchema.id, fieldKey: f.fieldKey } },
        update: {},
        create: {
          schemaId: varSchema.id,
          fieldKey: f.fieldKey,
          label: f.label,
          fieldType: f.fieldType,
          required: f.required,
          options: f.options || undefined,
          sortOrder: i + 1,
          status: 'ACTIVE',
        },
      });
    }
    console.log(`    Form schemas created`);
  }

  // ============================================================
  // 2. CREATE BRANDS (one per category)
  // ============================================================
  const brandNames = ['BrandFashion', 'BrandElektronik', 'BrandKuliner', 'BrandDapur', 'BrandBeauty'];
  const brandSlugs = ['brand-fashion', 'brand-elektronik', 'brand-kuliner', 'brand-dapur', 'brand-beauty'];
  const brandIds: string[] = [];

  for (let i = 0; i < brandNames.length; i++) {
    const brand = await prisma.brand.upsert({
      where: { slug: brandSlugs[i] },
      update: {},
      create: {
        name: brandNames[i],
        slug: brandSlugs[i],
        status: 'ACTIVE',
      },
    });
    brandIds.push(brand.id);
    console.log(`  Brand: ${brandNames[i]} (${brand.id})`);
  }

  // ============================================================
  // 3. CREATE PUBLISHERS (user + role + profile)
  // ============================================================
  const publisherIds: string[] = [];
  const publisherPassword = await bcrypt.hash('publisher123', 12);

  for (let i = 0; i < PUBLISHERS.length; i++) {
    const pub = PUBLISHERS[i];
    const email = PUBLISHER_EMAILS[i];

    // Create user
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: publisherPassword,
        fullName: pub.fullName,
        phone: pub.phone,
        status: 'ACTIVE',
      },
    });

    // Assign publisher role
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: publisherRole.id } },
      update: {},
      create: { userId: user.id, roleId: publisherRole.id },
    });

    // Create publisher profile
    const profile = await prisma.publisherProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        fullName: pub.fullName,
        phone: pub.phone,
        address: pub.address,
        provinceId: pub.provinceId,
        cityId: pub.cityId,
        districtId: pub.districtId,
        postalCode: pub.postalCode,
      },
    });
    publisherIds.push(profile.id);
    console.log(`  Publisher: ${pub.fullName} (${profile.id})`);
  }

  // ============================================================
  // 4. CREATE PRODUCTS (10 per publisher, 2 per category)
  // ============================================================
  let productCount = 0;

  for (let pubIdx = 0; pubIdx < publisherIds.length; pubIdx++) {
    const publisherId = publisherIds[pubIdx];

    for (let catIdx = 0; catIdx < CATEGORIES.length; catIdx++) {
      const cat = CATEGORIES[catIdx];
      const categoryId = categoryMap[cat.slug];
      const catSchemaId = catSchemaMap[cat.slug];
      const varSchemaId = varSchemaMap[cat.slug];
      const brandId = brandIds[catIdx];

      // 2 products per category per publisher
      for (let prodIdx = 0; prodIdx < 2; prodIdx++) {
        const prodData = cat.products[prodIdx];
        const prodNum = pubIdx * 10 + catIdx * 2 + prodIdx + 1;
        const bestPrice = rand(25, 500) * 1000; // 25k - 500k
        const price = calcPrice(bestPrice);
        const slug = `${cat.slug}-${prodNum}-${slugify(prodData.name)}`;
        const sku = `SKU-${String(prodNum).padStart(4, '0')}`;
        const stock = rand(10, 200);

        // Build categoryFormData based on category fields
        const categoryFormData: Record<string, any> = {};
        for (const f of cat.categoryFields) {
          if (f.fieldType === 'select' && f.options) {
            categoryFormData[f.fieldKey] = f.options[rand(0, f.options.length - 1)];
          } else {
            categoryFormData[f.fieldKey] = `Info ${f.label} produk ${prodNum}`;
          }
        }

        const product = await prisma.product.upsert({
          where: { slug },
          update: {},
          create: {
            publisherId,
            categoryId,
            brandId,
            categoryFormSchemaId: catSchemaId,
            name: prodData.name,
            slug,
            description: prodData.desc,
            categoryFormData,
            bestPrice,
            adminFeePercentage: price.adminFeePct,
            adminFeeAmount: price.adminFeeAmt,
            marketplacePrice: price.marketplacePrice,
            sku,
            stock,
            hasVariants: true,
            status: 'APPROVED',
          },
        });

        // Product media (1 placeholder image)
        await prisma.productMedia.create({
          data: {
            productId: product.id,
            url: `${IMAGE_BASE}/prod${prodNum}/400/400`,
            altText: prodData.name,
            sortOrder: 1,
          },
        });

        // Create 3 variants per product
        const variant1Options = cat.variantFields[0].options!;
        const variant2Options = cat.variantFields[1].options!;

        for (let v1 = 0; v1 < Math.min(3, variant1Options.length); v1++) {
          for (let v2 = 0; v2 < Math.min(2, variant2Options.length); v2++) {
            const varName = `${variant1Options[v1]} / ${variant2Options[v2]}`;
            const varSku = `${sku}-V${v1}${v2}`;
            const varBestPrice = bestPrice + rand(-5, 15) * 1000;
            const varPrice = calcPrice(Math.max(varBestPrice, 10000));
            const varStock = rand(5, 100);

            const variantFormData = {
              [cat.variantFields[0].fieldKey]: variant1Options[v1],
              [cat.variantFields[1].fieldKey]: variant2Options[v2],
            };

            await prisma.productVariant.create({
              data: {
                productId: product.id,
                variantFormSchemaId: varSchemaId,
                variantFormData,
                sku: varSku,
                bestPrice: Math.max(varBestPrice, 10000),
                adminFeePercentage: varPrice.adminFeePct,
                adminFeeAmount: varPrice.adminFeeAmt,
                marketplacePrice: varPrice.marketplacePrice,
                stock: varStock,
                status: 'ACTIVE',
              },
            });
          }
        }

        productCount++;
      }
    }
  }

  console.log(`\nSeed completed!`);
  console.log(`  Categories: ${CATEGORIES.length}`);
  console.log(`  Brands: ${brandNames.length}`);
  console.log(`  Publishers: ${PUBLISHERS.length}`);
  console.log(`  Products: ${productCount}`);
  console.log(`  Variants: ~${productCount * 6} (6 per product)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
