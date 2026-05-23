import { PrismaClient } from '@prisma/client';
import { pricingConfig } from '../src/lib/pricing';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.pricingItem.count();
  if (count === 0) {
    const items = Object.entries(pricingConfig.items).map(([keyName, item]) => ({
      keyName,
      displayName: item.name,
      unit: item.unit,
      priceNet: item.price.toFixed(2),
      priceType: item.type
    }));

    await prisma.pricingItem.createMany({ data: items });
    console.log('Seeded pricing items.');
  } else {
    console.log('Pricing items already seeded.');
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
