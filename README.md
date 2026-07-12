# AssetFlow

AssetFlow is a comprehensive, enterprise-grade IT Asset Management system built to streamline the tracking, allocation, maintenance, and auditing of physical company resources.

## 🚀 Features

AssetFlow supports the complete lifecycle of corporate IT assets, offering advanced capabilities to keep equipment tracking seamless and accountable.

* **Dashboard & KPI Analytics:** High-level metrics showing total assets, allocation percentages, overdue returns, and real-time activity charts.
* **Role-Based Access Control (RBAC):** Secure ecosystem with distinct permission sets for Admins, Managers, and Employees using stateless JWT authentication.
* **Asset Onboarding & Tracking:** Easily log new hardware, categorize by type, track serial numbers, and assign them to specific employees or departments.
* **Shared Resource Booking:** A calendar-based booking system for shared assets (like projectors, cameras, and company vehicles) to prevent scheduling conflicts.
* **Maintenance & Repair Tracking:** Ticketing system for damaged equipment with lifecycle statuses (Pending, In Progress, Resolved).
* **Physical Audit Cycles:** Run structured physical verification rounds based on department or location. Automatically flags discrepancies (Missing, Damaged) and generates actionable reports.
* **Activity Logs & Notifications:** A global audit log tracking who did what and when, along with targeted real-time alerts for asset assignments and lifecycle changes.

## 🛠️ Technology Stack

### Backend
* **Framework:** Java 17, Spring Boot 3
* **Database:** PostgreSQL with Spring Data JPA / Hibernate
* **Security:** Spring Security & JSON Web Tokens (JWT)
* **Build Tool:** Maven

### Frontend
* **Framework:** React 18 (Functional Components & Hooks)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Build Tool:** Vite

---

## 💻 Getting Started

### Prerequisites
* Java 17+
* Node.js 18+
* PostgreSQL 14+

### 1. Database Setup
1. Create a PostgreSQL database named `assetflow`.
2. Ensure you have the PostgreSQL credentials ready.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a `.env` file in the `backend/` directory to store your database credentials securely:
   ```env
   DB_URL=jdbc:postgresql://localhost:5432/assetflow
   DB_USERNAME=postgres
   DB_PASSWORD=your_password_here
   ```
3. Build and run the Spring Boot application:
   ```bash
   mvn clean package -DskipTests
   java -jar target/assetflow-0.0.1-SNAPSHOT.jar
   ```
   *The backend will start on `http://localhost:8080` and JPA will automatically initialize your database tables.*

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will be accessible at `http://localhost:5173`.*

---

## 🔒 Default Accounts

Once the server runs, you can create a test organization from the **Org Setup** screen or register via the Signup flow. The application allows creation of **Admin**, **Manager**, and **Employee** roles.

## 📄 License
This project was developed for the Odoo Hackathon 2026.
