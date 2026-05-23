import { NextRequest, NextResponse } from 'next/server';
import { calculateMultiEstimate, calculateEstimate, type EstimateInput } from '@/lib/estimate-engine';
import { prisma } from '@/lib/prisma';
import { sendNotificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const length = Number(body.length ?? 0);
    const cableType = body.cableType as EstimateInput['cableType'];
    const terrainType = body.terrainType as EstimateInput['terrainType'];
    const depth = Number(body.depth ?? 0.7);
    const conduitsCount = Number(body.conduitsCount ?? 0);
    const clientData = body.clientData;

    if (!length || !clientData?.name || !clientData?.phone) {
      return NextResponse.json(
        { error: 'Brak wymaganych danych wyceny lub kontaktu.' },
        { status: 400 }
      );
    }

    if (!cableType || !terrainType) {
      return NextResponse.json({ error: 'Brak typu kabla lub rodzaju terenu.' }, { status: 400 });
    }

    const jobType = (body.jobType as string) || 'cable_connection';
    const calculation = jobType
      ? calculateMultiEstimate({
          jobType: jobType as any,
          length,
          cableType,
          terrainType,
          depth: depth > 0 ? depth : 0.7,
          conduitsCount: conduitsCount >= 0 ? conduitsCount : 0
        })
      : calculateEstimate({
          length,
          cableType,
          terrainType,
          depth: depth > 0 ? depth : 0.7,
          conduitsCount: conduitsCount >= 0 ? conduitsCount : 0
        });

    await prisma.leadEstimate.create({
      data: {
        clientName: clientData.name,
        clientPhone: clientData.phone,
        clientEmail: clientData.email ?? null,
        connectionLength: length,
        cableType,
        terrainType,
        depth,
        conduitsCount,
        calculatedNet: calculation.summary.totalNet.toFixed(2),
        calculatedBrutto: calculation.summary.totalBrutto.toFixed(2)
      }
    });
    // Send notification e-mail but do not block response if mail fails
    try {
      await sendNotificationEmail({
        subject: `[NOWE ZAPYTANIE - KALKULATOR] od: ${clientData.name}`,
        clientData: { name: clientData.name, phone: clientData.phone, email: clientData.email },
        calculation,
        jobType: jobType,
        length,
        cableType,
        terrainType,
        conduitsCount
      });
    } catch (err) {
      console.error('Email delivery failed, continuing:', err);
    }

    return NextResponse.json({ success: true, data: calculation }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Błąd przetwarzania kosztorysu.' }, { status: 500 });
  }
}
