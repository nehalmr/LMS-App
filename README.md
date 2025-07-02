
# Library Management System (LMS)

A full-stack, microservices-based Library Management System with a modern React frontend and robust Java Spring Boot backend. This project is designed for scalability, maintainability, and ease of development, with unified automation for setup and management.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Technology Stack](#technology-stack)
5. [Prerequisites](#prerequisites)
6. [Setup & Usage](#setup--usage)
7. [Service Ports](#service-ports)
8. [API Endpoints](#api-endpoints)
9. [Development & Automation](#development--automation)
10. [Troubleshooting](#troubleshooting)
11. [Contributing](#contributing)
12. [License](#license)

---

## Project Overview
- **Backend**: Java Spring Boot microservices (Book, Member, Transaction, Fine, Notification, API Gateway, Eureka Server)
- **Frontend**: React.js (Vite, Tailwind CSS)
- **Database**: MySQL 8.0+
- **Service Discovery**: Netflix Eureka
- **API Gateway**: Spring Cloud Gateway
- **Inter-service Communication**: OpenFeign
- **API Documentation**: OpenAPI 3.0 (Swagger)

---

## Architecture

```
[React Frontend] <-> [API Gateway] <-> [Microservices]
                                 |
                                 +-- [Eureka Server]
                                 +-- [MySQL Databases]
```
- Each service has its own database and domain logic
- API Gateway routes all frontend and external API calls
- Service discovery and health checks via Eureka

---

## Features
- **Unified Automation**: One script to setup, start, stop, and check status for all backend and frontend services
- **Book Management**: CRUD, search, inventory
- **Member Management**: Registration, status, profile
- **Borrow/Return**: Transactional book lending
- **Fines**: Overdue tracking, fine calculation, payment
- **Notifications**: Email/SMS, reminders, alerts
- **Dashboard**: Overview of books, members, transactions, and overdue items
- **Responsive UI**: Works on desktop, tablet, and mobile
- **API Documentation**: Swagger UI for all services
- **Health Checks**: Spring Boot Actuator endpoints
- **Logging**: Per-service logs in `Backend/logs/`

---

## Technology Stack
- **Backend**: Java 21+, Spring Boot 3.2+, Maven 3.9+, Spring Data JPA, OpenFeign, Caffeine Cache, Thymeleaf, Spring Mail
- **Frontend**: React 18/19, Vite, Tailwind CSS, JavaScript (no TypeScript), Fetch API
- **Database**: MySQL 8.0+
- **DevOps**: Unified shell script for automation

---

## Prerequisites
- Java 21+ and Maven 3.9+
- Node.js 16+ and npm
- MySQL 8.0+ (running, with user/password set in the script)
- (Optional) SMTP server for email notifications

---

## Setup & Usage

From the project root:

```bash
cd scripts
chmod +x lms-app.sh
./lms-app.sh setup      # Install all backend/frontend dependencies
./lms-app.sh init-db    # Initialize and seed MySQL databases
./lms-app.sh start      # Start all backend and frontend services
./lms-app.sh status     # Show running status of all services
./lms-app.sh stop       # Stop all backend and frontend services
```

- Logs for each service are saved in `Backend/logs/`.
- Edit MySQL credentials in the script if needed.
- For database setup, ensure MySQL is running and accessible.

---

## Service Ports
| Service              | Port  |
|----------------------|-------|
| API Gateway          | 8080  |
| Book Service         | 8081  |
| Member Service       | 8082  |
| Transaction Service  | 8083  |
| Fine Service         | 8084  |
| Notification Service | 8085  |
| Eureka Server        | 8761  |
| Frontend (React)     | 5173* |

*Vite default port. If changed, update the script accordingly.*

---

## API Endpoints

All endpoints are accessible via the API Gateway (`http://localhost:8080`).

### Book Management
- `GET /api/books` - Get all books
- `GET /api/books/{id}` - Get book by ID
- `GET /api/books/search?title=&author=&genre=` - Search books
- `POST /api/books` - Create new book
- `PUT /api/books/{id}` - Update book
- `DELETE /api/books/{id}` - Delete book

### Member Management
- `GET /api/members` - Get all members
- `GET /api/members/{id}` - Get member by ID
- `POST /api/members` - Register new member
- `PUT /api/members/{id}` - Update member
- `PUT /api/members/{id}/status` - Update membership status

### Transaction Management
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/member/{memberId}` - Get member's transactions
- `POST /api/transactions/borrow` - Borrow a book
- `PUT /api/transactions/{id}/return` - Return a book
- `GET /api/transactions/overdue` - Get overdue transactions

### Fine Management
- `GET /api/fines` - Get all fines
- `GET /api/fines/member/{memberId}` - Get member's fines
- `POST /api/fines` - Create fine
- `PUT /api/fines/{id}/pay` - Pay fine

### Notification Management
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/{id}` - Get notification by ID
- `GET /api/notifications/member/{memberId}` - Get member's notifications
- `POST /api/notifications` - Create notification
- `GET /api/notifications/stats` - Get notification statistics

---

## Development & Automation

- **Backend**: Each microservice is a standalone Spring Boot app. See `Backend/` for source code and configuration.
- **Frontend**: Modern React app with Tailwind CSS. See `Frontend/` for source code and UI components.
- **Automation**: Use `scripts/lms-app.sh` for all setup, start, stop, and status operations. Logs are in `Backend/logs/`.
- **Database**: SQL scripts for schema and seed data are in `scripts/`.

### Frontend Features
- Dashboard: Statistics, recent transactions, overdue books
- Book/Member/Transaction/Fine/Notification management
- Responsive, user-friendly UI
- Error handling and loading states

### Backend Features
- Microservices with clear domain boundaries
- Service discovery, API gateway, health checks
- Caching, async jobs, scheduled tasks
- Email notifications with templates
- OpenAPI/Swagger documentation per service

---

## Troubleshooting
- If a service fails to start, check its log file in `Backend/logs/`.
- Ensure MySQL is running and credentials are correct.
- For port conflicts, stop any process using the port or change the port in the service's `application.yml`.
- For frontend issues, check the browser console and `Backend/logs/frontend.log`.

---

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## License
This project is licensed under the MIT License.
