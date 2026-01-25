import nodemailer from "nodemailer";

export async function sendNotificationEmail(contact) {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    ADMIN_EMAIL,
    SITE_NAME = "PrepMantra",
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !ADMIN_EMAIL) {
    throw new Error("Email configuration is missing");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === "465",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"${SITE_NAME}" <${SMTP_USER}>`,
    to: ADMIN_EMAIL,
    subject: `New Contact Form Submission: ${contact.subject}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${contact.name}</p>
      <p><strong>Email:</strong> ${contact.email}</p>
      ${contact.phone ? `<p><strong>Phone:</strong> ${contact.phone}</p>` : ""}
      <p><strong>Subject:</strong> ${contact.subject}</p>
      <p><strong>Message:</strong></p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        ${contact.message.replace(/\n/g, "<br>")}
      </div>
      <p><strong>Submitted:</strong> ${contact.createdAt}</p>
      <p><strong>IP Address:</strong> ${contact.ipAddress}</p>
      <hr>
      <p>You can manage this submission in your admin dashboard.</p>
    `,
  };

  return transporter.sendMail(mailOptions);
}

export async function sendReplyEmail(contact, replyMessage, customSubject) {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SITE_NAME = "PrepMantra",
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error("Email configuration is missing");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === "465",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const subject = customSubject || `Re: ${contact.subject}`;

  const mailOptions = {
    from: `"${SITE_NAME}" <${SMTP_USER}>`,
    to: contact.email,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${contact.name},</h2>
        <div style="margin-bottom: 20px;">
          ${replyMessage.replace(/\n/g, "<br>")}
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #666;">
          <p>This is in response to your inquiry:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px;">
            <p><strong>Subject:</strong> ${contact.subject}</p>
            <p><strong>Message:</strong></p>
            <div style="margin-left: 15px; padding-left: 15px; border-left: 3px solid #ddd;">
              ${contact.message.replace(/\n/g, "<br>")}
            </div>
            <p><strong>Submitted:</strong> ${new Date(contact.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.8em; color: #999; text-align: center;">
          <p>© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}