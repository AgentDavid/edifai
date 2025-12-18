import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendWelcomeEmail(
  to: string,
  condoName: string,
  tempPassword: string
): Promise<void> {
  const isDev = !process.env.SMTP_USER;

  const mailOptions = {
    from: process.env.SMTP_FROM || '"EdifAI" <noreply@edifai.com>',
    to,
    subject: `Bienvenido a ${condoName} - Credenciales de Acceso`,
    html: `
      <h1>¡Bienvenido a EdifAI!</h1>
      <p>Se ha creado tu cuenta de administrador para <strong>${condoName}</strong>.</p>
      <p><strong>Email:</strong> ${to}</p>
      <p><strong>Contraseña temporal:</strong> ${tempPassword}</p>
      <p>Por favor, cambia tu contraseña después del primer inicio de sesión.</p>
    `,
  };

  if (isDev) {
    console.log("📧 [DEV] Email would be sent:");
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${mailOptions.subject}`);
    console.log(`   Temp Password: ${tempPassword}`);
    return;
  }

  await transporter.sendMail(mailOptions);
}
