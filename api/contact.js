import { Resend } from 'resend';

// Mapping therapy modalities to human-readable labels
const MODALITY_LABELS = {
  individual: 'Terapia para traumas',
  sensoriomotriz: 'Terapia para personas neurodivergentes',
  pareja: 'Psicoterapia individual',
  duda: 'No lo sé aún / Tengo dudas',
};

// Basic sanitization to prevent HTML injection in emails
function sanitize(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function handler(req, res) {
  // Only POST method is permitted
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { name, email, phone, modality, message, _gotcha } = body;

    // 1. Anti-spam honeypot: if filled by a bot, silently return success
    if (_gotcha) {
      console.warn('Bot submission caught by honeypot (_gotcha).');
      return res.status(200).json({ success: true });
    }

    // 2. Required fields validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Por favor, introduce tu nombre completo.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Por favor, introduce una dirección de correo válida.' });
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 5) {
      return res.status(400).json({ error: 'Por favor, introduce un teléfono de contacto.' });
    }

    const cleanName = sanitize(name.trim());
    const cleanEmail = email.trim();
    const cleanPhone = sanitize(phone.trim());
    const cleanModality = MODALITY_LABELS[modality] || sanitize(modality || 'No especificado');
    const cleanMessage = sanitize((message || 'Sin mensaje adicional.').trim());
    const dateFormatted = new Date().toLocaleString('es-ES', {
      timeZone: 'Europe/Madrid',
      dateStyle: 'full',
      timeStyle: 'short',
    });

    const apiKey = process.env.RESEND_API_KEY;
    const emailTo = process.env.CONTACT_EMAIL_TO || 'mariajoseduartebarrio@gmail.com';
    // Default to Resend testing sender until a custom domain is verified
    const emailFrom = process.env.CONTACT_EMAIL_FROM || 'Maria José Duarte <onboarding@resend.dev>';

    // If no API key is configured (e.g. during initial local development or before setting Vercel env vars)
    if (!apiKey) {
      console.warn('[NOTICE] RESEND_API_KEY is not configured in environment variables.');
      console.log('Form submission received:', {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        modality: cleanModality,
        message: cleanMessage,
      });
      return res.status(200).json({
        success: true,
        simulation: true,
        message: 'Simulation mode: Message processed successfully (add RESEND_API_KEY to send actual emails).',
      });
    }

    const resend = new Resend(apiKey);

    // 3. Email 1: Notification for the psychologist (Maria José)
    const emailAdminPromise = resend.emails.send({
      from: emailFrom,
      to: [emailTo],
      replyTo: `${cleanName} <${cleanEmail}>`,
      subject: `Nueva solicitud de cita: ${cleanName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fdfbf7; color: #292524; margin: 0; padding: 20px; }
            .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e7e5e4; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            h2 { color: #1c1917; margin-top: 0; font-size: 22px; border-bottom: 2px solid #fbeed4; padding-bottom: 12px; }
            .item { margin-bottom: 16px; }
            .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #78716c; font-weight: bold; margin-bottom: 4px; }
            .value { font-size: 16px; color: #1c1917; }
            .message-box { background: #fdfbf7; border-left: 4px solid #f43f5e; padding: 16px; border-radius: 8px; font-style: italic; white-space: pre-wrap; }
            .footer { margin-top: 24px; font-size: 12px; color: #a8a29e; text-align: center; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>📩 Nueva solicitud de cita desde la web</h2>
            
            <div class="item">
              <div class="label">Paciente</div>
              <div class="value"><strong>${cleanName}</strong></div>
            </div>

            <div class="item">
              <div class="label">Email de contacto</div>
              <div class="value"><a href="mailto:${cleanEmail}">${cleanEmail}</a> (puedes responder directamente a este correo)</div>
            </div>

            <div class="item">
              <div class="label">Teléfono / WhatsApp</div>
              <div class="value"><a href="tel:${cleanPhone}">${cleanPhone}</a> | <a href="https://wa.me/${cleanPhone.replace(/\D/g, '')}" target="_blank">Abrir en WhatsApp</a></div>
            </div>

            <div class="item">
              <div class="label">Tipo de terapia seleccionada</div>
              <div class="value"><strong>${cleanModality}</strong></div>
            </div>

            <div class="item">
              <div class="label">Motivo o mensaje</div>
              <div class="message-box">${cleanMessage}</div>
            </div>

            <div class="footer">
              Recibido el ${dateFormatted} · Sitio web mariajoseduartebarriopsicologia.com
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // 4. Email 2: Automated confirmation for the patient
    const emailPatientPromise = resend.emails.send({
      from: emailFrom,
      to: [cleanEmail],
      replyTo: emailTo,
      subject: `Hemos recibido tu solicitud de cita | Maria José Duarte Barrio`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fdfbf7; color: #292524; margin: 0; padding: 20px; line-height: 1.6; }
            .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e7e5e4; padding: 36px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            h2 { color: #1c1917; margin-top: 0; font-size: 22px; }
            p { margin: 16px 0; font-size: 15px; color: #44403c; }
            .summary { background: #fdfbf7; border: 1px solid #f2ece4; border-radius: 12px; padding: 18px; margin: 24px 0; }
            .summary-title { font-weight: bold; font-size: 14px; color: #1c1917; margin-bottom: 8px; }
            .summary-item { font-size: 14px; color: #57534e; margin: 4px 0; }
            .signature { margin-top: 32px; border-top: 1px solid #f2ece4; padding-top: 20px; font-size: 14px; color: #78716c; }
            .emergency { font-size: 12px; color: #a8a29e; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Hola ${cleanName},</h2>
            <p>Muchas gracias por ponerte en contacto conmigo y por dar este primer paso.</p>
            <p>He recibido tu solicitud y revisaré tu mensaje con atención. Me pondré en contacto contigo en un plazo de <strong>24 a 48 horas laborables</strong> (a través de este correo electrónico o por WhatsApp/teléfono) para que podamos coordinar una fecha y hora que te venga bien.</p>
            
            <div class="summary">
              <div class="summary-title">Resumen de tu solicitud:</div>
              <div class="summary-item"><strong>Tipo de consulta:</strong> ${cleanModality}</div>
              <div class="summary-item"><strong>Teléfono indicado:</strong> ${cleanPhone}</div>
            </div>

            <p>Si necesitas añadir algún detalle más o tu disponibilidad horaria, puedes responder directamente a este correo.</p>

            <div class="signature">
              <strong>Maria José Duarte Barrio</strong><br>
              Psicóloga General Sanitaria · Colegiada<br>
              <a href="https://mariajoseduartebarriopsicologia.com" style="color: #f43f5e; text-decoration: none;">mariajoseduartebarriopsicologia.com</a>
            </div>

            <p class="emergency">
              <em>Nota: Este canal no es un servicio de urgencias médicas ni psicológicas. Si estás viviendo una situación de emergencia urgente, por favor contacta con el teléfono de emergencias 112 o la línea de atención a la conducta suicida 024.</em>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    // Dispatch both emails in parallel
    const [adminResult, patientResult] = await Promise.allSettled([
      emailAdminPromise,
      emailPatientPromise,
    ]);

    if (adminResult.status === 'rejected') {
      console.error('Error sending email to admin:', adminResult.reason);
      return res.status(500).json({ error: 'Hubo un problema al tramitar tu mensaje. Por favor, contáctanos por WhatsApp.' });
    }

    if (patientResult.status === 'rejected') {
      console.warn('Notice: Confirmation email to patient could not be delivered:', patientResult.reason);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Unhandled error in /api/contact:', err);
    return res.status(500).json({ error: 'Error interno del servidor. Por favor, inténtalo más tarde.' });
  }
}
