import nodemailer from "nodemailer";

// Configure your email transporter using your existing environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

// Format currency
const formatCurrency = (amount, currency) => {
  // Convert to number if it's a string or other type
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  
  if (currency === "USD") {
    return `$${numAmount.toFixed(2)}`;
  }
  return `₹${numAmount.toFixed(2)}`;
};

// Format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Send order confirmation email
export async function sendOrderConfirmationEmail({
  userEmail,
  userName,
  orderId,
  orderNumber,
  items,
  totalAmount,
  currency,
  paymentMethod,
  expiryDate,
}) {
  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.name}</strong>
        ${
          item.code
            ? `<br><span style="color: #6b7280; font-size: 14px;">Code: ${item.code}</span>`
            : ""
        }
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ${formatCurrency(item.price, currency)}
      </td>
    </tr>
  `
    )
    .join("");

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Order Confirmed!</h1>
      <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Thank you for your purchase</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      
      <!-- Greeting -->
      <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">
        Hi ${userName},
      </p>
      
      <p style="font-size: 16px; color: #374151; margin: 0 0 30px 0;">
        Your order has been successfully confirmed! You can now access your purchased courses.
      </p>

      <!-- Order Details Box -->
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Order Details</h2>
        <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
          <strong style="color: #374151;">Order Number:</strong> ${orderNumber}
        </p>
        <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
          <strong style="color: #374151;">Order ID:</strong> ${orderId}
        </p>
        <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
          <strong style="color: #374151;">Payment Method:</strong> ${paymentMethod.toUpperCase()}
        </p>
        <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
          <strong style="color: #374151;">Order Date:</strong> ${formatDate(
            new Date()
          )}
        </p>
      </div>

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 12px; text-align: left; color: #374151; font-weight: 600;">Item</th>
            <th style="padding: 12px; text-align: right; color: #374151; font-weight: 600;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td style="padding: 16px 12px; font-weight: bold; color: #1f2937; font-size: 16px; border-top: 2px solid #374151;">
              Total
            </td>
            <td style="padding: 16px 12px; font-weight: bold; color: #1f2937; font-size: 16px; text-align: right; border-top: 2px solid #374151;">
              ${formatCurrency(totalAmount, currency)}
            </td>
          </tr>
        </tfoot>
      </table>

      <!-- Important Notice -->
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 30px; border-radius: 4px;">
        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
          <strong>⏰ Important:</strong> Your access to these courses and materials will expire on <strong>${formatDate(
            expiryDate
          )}</strong> (90 days from purchase). Please download any PDFs and complete your courses before this date.
        </p>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${
          process.env.NEXT_PUBLIC_APP_URL || "https://yourwebsite.com"
        }/dashboard/my-courses" 
           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Access Your Courses
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
        Need help? Contact us at <a href="mailto:support@yourwebsite.com" style="color: #667eea; text-decoration: none;">support@yourwebsite.com</a>
      </p>
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        © ${new Date().getFullYear()} Your Company. All rights reserved.
      </p>
    </div>

  </div>
</body>
</html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: `Order Confirmation - ${orderNumber}`,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
}

// Send order update email (when PDF URL changes)
export async function sendOrderUpdateEmail({
  userEmail,
  userName,
  orderId,
  orderNumber,
  pdfChanges,
  expiryDate,
}) {
  const changesHtml = pdfChanges
    .map(
      (change) => `
    <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px;">${change.courseName}</h3>
      <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px;">
        A new PDF has been uploaded for this course.
      </p>
      <a href="${change.newUrl}" 
         style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">
        📥 Download New PDF
      </a>
    </div>
  `
    )
    .join("");

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Updated</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Order Updated!</h1>
      <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">New materials available</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      
      <!-- Greeting -->
      <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">
        Hi ${userName},
      </p>
      
      <p style="font-size: 16px; color: #374151; margin: 0 0 30px 0;">
        Good news! Your order <strong>${orderNumber}</strong> has been updated with new downloadable materials.
      </p>

      <!-- PDF Changes -->
      ${changesHtml}

      <!-- Important Notice -->
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 30px 0; border-radius: 4px;">
        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
          <strong>⏰ Reminder:</strong> Your access expires on <strong>${formatDate(
            expiryDate
          )}</strong>. Please download the materials before this date.
        </p>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${
          process.env.NEXT_PUBLIC_APP_URL || "https://yourwebsite.com"
        }/dashboard/my-courses" 
           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
          View All My Courses
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
        Need help? Contact us at <a href="mailto:support@yourwebsite.com" style="color: #10b981; text-decoration: none;">support@yourwebsite.com</a>
      </p>
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        © ${new Date().getFullYear()} Your Company. All rights reserved.
      </p>
    </div>

  </div>
</body>
</html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: `Order Updated - ${orderNumber} - New Materials Available`,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
}