import nodemailer from 'nodemailer';

export const sendInvoiceEmail = async (to, invoicePdfBuffer, invoiceNumber) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.EMAIL_PORT, 10) || 2525,
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || ''
    }
  });

  const mailOptions = {
    from: `"Procurement Department" <${process.env.EMAIL_USER || 'procurement@company.com'}>`,
    to,
    subject: `Invoice ${invoiceNumber} Attached`,
    text: `Hello,

Please find attached the Invoice ${invoiceNumber} from the Procurement Department.

Best regards,
Procurement MS`,
    attachments: [
      {
        filename: `invoice-${invoiceNumber}.pdf`,
        content: invoicePdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  return await transporter.sendMail(mailOptions);
};
