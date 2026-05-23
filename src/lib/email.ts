import nodemailer from 'nodemailer';
import type { EstimateResult } from './estimate-engine';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? '465');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_TO = process.env.EMAIL_TO;

function jobLabel(jobType: string | undefined) {
  const map: Record<string, string> = {
    cable_connection: 'Nowe przyłącze kablowe',
    move_meter: 'Wyniesienie licznika',
    overhead_to_cable: 'Przejście napowietrzne → kabel ziemny',
    power_increase: 'Zwiększenie mocy / modernizacja',
    building_site: 'Prąd budowlany (Erbetka)'
  };
  return jobType ? (map[jobType] ?? jobType) : 'Przyłącze (nieokreślone)';
}

export async function sendNotificationEmail(opts: {
  subject: string;
  clientData: { name?: string; phone?: string; email?: string };
  calculation: EstimateResult;
  jobType?: string;
  length?: number;
  cableType?: string;
  terrainType?: string;
  conduitsCount?: number;
}) {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !EMAIL_TO) {
    console.warn('SMTP not configured - skipping email send');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: true,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  const { clientData, calculation, subject, jobType, length, cableType, terrainType, conduitsCount } = opts;

  const itemsHtml = calculation.items
    .map(
      (it) => `
      <tr style="border-bottom:1px solid #e5e7eb">
        <td style="padding:8px">${it.name}</td>
        <td style="padding:8px;text-align:center">${it.qty}</td>
        <td style="padding:8px;text-align:right">${it.priceNet.toFixed(2)} PLN</td>
        <td style="padding:8px;text-align:right">${it.totalNet.toFixed(2)} PLN</td>
      </tr>`
    )
    .join('');

  const html = `
  <div style="font-family:Inter, Roboto, Arial, sans-serif;max-width:680px;margin:0 auto;color:#111">
    <h2 style="background:#fde68a;padding:12px;border-radius:8px">[NOWE ZAPYTANIE - KALKULATOR] od: ${clientData.name ?? '-'} </h2>

    <section style="margin-top:12px;padding:12px;background:#fff;border-radius:8px;border:1px solid #e5e7eb">
      <h3 style="margin:0 0 8px 0">Dane kontaktowe</h3>
      <p style="margin:3px 0"><strong>Imię:</strong> ${clientData.name ?? '-'}</p>
      <p style="margin:3px 0"><strong>Telefon:</strong> <a href="tel:${clientData.phone ?? ''}">${clientData.phone ?? '-'}</a></p>
      <p style="margin:3px 0"><strong>E-mail:</strong> ${clientData.email ?? '-'}</p>
    </section>

    <section style="margin-top:12px;padding:12px;background:#fff;border-radius:8px;border:1px solid #e5e7eb">
      <h3 style="margin:0 0 8px 0">Szczegóły zlecenia</h3>
      <p style="margin:3px 0"><strong>Zakres prac:</strong> ${jobLabel(jobType)}</p>
      <p style="margin:3px 0"><strong>Rodzaj kabla:</strong> ${cableType ?? '-'}</p>
      <p style="margin:3px 0"><strong>Długość:</strong> ${length ?? 0} m</p>
      <p style="margin:3px 0"><strong>Liczba przepustów:</strong> ${conduitsCount ?? 0}</p>
      <p style="margin:3px 0"><strong>Rodzaj terenu:</strong> ${terrainType ?? '-'}</p>
    </section>

    <section style="margin-top:12px;padding:12px;background:#fff;border-radius:8px;border:1px solid #e5e7eb">
      <h3 style="margin:0 0 8px 0">Szczegóły kosztorysu</h3>
      <div style="overflow:auto">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="text-align:left;background:#f8fafc">
              <th style="padding:8px">Pozycja</th>
              <th style="padding:8px;text-align:center">Ilość</th>
              <th style="padding:8px;text-align:right">Cena netto</th>
              <th style="padding:8px;text-align:right">Wartość netto</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <div style="margin-top:12px;display:flex;justify-content:flex-end;gap:16px">
        <div style="text-align:right">
          <div><strong>Wartość netto:</strong> ${calculation.summary.totalNet.toFixed(2)} PLN</div>
          <div><strong>VAT:</strong> ${calculation.summary.vat.toFixed(2)} PLN</div>
          <div style="font-size:18px;margin-top:6px"><strong>Orientacyjna kwota brutto:</strong> ${calculation.summary.totalBrutto.toFixed(2)} PLN</div>
        </div>
      </div>
    </section>

    <footer style="margin-top:14px;font-size:12px;color:#6b7280">Wiadomość wygenerowana automatycznie przez Kalkulator Elektro-Podhale.</footer>
  </div>
  `;

  const text = `NOWE ZAPYTANIE od: ${clientData.name ?? '-'}\nTelefon: ${clientData.phone ?? '-'}\nE-mail: ${clientData.email ?? '-'}\nKwota brutto: ${calculation.summary.totalBrutto.toFixed(2)} PLN`;

  const mailOptions = {
    from: SMTP_USER,
    to: EMAIL_TO,
    subject,
    text,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.info('Notification email sent to admin:', info.messageId);
  } catch (err) {
    console.error('Failed to send notification email to admin:', err);
    // do not throw - email failures should not block API response
  }

  // If client provided an email, send a confirmation/copy
  const clientEmail = clientData?.email?.trim();
  if (clientEmail) {
    const clientSubject = 'Tomasz Budz Elektro-Podhale - Dziękujemy za przesłanie zapytania';
    const clientHtml = `
      <div style="font-family:Inter, Roboto, Arial, sans-serif;max-width:680px;margin:0 auto;color:#111">
        <h2 style="background:#fde68a;padding:12px;border-radius:8px">Tomasz Budz Elektro-Podhale - Dziękujemy za przesłanie zapytania</h2>
        <section style="margin-top:12px;padding:12px;background:#fff;border-radius:8px;border:1px solid #e5e7eb">
          <p> Dziękujemy za skorzystanie z naszego kalkulatora. Twój orientacyjny kosztorys został zarejestrowany w naszym systemie. Pan Tomasz zapozna się ze specyfikacją techniczną i skontaktuje się z Tobą telefonicznie w ciągu 24 godzin w celu omówienia szczegółów oraz ustalenia terminu bezpłatnej wizji lokalnej w terenie.</p>
        </section>

        <section style="margin-top:12px;padding:12px;background:#fff;border-radius:8px;border:1px solid #e5e7eb">
          <h3 style="margin:0 0 8px 0">Twój kosztorys (orientacyjny)</h3>
          <div style="overflow:auto">
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <thead>
                <tr style="text-align:left;background:#f8fafc">
                  <th style="padding:8px">Pozycja</th>
                  <th style="padding:8px;text-align:center">Ilość</th>
                  <th style="padding:8px;text-align:right">Cena netto</th>
                  <th style="padding:8px;text-align:right">Wartość netto</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>
          <div style="margin-top:12px;display:flex;justify-content:flex-end;gap:16px">
            <div style="text-align:right">
              <div><strong>Wartość netto:</strong> ${calculation.summary.totalNet.toFixed(2)} PLN</div>
              <div><strong>VAT:</strong> ${calculation.summary.vat.toFixed(2)} PLN</div>
              <div style="font-size:18px;margin-top:6px"><strong>Orientacyjna kwota brutto:</strong> ${calculation.summary.totalBrutto.toFixed(2)} PLN</div>
            </div>
          </div>
        </section>
      </div>
    `;

    try {
      const info2 = await transporter.sendMail({
        from: SMTP_USER,
        to: clientEmail,
        subject: clientSubject,
        text: text,
        html: clientHtml
      });
      console.info('Confirmation email sent to client:', info2.messageId);
    } catch (err) {
      console.error('Failed to send confirmation email to client:', err);
      // do not throw
    }
  }
}

export default sendNotificationEmail;
