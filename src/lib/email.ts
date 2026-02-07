import { Resend } from 'resend'

let resend: Resend | null = null

function getResendClient() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const client = getResendClient()
  const fromEmail = process.env.EMAIL_FROM || 'SPHERA TILE <onboarding@resend.dev>'

  try {
    const { data, error } = await client.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Error sending email:', error)
      throw new Error('Error al enviar el email')
    }

    return data
  } catch (error) {
    console.error('Error in sendEmail:', error)
    throw error
  }
}

// Email templates
export function getPasswordResetEmail(nombre: string, resetUrl: string) {
  return {
    subject: 'Recuperar contraseña - SPHERA TILE',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #1b5e20; font-size: 28px; margin: 0;">SPHERA TILE</h1>
            </div>

            <h2 style="color: #333; font-size: 20px; margin-bottom: 16px;">Hola ${nombre},</h2>

            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
              Haz clic en el siguiente botón para crear una nueva contraseña:
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}"
                 style="display: inline-block; background-color: #1b5e20; color: white;
                        padding: 16px 32px; border-radius: 8px; text-decoration: none;
                        font-weight: 600; font-size: 16px;">
                Restablecer contraseña
              </a>
            </div>

            <p style="color: #999; font-size: 14px; line-height: 1.6;">
              Si no solicitaste este cambio, puedes ignorar este email.
              El enlace expirará en 1 hora.
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">

            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} SPHERA TILE. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}

