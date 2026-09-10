import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN_MAKER' },
    update: {},
    create: { name: 'ADMIN_MAKER', description: 'Full admin access' },
  });

  const publisherRole = await prisma.role.upsert({
    where: { name: 'PRODUCT_PUBLISHER' },
    update: {},
    create: { name: 'PRODUCT_PUBLISHER', description: 'Product publisher' },
  });

  // Create initial admin
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@marketplace.com';
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      fullName: 'Admin Maker',
      status: 'ACTIVE',
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });

  // Create default admin fee setting
  await prisma.setting.upsert({
    where: { key: 'admin_fee_percentage' },
    update: {},
    create: {
      key: 'admin_fee_percentage',
      value: { percentage: 10 },
      updatedBy: admin.id,
    },
  });

  // Create 3 new categories with form schemas and variant schemas
  const categories = [
    {
      name: 'Olahraga',
      slug: 'olahraga',
      description: 'Peralatan dan aksesoris olahraga',
      categoryFields: [
        { fieldKey: 'jenis_olahraga', label: 'Jenis Olahraga', fieldType: 'SELECT', options: ['Sepak Bola', 'Basket', 'Renang', 'Fitness', 'Lari', 'Tennis'] },
        { fieldKey: 'bahan', label: 'Bahan', fieldType: 'SELECT', options: ['Polyester', 'Nylon', 'Spandex', 'Cotton'] },
        { fieldKey: 'ukuran_standar', label: 'Ukuran Standar', fieldType: 'SELECT', options: ['S', 'M', 'L', 'XL', 'XXL'] },
      ],
      variantFields: [
        { fieldKey: 'ukuran', label: 'Ukuran', fieldType: 'SELECT', options: ['S', 'M', 'L', 'XL', 'XXL'] },
        { fieldKey: 'warna', label: 'Warna', fieldType: 'SELECT', options: ['Hitam', 'Putih', 'Merah', 'Biru', 'Hijau'] },
      ],
    },
    {
      name: 'Otomotif',
      slug: 'otomotif',
      description: 'Suku cadang dan aksesoris kendaraan',
      categoryFields: [
        { fieldKey: 'merk_kendaraan', label: 'Merk Kendaraan', fieldType: 'SELECT', options: ['Toyota', 'Honda', 'Suzuki', 'Yamaha', 'Mitsubishi', 'Lainnya'] },
        { fieldKey: 'tipe_produk', label: 'Tipe Produk', fieldType: 'SELECT', options: ['Mesin', 'Kelistrikan', 'Body Parts', 'Interior', 'Eksterior'] },
        { fieldKey: 'kompatibilitas', label: 'Kompatibilitas', fieldType: 'TEXT', placeholder: 'Contoh: Avanza 2015-2020' },
      ],
      variantFields: [
        { fieldKey: 'warna', label: 'Warna', fieldType: 'SELECT', options: ['Hitam', 'Silver', 'Putih', 'Merah'] },
        { fieldKey: 'ukuran', label: 'Ukuran', fieldType: 'SELECT', options: ['Standard', 'Large', 'Universal'] },
      ],
    },
    {
      name: 'Mainan & Hobi',
      slug: 'mainan-hobi',
      description: 'Mainan anak-anak dan koleksi hobi',
      categoryFields: [
        { fieldKey: 'usia_target', label: 'Usia Target', fieldType: 'SELECT', options: ['0-2 tahun', '3-5 tahun', '6-8 tahun', '9-12 tahun', 'Dewasa'] },
        { fieldKey: 'jenis_mainan', label: 'Jenis Mainan', fieldType: 'SELECT', options: ['Edukatif', 'Action Figure', 'Puzzle', 'Remote Control', 'Board Game', 'Koleksi'] },
        { fieldKey: 'material', label: 'Material', fieldType: 'SELECT', options: ['Plastic', 'Kayu', 'Kain', 'Metal', 'Campuran'] },
        { fieldKey: 'sudah_termasuk_baterai', label: 'Sudah Termasuk Baterai', fieldType: 'BOOLEAN' },
      ],
      variantFields: [
        { fieldKey: 'warna', label: 'Warna', fieldType: 'SELECT', options: ['Multi Warna', 'Hitam', 'Putih', 'Merah', 'Biru', 'Pink'] },
        { fieldKey: 'ukuran', label: 'Ukuran', fieldType: 'SELECT', options: ['Small', 'Medium', 'Large'] },
      ],
    },
  ];

  for (const catData of categories) {
    const category = await prisma.category.upsert({
      where: { slug: catData.slug },
      update: {},
      create: {
        name: catData.name,
        slug: catData.slug,
        description: catData.description,
        status: 'ACTIVE',
      },
    });

    // Create category form schema
    const categorySchema = await prisma.categoryFormSchema.create({
      data: {
        categoryId: category.id,
        version: 1,
        status: 'PUBLISHED',
        createdBy: admin.id,
      },
    });

    for (let i = 0; i < catData.categoryFields.length; i++) {
      const field = catData.categoryFields[i];
      await prisma.categoryFormField.create({
        data: {
          schemaId: categorySchema.id,
          fieldKey: field.fieldKey,
          label: field.label,
          fieldType: field.fieldType,
          required: true,
          placeholder: field.placeholder,
          options: field.options || undefined,
          sortOrder: i + 1,
          status: 'ACTIVE',
        },
      });
    }

    // Create variant form schema
    const variantSchema = await prisma.variantFormSchema.create({
      data: {
        categoryId: category.id,
        version: 1,
        status: 'PUBLISHED',
        createdBy: admin.id,
      },
    });

    for (let i = 0; i < catData.variantFields.length; i++) {
      const field = catData.variantFields[i];
      await prisma.variantFormField.create({
        data: {
          schemaId: variantSchema.id,
          fieldKey: field.fieldKey,
          label: field.label,
          fieldType: field.fieldType,
          required: true,
          options: field.options || undefined,
          sortOrder: i + 1,
          status: 'ACTIVE',
        },
      });
    }
  }

  console.log('Seed completed:', { adminEmail, roles: ['ADMIN_MAKER', 'PRODUCT_PUBLISHER'], categories: categories.map(c => c.name) });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
