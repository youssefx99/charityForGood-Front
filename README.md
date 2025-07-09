# جمعية الخير - Charity Association Management Application

[![MERN Stack](https://img.shields.io/badge/stack-MERN-green)](https://mern.io/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **جمعية الخير** (Charity Association) is a comprehensive management system for charitable organizations, specifically designed for Arabic-speaking users with full Right-to-Left (RTL) support. The system aims to facilitate the management of members, payments, expenses, vehicles, trips, maintenance, and financial/administrative reports.

---

## 🏆 **Key Features**

- **Modern Arabic Interface** with RTL support and smooth user experience
- **Secure JWT Authentication** for user login and session management
- **Member Management** (add, edit, delete, search, statistics)
- **Payment Management** (membership fees, donations, event fees)
- **Expense Management** (categories, receipts, approvals)
- **Vehicle Management** (status, maintenance, usage)
- **Trip Management** (registration, tracking, statistics)
- **Comprehensive Reports** (financial, members, vehicles) with professional PDF export
- **Interactive Dashboard** with charts (Chart.js)
- **User Role System** (admin, employee, etc.)
- **File Upload Support** (images, receipts)
- **Responsive Design** for all devices

---

## 🚀 **Technology Stack**

### **Backend (Node.js/Express/MongoDB):**
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Multer (file uploads)
- jsPDF + autoTable (PDF generation)

### **Frontend (React/Redux):**
- React.js (CRA)
- Redux Toolkit
- React Bootstrap
- Axios
- Chart.js & react-chartjs-2
- Full RTL support

---

## 📦 **Project Structure**

```
charity-app-js/
  backend/
    controllers/
    models/
    routes/
    middleware/
    services/
    uploads/
    app.js
    ...
  frontend/
    src/
      components/
      features/
      pages/
      services/
      utils/
      App.js
      ...
```

---

## ⚡ **Local Development Setup**

### **Requirements:**
- Node.js >= 18
- MongoDB (local or Atlas)

### **1. Database Setup:**

- Ensure MongoDB is running locally or update the `MONGO_URI` environment variable in `.env`.
- You can use the seeder script to add sample data:

```bash
cd backend
npm run seed
```

### **2. Start Backend Server:**

```bash
cd backend
npm install
npm start
```

### **3. Start Frontend Application:**

```bash
cd ../frontend
npm install
npm start
```

- Application will be available at: `http://localhost:3000`
- Backend server at: `http://localhost:8888` (or 5000)

---

## 📝 **Usage Guide**

- **Login:** Use credentials from the database or created user data.
- **Dashboard:** View summaries, charts, and recent activities.
- **Member Management:** Add/edit/search/export reports.
- **Payments & Expenses:** Record, categorize, upload receipts.
- **Vehicles & Trips:** Track status, record maintenance, manage trips.
- **Reports:** Export professional PDF reports (financial, members, vehicles).

---

## 📄 **PDF Report Export**

- From the Reports page, select the date range and report type, then click "Download PDF".
- Reports include:
  - Financial summary (income, expenses, net profit)
  - Member statistics
  - Expense and income distribution
  - Vehicle statistics
  - Recent activities
  - Business insights and recommendations

---

## 👨‍💻 **Contributing & Development**

1. **Fork** the project on GitHub
2. Create a new branch:
   ```bash
   git checkout -b feature/feature-name
   ```
3. Make changes and commit:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/feature-name
   ```
4. Open a Pull Request for review

---

## 🛡️ **Security**

- Ensure sensitive environment variables are changed in production (`JWT_SECRET`, `MONGO_URI`)
- Use HTTPS in production environment
- Regularly review user permissions