export function getWelcomeEmail(nombre: string, loginUrl: string, idioma: string = 'es') {
  const texts: Record<string, { subject: string; greeting: string; body: string; button: string; rights: string }> = {
    es: {
      subject: 'Bienvenido a SPHERA TILE',
      greeting: `¡Bienvenido ${nombre}!`,
      body: 'Tu cuenta ha sido creada correctamente. Ya puedes acceder a nuestro catálogo y realizar pedidos.',
      button: 'Acceder a mi cuenta',
      rights: 'Todos los derechos reservados.',
    },
    en: {
      subject: 'Welcome to SPHERA TILE',
      greeting: `Welcome ${nombre}!`,
      body: 'Your account has been successfully created. You can now access our catalog and place orders.',
      button: 'Access my account',
      rights: 'All rights reserved.',
    },
    ar: {
      subject: 'مرحبًا بك في SPHERA TILE',
      greeting: `!${nombre} مرحبًا`,
      body: 'تم إنشاء حسابك بنجاح. يمكنك الآن الوصول إلى الكتالوج الخاص بنا وتقديم الطلبات.',
      button: 'الوصول إلى حسابي',
      rights: 'جميع الحقوق محفوظة.',
    },
  }

  const t = texts[idioma] || texts.es
  const dir = idioma === 'ar' ? 'rtl' : 'ltr'

  return {
    subject: t.subject,
    html: `
      <!DOCTYPE html>
      <html dir="${dir}">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; direction: ${dir};">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #1b5e20; font-size: 28px; margin: 0;">SPHERA TILE</h1>
            </div>

            <h2 style="color: #333; font-size: 20px; margin-bottom: 16px;">${t.greeting}</h2>

            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              ${t.body}
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${loginUrl}"
                 style="display: inline-block; background-color: #1b5e20; color: white;
                        padding: 16px 32px; border-radius: 8px; text-decoration: none;
                        font-weight: 600; font-size: 16px;">
                ${t.button}
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">

            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} SPHERA TILE. ${t.rights}
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}

export function getOrderConfirmationEmail(
  nombre: string,
  numeroPedido: string,
  total: string,
  pedidoUrl: string
) {
  return {
    subject: `Pedido ${numeroPedido} confirmado - SPHERA TILE`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #1b5e20; font-size: 28px; margin: 0;">SPHERA TILE</h1>
            </div>

            <div style="text-align: center; margin-bottom: 24px;">
              <div style="width: 64px; height: 64px; background: #e8f5e9; border-radius: 50%;
                          display: inline-flex; align-items: center; justify-content: center;">
                <span style="color: #1b5e20; font-size: 32px;">✓</span>
              </div>
            </div>

            <h2 style="color: #333; font-size: 20px; margin-bottom: 16px; text-align: center;">
              ¡Pedido recibido!
            </h2>

            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 24px; text-align: center;">
              Hola ${nombre}, hemos recibido tu pedido correctamente.
            </p>

            <div style="background: #f5f5f5; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px 0; color: #999; font-size: 14px;">Número de pedido</p>
              <p style="margin: 0 0 16px 0; color: #333; font-size: 18px; font-weight: 600;">${numeroPedido}</p>
              <p style="margin: 0 0 8px 0; color: #999; font-size: 14px;">Total</p>
              <p style="margin: 0; color: #1b5e20; font-size: 24px; font-weight: 700;">${total}</p>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${pedidoUrl}"
                 style="display: inline-block; background-color: #1b5e20; color: white;
                        padding: 16px 32px; border-radius: 8px; text-decoration: none;
                        font-weight: 600; font-size: 16px;">
                Ver mi pedido
              </a>
            </div>

            <p style="color: #999; font-size: 14px; line-height: 1.6; text-align: center;">
              Te notificaremos cuando tu pedido esté en camino.
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">

            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} SPHERA TILE. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}

export function getDataDeletionRequestEmail(
  clienteNombre: string,
  clienteEmail: string,
  clienteCodigo: string | null
) {
  return {
    subject: `Solicitud de borrado de datos - ${clienteNombre}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #1b5e20; font-size: 28px; margin: 0;">SPHERA TILE</h1>
            </div>

            <div style="background: #fff3e0; border: 1px solid #ffe0b2; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #e65100; font-weight: 600; margin: 0;">Solicitud de borrado de datos (GDPR/RGPD)</p>
            </div>

            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              El siguiente cliente ha solicitado el borrado de sus datos personales conforme a la legislaci\u00f3n de protecci\u00f3n de datos:
            </p>

            <div style="background: #f5f5f5; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px 0; color: #999; font-size: 14px;">Nombre</p>
              <p style="margin: 0 0 16px 0; color: #333; font-size: 16px; font-weight: 600;">${clienteNombre}</p>
              <p style="margin: 0 0 8px 0; color: #999; font-size: 14px;">Email</p>
              <p style="margin: 0 0 16px 0; color: #333; font-size: 16px;">${clienteEmail}</p>
              ${clienteCodigo ? `
              <p style="margin: 0 0 8px 0; color: #999; font-size: 14px;">C\u00f3digo de cliente</p>
              <p style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">${clienteCodigo}</p>
              ` : ''}
            </div>

            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Seg\u00fan la normativa RGPD, dispones de <strong>30 d\u00edas</strong> para atender esta solicitud.
              Recuerda verificar si existen obligaciones legales (facturas, contratos) que requieran conservar ciertos datos.
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">

            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              \u00a9 ${new Date().getFullYear()} SPHERA TILE. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}

export function getInvoiceEmail(
  nombre: string,
  numeroFactura: string,
  total: string,
  fechaVencimiento: string,
  facturaUrl: string
) {
  return {
    subject: `Factura ${numeroFactura} - SPHERA TILE`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #1b5e20; font-size: 28px; margin: 0;">SPHERA TILE</h1>
            </div>

            <h2 style="color: #333; font-size: 20px; margin-bottom: 16px;">Hola ${nombre},</h2>

            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Te enviamos la factura correspondiente a tu pedido.
            </p>

            <div style="background: #f5f5f5; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px 0; color: #999; font-size: 14px;">Número de factura</p>
              <p style="margin: 0 0 16px 0; color: #333; font-size: 18px; font-weight: 600;">${numeroFactura}</p>
              <p style="margin: 0 0 8px 0; color: #999; font-size: 14px;">Total</p>
              <p style="margin: 0 0 16px 0; color: #1b5e20; font-size: 24px; font-weight: 700;">${total}</p>
              <p style="margin: 0 0 8px 0; color: #999; font-size: 14px;">Fecha de vencimiento</p>
              <p style="margin: 0; color: #333; font-size: 16px;">${fechaVencimiento}</p>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${facturaUrl}"
                 style="display: inline-block; background-color: #1b5e20; color: white;
                        padding: 16px 32px; border-radius: 8px; text-decoration: none;
                        font-weight: 600; font-size: 16px;">
                Ver factura
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">

            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} SPHERA TILE. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}
