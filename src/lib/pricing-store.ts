import { prisma } from './prisma';
import { pricingConfig } from './pricing';

export async function ensurePricingSeed() {
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
  }
}

export async function getPricingItems() {
  await ensurePricingSeed();
  return prisma.pricingItem.findMany({ orderBy: { id: 'asc' } });
}

export async function updatePricingItemPrice(keyName: string, priceNet: number) {
  return prisma.pricingItem.update({
    where: { keyName },
    data: { priceNet }
  });
}
