import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const customerNames = [
  'Budi Santoso', 'Siti Rahayu', 'Ahmad Hidayat', 'Dewi Lestari', 'Rizki Pratama',
  'Andi Wijaya', 'Rina Susanti', 'Dedi Kurniawan', 'Maya Anggraini', 'Fajar Nugroho',
];

const emails = customerNames.map(n => `${n.toLowerCase().replace(/ /g, '.')}@email.com`);

const questions = [
  'Apakah ini barang original?',
  'Berapa lama garansinya?',
  'Apakah bisa COD?',
  'Stok masih ada tidak?',
  'Bahan dasarnya apa ya?',
  'Apakah ada ukuran lain?',
  'Berapa beratnya?',
  'Bisa dikirim hari ini?',
  'Apakah ada bonus?',
  'Warna lain ada tidak?',
];

const answers = [
  'Ya, kami jamin barang original 100%.',
  'Garansi resmi 1 tahun dari distributor.',
  'Untuk saat ini belum bisa COD, mohon maaf.',
  'Stok masih ready, silakan diorder.',
  'Bahan premium quality, nyaman dipakai.',
  'Untuk saat ini hanya ada ukuran ini.',
  'Berat sekitar 500gr, sudah termasuk packaging.',
  'Insyaallah bisa dikirim hari ini jika order sebelum jam 2 siang.',
  'Untuk saat ini belum ada bonus, tapi sering ada promo.',
  'Warna lain ready, silakan cek varian.',
];

const reviewTexts = [
  'Barang sesuai deskripsi, kualitas oke!',
  'Pengiriman cepat, packaging rapi. Puas!',
  'Produk bagus, harga sesuai kualitas.',
  'Sudah dipakai seminggu, masih awet.',
  'Warna agak beda dari foto, tapi overall lumayan.',
  'Pelayanan penjual ramah, responsif.',
  'Barang original, sesuai ekspektasi.',
  'Kualitas premium, recommended seller!',
  'Pengiriman agak lambat, tapi barang aman.',
  'Lumayan untuk harga segini.',
];

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomRating(): number {
  const weights = [5, 5, 5, 4, 4, 4, 3, 3, 2, 1];
  return weights[Math.floor(Math.random() * weights.length)];
}

async function main() {
  console.log('Deleting all existing reviews and discussions...');
  await prisma.review.deleteMany();
  await prisma.discussion.deleteMany();
  console.log('Done deleting.');

  const products = await prisma.product.findMany({
    where: { status: 'PUBLISHED' },
    include: { publisher: true },
  });

  if (products.length === 0) {
    console.log('No published products found.');
    return;
  }

  // Find or create a shared customer
  let customer = await prisma.customer.findFirst();
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name: 'Customer Test',
        email: 'customer@test.com',
        phone: '081234567890',
      },
    });
  }

  let discussionCount = 0;
  let reviewCount = 0;

  for (const product of products) {
    // --- Discussions (10 per product) ---
    for (let i = 0; i < 10; i++) {
      const name = customerNames[i % customerNames.length];
      const email = emails[i % emails.length];
      const hasAnswer = Math.random() > 0.2;

      await prisma.discussion.create({
        data: {
          productId: product.id,
          customerName: name,
          email,
          question: questions[i % questions.length],
          answer: hasAnswer ? answers[i % answers.length] : null,
          answeredBy: hasAnswer ? 'Customer Service' : null,
        },
      });
      discussionCount++;
    }

    // --- Reviews (10 per product) ---
    // Create a dummy order + orderItem for this product
    const order = await prisma.order.create({
      data: {
        orderNumber: `SEED-${product.id.slice(0, 8)}-${Date.now()}`,
        publisherId: product.publisherId,
        customerId: customer.id,
        subtotalBestPrice: product.bestPrice,
        subtotalMarketplacePrice: product.marketplacePrice,
        shippingCost: 15000,
        grandTotal: Number(product.marketplacePrice) + 15000,
        orderStatus: 'COMPLETED',
        paymentStatus: 'PAID',
      },
    });

    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: product.id,
        productNameSnapshot: product.name,
        skuSnapshot: product.sku,
        bestPriceSnapshot: product.bestPrice,
        adminFeePercentageSnapshot: product.adminFeePercentage,
        adminFeeAmountSnapshot: product.adminFeeAmount,
        marketplacePriceSnapshot: product.marketplacePrice,
        quantity: 1,
        subtotalBestPrice: product.bestPrice,
        subtotalMarketplacePrice: product.marketplacePrice,
        profit: 0,
      },
    });

    for (let i = 0; i < 10; i++) {
      const name = customerNames[i % customerNames.length];

      await prisma.review.create({
        data: {
          productId: product.id,
          orderId: order.id,
          orderItemId: orderItem.id,
          rating: randomRating(),
          reviewText: reviewTexts[i % reviewTexts.length],
          customerName: name,
          status: 'APPROVED',
        },
      });
      reviewCount++;
    }
  }

  console.log(`Seeded ${discussionCount} discussions and ${reviewCount} reviews across ${products.length} products.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
