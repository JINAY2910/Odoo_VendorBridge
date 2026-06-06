# 🌉 VendorBridge - Procurement & Vendor Management ERP

VendorBridge is a unified full-stack Procurement and Vendor Management ERP built with MySQL, Express, React, and Node.js. It digitizes the procurement lifecycle, automating RFQs, quotation comparisons, PO approvals, invoicing, and payment logs.

---

## 🌟 Key Features

- **Role-Based Access Control (RBAC):** Distinct dashboards and action permissions for **Admin**, **Manager / Approver**, **Procurement Officer**, and **Vendor** roles.
- **Upgraded Dashboards:** Real-time visibility into metrics, spending category distribution (IT, Manufacturing, Services, Logistics), and interactive filters:
  - **Currency Switcher:** Switch on the fly between **INR (₹)** and **USD ($)** with automated conversions.
  - **Timeframe Selector:** Dynamically group payments by **Weekly**, **Monthly**, **Yearly**, or **All** periods.
  - **Searchable Activity Logs:** Central timeline displaying recent audited events with a search filter.
- **Vendor Portal:** Vendors log in and are redirected to a dedicated `/vendor-portal` to view active RFQs and submit/edit bids.
- **Quotation Comparison:** Side-by-side bid reviews with automatic lowest price highlighting, rating indicators, and sorting options.
- **E2E Procurement Workflow:** Automatic Purchase Order (PO) creation upon Quotation approval, manager PO approvals, invoice generation, and balance tracking.
- **PDF Generation & Email Dispatch:** Dynamic PDF document creation using Puppeteer & EJS templates. Invoices can be downloaded locally, printed, or emailed directly via SMTP/Nodemailer.
- **Reports & Analytics:** Spending analytics, top vendors charts, and exportable summary reports in CSV format.

---

## 🛠 Tech Stack

### Frontend
- **Framework:** [React 19](https://react.dev/) + [Vite 6](https://vite.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Charts:** [Recharts](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Routing:** [React Router 7](https://reactrouter.com/)

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Server Framework:** [Express.js](https://expressjs.com/)
- **ORM:** [Sequelize v6](https://sequelize.org/)
- **Database:** [MySQL](https://www.mysql.com/)
- **Mailer:** [Nodemailer](https://nodemailer.com/)
- **PDF Compiler:** [Puppeteer](https://pptr.dev/) & [EJS Templates](https://ejs.co/)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
- Node.js (v18+ recommended)
- MySQL server (v8+)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd Odoo_VendorBridge
   ```

2. **Install unified dependencies:**
   The project is configured to run the backend server and frontend Vite builder concurrently.
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and configure your credentials:
   ```env
   PORT=3000
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   
   # MySQL Database Connection
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=vendorbridge_db
   
   # SMTP Email Settings (Nodemailer)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

4. **Start the Development Servers:**
   Boot up both the Express API and the Vite live reload environment concurrently:
   ```bash
   npm run dev
   ```
   The application will be served at `http://localhost:3000`.

---

## 📂 Project Structure

```text
├── server/
│   ├── config/         # Sequelize and DB configurations
│   ├── controllers/    # API Controllers (Auth, RFQs, POs, Payments, Reports, etc.)
│   ├── middleware/     # JWT Auth guards and permissions protection
│   ├── models/         # Sequelize Models (User, Vendor, RFQ, PurchaseOrder, Payment)
│   ├── routes/         # Express Router configurations
│   └── templates/      # EJS templates for invoice & document compiling
├── src/
│   ├── components/     # CustomSelect, Sidebar, Layouts and modals
│   ├── context/        # AuthContext for session management
│   ├── utils/          # Formatting helpers and blob downloading
│   └── pages/          # Views (Dashboard, Vendors, RFQs, Approvals, Invoices)
├── server.js           # Server starter and Vite middleware hook
├── package.json        
└── vite.config.js      # Vite project settings
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to open an issue or submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](file:///Users/jinayshah/Desktop/Work👀/STUDY/Projects/Odoo_VendorBridge/LICENSE) file for details.
