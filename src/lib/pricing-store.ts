import { prisma } from './prisma';
import { pricingConfig } from './pricing';

async function ensurePricingTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PricingItem" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "keyName" TEXT NOT NULL UNIQUE,
      "displayName" TEXT NOT NULL,
      "unit" TEXT NOT NULL,
      "priceNet" REAL NOT NULL,
      "priceType" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "PricingItem"
      ADD COLUMN "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    `);
  } catch (error) {
    // Kolumna już istnieje albo baza jej nie wymaga.
  }
}

export async function seedPricingItemsIfEmpty() {
  await ensurePricingTable();

  const count = await prisma.pricingItem.count();

  if (count > 0) {
    return;
  }

  const cableItems = Object.entries(pricingConfig.cables).map(([keyName, item]) => ({
    keyName,
    displayName: item.name,
    unit: 'm',
    priceNet: item.price_net,
    priceType: 'material'
  }));

  const otherItems = Object.entries(pricingConfig.items).map(([keyName, item]) => ({
    keyName,
    displayName: item.name,
    unit: item.unit,
    priceNet: item.price,
    priceType: item.type
  }));

  for (const item of [...cableItems, ...otherItems]) {
    await prisma.pricingItem.upsert({
      where: { keyName: item.keyName },
      update: item,
      create: item
    });
  }
}

export async function getPricingItems() {
  await seedPricingItemsIfEmpty();

  return prisma.pricingItem.findMany({
    orderBy: { id: 'asc' }
  });
}

export async function updatePricingItemPrice(keyName: string, priceNet: number) {
  await ensurePricingTable();

  return prisma.pricingItem.update({
    where: { keyName },
    data: { priceNet }
  });
}
