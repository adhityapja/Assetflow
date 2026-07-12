# AssetFlow: Enterprise Asset & Resource Management System

> A centralized ERP platform designed to digitize and structure the tracking, allocation, and maintenance of physical assets and shared resources. Built for the Odoo Hackathon 2026.

## 📖 Overview

AssetFlow eliminates the manual inefficiencies of spreadsheets and paper logs by introducing strict asset lifecycles, real-time resource visibility, and structured maintenance workflows. By focusing purely on operational ERP functionality—without the bloat of purchasing or accounting concerns—AssetFlow delivers a clean, role-based system capable of scaling across any organization (schools, hospitals, agencies, or factories).

## 🏗️ Architectural Philosophy

AssetFlow is engineered to handle strict state management and high concurrency, prioritizing data integrity and system reliability.

*   **Object-Oriented State Management:** The asset lifecycle is governed by strict state transitions enforced at the service layer, moving immutably from *Available* to *Allocated*, *Reserved*, *Under Maintenance*, *Lost*, *Retired*, or *Disposed*. 
*   **Greedy Interval Scheduling:** To handle shared resource booking (rooms, vehicles, equipment), the system leverages greedy algorithm design paradigms to efficiently process interval scheduling, ensuring zero overlapping time-slot conflicts under high concurrency.
*   **Uniform Data Access Layer:** All database interactions utilize strict JPQL (Java Persistence Query Language) to maintain a purely object-oriented database schema, mapping complex relational entities without sacrificing query readability.

## 🚀 Core Features

*   **Smart Asset Allocation:** Assign assets to employees or departments with strict double-allocation prevention. If an asset is taken, users are routed to a structured Transfer Request workflow.
*   **Conflict-Free Resource Booking:** A calendar-driven booking engine that actively validates and rejects overlapping time-slot requests.
*   **Kanban Maintenance Approvals:** A routed workflow requiring Asset Manager approval before an asset transitions to *Under Maintenance*.
*   **Structured Audit Cycles:** Assign auditors to specific departments, verify physical asset conditions, and auto-generate discrepancy reports for missing or damaged items.
*   **Role-Based Access Control (RBAC):** Secure partitioning of actions across Admins, Asset Managers, Department Heads, and Employees.

## 💻 Tech Stack

**Backend System**
*   **Java 21 & Spring Boot 3:** Core RESTful API and business logic layer.
*   **PostgreSQL:** Primary relational database ensuring ACID compliance for critical transactional data.
*   **Spring Data JPA:** Object-Relational Mapping utilizing pure JPQL for domain consistency.
*   **Redis:** High-speed caching layer for dashboard KPIs and distributed locking.

**Frontend Interface**
*   **React & TypeScript:** Type-safe, component-driven user interface.
*   **Tailwind CSS:** Utility-first styling for a clean, responsive enterprise aesthetic.

## 🗄️ Core Domain Model (Master Data)

*   `Department`: Hierarchical organization structure.
*   `AssetCategory`: Classifications for varied resources (e.g., Electronics, Vehicles).
*   `Employee`: Core user entity with defined RBAC roles.

## ⚙️ Getting Started (Local Development)

*(Instructions for cloning, Docker-compose setup, and environment variables will be populated here as development progresses).*

---
*Developed for the Odoo Hackathon*
