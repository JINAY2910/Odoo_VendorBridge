import ejs from 'ejs';
import path from 'path';

const mockInvoiceData = {
  clientName: "Ketut Susilo",
  clientPhone: "123-456-7890",
  clientEmail: "hello@reallygreatsite.com",
  clientAddress: "123 Anywhere St., Any City",
  invoiceNumber: "12345",
  date: "25 June 2022",
  items: [
    { description: "Logo Design", qty: 5, price: 100, total: 500 }
  ],
  subTotal: 7650,
  taxRate: 15,
  taxAmount: 1148,
  grandTotal: 8798,
  bankName: "Borcelle",
  accountNumber: "123-456-7890"
};

const templatePath = path.join(process.cwd(), 'server/templates/document.ejs');
try {
  const html = await ejs.renderFile(templatePath, {
    invoice: mockInvoiceData
  });
  console.log("SUCCESS");
} catch(e) {
  console.error("FAIL:", e.message);
}
