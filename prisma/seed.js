const { PrismaClient } = require('@prisma/client');

const pricingItems = [
  { keyName: 'excavation_earth', displayName: 'Wykop ręczny w ziemi', unit: 'm3', priceNet: '90.00', priceType: 'labor' },
  { keyName: 'excavation_paving', displayName: 'Prace w kostce brukowej (demontaż+odtworzenie)', unit: 'm3', priceNet: '225.00', priceType: 'combined' },
  { keyName: 'excavation_asphalt', displayName: 'Cięcie i odtworzenie asfaltu', unit: 'm3', priceNet: '342.00', priceType: 'combined' },
  { keyName: 'excavation_difficult', displayName: 'Prace w terenie trudnym/skalistym', unit: 'm3', priceNet: '270.00', priceType: 'combined' },
  { keyName: 'sand_bedding', displayName: 'Podsypka piaskowa', unit: 'm3', priceNet: '120.00', priceType: 'combined' },
  { keyName: 'cable_yky_5x240', displayName: 'Kabel YKY 5x240 mm2', unit: 'm', priceNet: '195.00', priceType: 'material' },
  { keyName: 'cable_laying', displayName: 'Układanie kabla w rowie', unit: 'm', priceNet: '25.00', priceType: 'labor' },
  { keyName: 'warning_tape', displayName: 'Folia ostrzegawcza niebieska z ułożeniem', unit: 'm', priceNet: '3.50', priceType: 'combined' },
  { keyName: 'backfill_and_compact', displayName: 'Zasypanie z zagęszczeniem mechanicznym', unit: 'm3', priceNet: '60.00', priceType: 'combined' },
  { keyName: 'conduit_pipe', displayName: 'Przepust osłonowy (Arota/DVR 110)', unit: 'm', priceNet: '45.00', priceType: 'material' },
  { keyName: 'cable_joint', displayName: 'Mufa kablowa przelotowa z montażem', unit: 'szt', priceNet: '450.00', priceType: 'combined' },
  { keyName: 'electrical_measurements', displayName: 'Pomiary elektryczne powykonawcze', unit: 'kpl', priceNet: '600.00', priceType: 'combined' },
  { keyName: 'documentation', displayName: 'Dokumentacja powykonawcza i zgłoszenie', unit: 'kpl', priceNet: '800.00', priceType: 'combined' }
];

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.pricingItem.count();
  if (count === 0) {
    await prisma.pricingItem.createMany({ data: pricingItems });
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
