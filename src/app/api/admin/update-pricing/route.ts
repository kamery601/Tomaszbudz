import { NextRequest, NextResponse } from 'next/server';
import { getLoggedInAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { pricingConfig } from '@/lib/pricing';
import { seedPricingItemsIfEmpty } from '@/lib/pricing-store';

export async function POST(request: NextRequest) {
  const admin = await getLoggedInAdmin();

  if (!admin) {
    return NextResponse.json({ success: false, error: 'Brak dostępu. Zaloguj się.' }, { status: 401 });
  }

  const payload = await request.json();
  const cables = payload?.cables ?? null;
  const items = payload?.items ?? null;

  if (!cables || !items) {
    return NextResponse.json({ success: false, error: 'Niepoprawne dane cennika.' }, { status: 400 });
  }

  try {
    await seedPricingItemsIfEmpty();

    const cableEntries = Object.entries(cables as Record<string, number>);
    const itemEntries = Object.entries(items as Record<string, number>);

    for (const [keyName, priceNet] of cableEntries) {
      const cable = pricingConfig.cables[keyName];

      if (!cable) {
        continue;
      }

      if (typeof priceNet !== 'number' || Number.isNaN(priceNet) || priceNet <= 0) {
        return NextResponse.json({ success: false, error: `Nieprawidłowa cena kabla: ${keyName}` }, { status: 400 });
      }

      await prisma.pricingItem.upsert({
        where: { keyName },
        update: {
          displayName: cable.name,
          unit: 'm',
          priceNet,
          priceType: 'material'
        },
        create: {
          keyName,
          displayName: cable.name,
          unit: 'm',
          priceNet,
          priceType: 'material'
        }
      });
    }

    for (const [keyName, priceNet] of itemEntries) {
      const item = pricingConfig.items[keyName];

      if (!item) {
        continue;
      }

      if (typeof priceNet !== 'number' || Number.isNaN(priceNet) || priceNet <= 0) {
        return NextResponse.json({ success: false, error: `Nieprawidłowa cena pozycji: ${keyName}` }, { status: 400 });
      }

      await prisma.pricingItem.upsert({
        where: { keyName },
        update: {
          displayName: item.name,
          unit: item.unit,
          priceNet,
          priceType: item.type
        },
        create: {
          keyName,
          displayName: item.name,
          unit: item.unit,
          priceNet,
          priceType: item.type
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin pricing save failed:', error);
    return NextResponse.json({ success: false, error: 'Wystąpił błąd podczas zapisu cen.' }, { status: 500 });
  }
}
