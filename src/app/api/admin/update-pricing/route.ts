import { NextRequest, NextResponse } from 'next/server';
import { getLoggedInAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const entries = [
      ...Object.entries(cables as Record<string, number>),
      ...Object.entries(items as Record<string, number>)
    ];

    for (const [keyName, priceNet] of entries) {
      if (typeof priceNet !== 'number' || Number.isNaN(priceNet) || priceNet <= 0) {
        return NextResponse.json({ success: false, error: `Nieprawidłowa cena dla pozycji: ${keyName}` }, { status: 400 });
      }

      await prisma.pricingItem.update({
        where: { keyName },
        data: { priceNet }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Wystąpił błąd podczas zapisu cen.' }, { status: 500 });
  }
}
