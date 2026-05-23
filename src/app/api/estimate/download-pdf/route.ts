import { NextRequest, NextResponse } from 'next/server';
import { createEstimatePdf } from '@/lib/pdf';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const buffer = await createEstimatePdf(body);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="wycena_przylacza.pdf"'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Nie udało się wygenerować PDF.' }, { status: 500 });
  }
}
