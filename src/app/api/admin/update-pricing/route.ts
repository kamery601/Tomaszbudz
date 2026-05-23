import { NextRequest, NextResponse } from 'next/server';
import { getLoggedInAdmin } from '@/lib/auth';
import { applyPricingUpdates, type PricingUpdatePayload } from '@/lib/pricing';

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
    applyPricingUpdates({ cables, items });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Wystąpił błąd podczas zapisu cen.' }, { status: 500 });
  }
}
