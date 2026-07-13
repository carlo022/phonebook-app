# Phonebook App

A full-stack MERN phonebook application combining React, Tailwind CSS, Express, MongoDB, and MySQL.

It supports secure user authentication, role-based access, password recovery via email, contact management, and contact sharing between users.

## Key Features

- User registration and login with JWT authentication
- Role-based access control (`super-admin`, `admin`, `user`)
- Admin approval workflow for new accounts
- Forgot password and reset password flows using email tokens
- Create, update, delete, and list contacts
- Share contacts with other users securely
- Multi-database architecture: MongoDB for contacts, MySQL for users

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, React Query
- Backend: Express, Sequelize, Mongoose, JWT, bcrypt, Nodemailer
- Databases: MongoDB and MySQL
- Deployment-ready configuration with environment variables

## Project Structure

- `client/` — React frontend
- `server/` — Express backend
- `server/controllers/` — Request handlers for auth and contacts
- `server/models/` — Sequelize user model and Mongoose contact schema
- `server/routes/` — API routes for auth and contacts
- `server/config/` — Database connection setup for MongoDB and MySQL
- `client/src/services/api.js` — Axios instance with auth token support

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB connection URI
- MySQL connection URL
- SMTP credentials for email delivery

### Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### Configure environment

Create a `.env` file inside `server/` with the following values:

```env
MONGO_URI=your_mongodb_connection_string
MYSQL_URL=your_mysql_connection_string
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_EMAIL=your_smtp_email
SMTP_PASSWORD=your_smtp_password
FRONTEND_URL=http://localhost:5173
```

### Run the application

Start the backend:

```bash
cd server
npm run server
```

Start the frontend:

```bash
cd client
npm run dev
```

The frontend will typically run on `http://localhost:5173` and the API on `http://localhost:5000`.

## Available Scripts

### Client

- `npm run dev` — Start the Vite development server
- `npm run build` — Build the production bundle
- `npm run preview` — Preview the production build
- `npm run lint` — Run ESLint checks

### Server

- `npm run server` — Start the backend with nodemon

## Notes

- The first registered user is promoted to `super-admin` and activated automatically.
- All contact routes require authentication.
- The application uses a hybrid database design: MySQL for user accounts and MongoDB for contact documents.
- Password reset tokens expire after 10 minutes.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
