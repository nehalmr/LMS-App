# Library Management System - React Frontend

A modern, responsive React.js frontend for the Library Management System that integrates with a Java Spring Boot microservices backend.

## Features

- **Dashboard**: Overview of books, members, transactions, and overdue items
- **Book Management**: Add, edit, delete, and search books
- **Member Management**: Manage library members and their status
- **Borrow/Return**: Handle book borrowing and returning transactions
- **Fines Management**: Track and manage overdue fines
- **Notifications**: Send and manage notifications to members

## Technology Stack

- **React 18/19** - Frontend framework
- **JavaScript** - Programming language (no TypeScript)
- **Tailwind CSS** - Styling framework
- **Font Awesome** - Icons
- **Fetch API** - HTTP client for API calls

## Prerequisites

- Node.js 16+ and npm
- Java Spring Boot backend running on localhost:8080
- Modern web browser

## Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd library-management-frontend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the development server:
\`\`\`bash
npm start
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Backend Integration

This frontend is designed to work with the Java Spring Boot microservices backend. Make sure the following services are running:

- **API Gateway**: http://localhost:8080
- **Book Service**: http://localhost:8081
- **Member Service**: http://localhost:8082
- **Transaction Service**: http://localhost:8083
- **Fine Service**: http://localhost:8084
- **Notification Service**: http://localhost:8085

## API Endpoints

The frontend communicates with the backend through these API endpoints:

### Books
- `GET /api/books` - Get all books
- `POST /api/books` - Create new book
- `PUT /api/books/{id}` - Update book
- `DELETE /api/books/{id}` - Delete book

### Members
- `GET /api/members` - Get all members
- `POST /api/members` - Create new member
- `PUT /api/members/{id}` - Update member
- `PUT /api/members/{id}/status` - Update member status

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions/borrow` - Borrow a book
- `PUT /api/transactions/{id}/return` - Return a book

### Fines
- `GET /api/fines` - Get all fines
- `PUT /api/fines/{id}/pay` - Pay a fine

### Notifications
- `GET /api/notifications` - Get all notifications
- `POST /api/notifications` - Send notification

## Project Structure

```
src/
├── components/
│   ├── Dashboard.js
│   ├── BookManagement.js
│   ├── MemberManagement.js
│   ├── BorrowReturn.js
│   ├── OverdueFines.js
│   ├── Notifications.js
│   ├── Header.js
│   └── Sidebar.js
├── services/
│   └── apiService.js
├── App.js
├── App.css
├── index.js
└── index.css
```

## Features Overview

### Dashboard
- Statistics cards showing total books, active members, borrowed books, and overdue books
- Recent transactions table
- Overdue books list

### Book Management
- Add new books with title, author, genre, ISBN, year, and copy information
- Edit existing books
- Delete books
- View all books in a responsive table

### Member Management
- Register new members with contact information
- Edit member details
- Update membership status (Active/Inactive/Suspended)
- View all members

### Borrow/Return
- Borrow books to active members
- Automatic due date calculation (30 days)
- Return books and update availability
- View all transactions

### Fines Management
- View outstanding and paid fines
- Mark fines as paid
- Fine statistics and summaries

### Notifications
- Send custom notifications to members
- View notification history
- Different notification types (due reminders, overdue alerts, fine notices)
- Notification statistics

## Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## Error Handling

- API error handling with user-friendly messages
- Loading states for all async operations
- Form validation
- Network error recovery

## Development

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (not recommended)

### Code Style

- Uses functional components with React Hooks
- Follows React best practices
- Consistent naming conventions
- Modular component structure

## Production Build

To create a production build:

```bash
npm run build
```

This builds the app for production to the `build` folder and optimizes the build for best performance.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
