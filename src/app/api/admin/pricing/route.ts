import { NextRequest, NextResponse } from 'next/server';
import { getPricingItems, updatePricingItemPrice } from '@/lib/pricing-store';

function verifyAdmin(request: NextRequest) {
  const password = request.headers.get('x-admin-password');
  return password && password === process.env.ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = await getPricingItems();
  return NextResponse.json({ items: items.map((item: any) => ({
    ...item,
    priceNet: Number(item.priceNet)
  })) });
}

export async function PUT(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { keyName, priceNet } = body;

  if (!keyName || typeof priceNet !== 'number' || priceNet <= 0) {
    return NextResponse.json({ error: 'Nieprawidłowe dane.' }, { status: 400 });
  }

  const item = await updatePricingItemPrice(keyName, priceNet);
  return NextResponse.json({ success: true, item: { ...item, priceNet: Number(item.priceNet) } });
}
