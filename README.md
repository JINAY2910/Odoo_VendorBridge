# 📦 MERN Procurement & Invoice Management System

A robust, full-stack Procurement ERP and Management System built on the MERN stack (MongoDB, Express, React, Node.js). This platform streamlines the business procurement workflow from Quotation generation through Purchase Orders, Invoicing, and Payment Tracking.

---

## 🌟 Features

- **Role-Based Access Control (RBAC):** Distinct dashboards and action permissions for **Admin**, **Manager**, and **User** roles.
- **Quotation Workflow:** Create, review, approve, or reject vendor quotations with detailed line items and taxes.
- **Purchase Orders (POs):** Automatically convert approved quotations directly into POs.
- **Invoicing:** Link invoices to purchase orders with dynamic tracking of unit prices, quantities, and balances.
- **Payment Processing:** Integrated payment entry system that mathematically controls the remaining balance and strictly blocks over-payments.
- **PDF Generation:** Automated, premium-styled, dynamic PDF downloads for invoices and purchase orders via Puppeteer & EJS templates.
- **Dynamic Dashboards:** Real-time visibility into Pending Approvals, Pending Payments, and Monthly Spend metrics dynamically fetched via the backend API.

---

## 🛠 Tech Stack

### Frontend
- **Framework:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Routing:** [React Router](https://reactrouter.com/)

### Backend
- **Server:** [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/)
- **PDF Generation:** [Puppeteer](https://pptr.dev/) & [EJS](https://ejs.co/)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
- Node.js (v16+ recommended)
- MongoDB (running locally or a cloud Atlas URI)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd <project-directory>
   ```

2. **Install dependencies:**
   Since the backend and frontend are unified in this repository, simply run:
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your configuration credentials:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

4. **Start the Development Server:**
   This project uses Vite middleware to serve both the React app and Express API concurrently.
   ```bash
   npm run dev
   ```
   *The application will boot up at `http://localhost:3000`.*

---

## 📂 Project Structure

```text
├── server/
│   ├── config/         # Database configurations
│   ├── controllers/    # API Request Handlers (Auth, PDF, Payments, etc.)
│   ├── middleware/     # JWT Auth guards and protection
│   ├── models/         # Mongoose Schemas (User, Invoice, Quotation, Payment)
│   ├── routes/         # Express routing configurations
│   └── templates/      # EJS templates for PDF generation
├── src/
│   ├── components/     # Reusable React components (Layouts, Modals)
│   ├── context/        # React Context wrappers (AuthContext)
│   └── pages/          # Application views (Dashboard, Invoices, Login)
├── server.js           # Main Express server entry point
├── package.json        
└── vite.config.js      # Vite compilation configuration
```

---

## 📜 Role Workflows

- **User**: Can draft Quotations from specific Vendors and track their assigned metrics.
- **Manager**: Responsible for reviewing "Pending Quotations" & "Pending POs" on their dashboard, where they can formally execute the *Approve*, *Reject*, or *Convert to PO* commands.
- **Admin**: Views high-level aggregated data such as total system users, total monetary flow, and governs full access control over all entities.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check the issues page or submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
