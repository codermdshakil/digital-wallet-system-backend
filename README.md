# Digital Wallet System Backend

A robust backend API for a digital wallet system built with Node.js, Express, TypeScript, and MongoDB. This application provides secure user authentication, wallet management, and transaction processing capabilities.

## Features

- **User Management**: Registration, login, profile management
- **Authentication**: JWT-based authentication with Passport.js (local and Google OAuth)
- **Wallet Operations**: Create wallets, manage balances, view transactions
- **Transaction Processing**: Secure money transfers between users
- **Error Handling**: Comprehensive error handling with custom error classes
- **Validation**: Request validation using Zod schemas
- **Security**: Password hashing, session management, CORS support

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js (Local & Google OAuth 2.0)
- **Validation**: Zod
- **Security**: bcrypt for password hashing, JWT for tokens
- **Development**: ts-node-dev, ESLint, TypeScript

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (version 18 or higher)
- npm or yarn
- MongoDB (local or cloud instance)
- Google OAuth credentials (for Google login)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/codermdshakil/digital-wallet-system-backend.git
   cd digital-wallet-system-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and configure the environment variables (see Environment Variables section below).

4. Start MongoDB service (if running locally).

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
DB_URL=mongodb://localhost:27017/digital-wallet
NODE_ENV=development
BCRYPT_SALT=12
JWT_ACCESS_SECRET=your-access-secret-key
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES=7d
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
EXPRESS_SESSION=your-session-secret
FRONTEND_URL=http://localhost:3000
```

**Note**: Replace placeholder values with your actual credentials and secrets.

## Running the Application

### Development Mode
```bash
npm run dev
```

The server will start on the port specified in your `.env` file (default: 5000).

### Production Mode
```bash
npm start
```

## API Endpoints

The API is versioned under `/api/v1`. Here are the main endpoints:

### Authentication (`/api/v1/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /google` - Google OAuth login
- `GET /logout` - Logout

### User Management (`/api/v1/user`)
- `GET /profile` - Get user profile
- `PATCH /profile` - Update user profile

### Wallet (`/api/v1/wallet`)
- `POST /` - Create a new wallet
- `GET /` - Get user's wallets
- `GET /:id` - Get wallet details
- `PATCH /:id` - Update wallet

### Transactions (`/api/v1/transaction`)
- `POST /send-money` - Send money to another user
- `GET /` - Get transaction history
- `GET /:id` - Get transaction details

### Health Check
- `GET /` - Welcome message
- `GET /health` - Health check endpoint

For detailed API documentation, consider using tools like Swagger or Postman collections.

## Project Structure

```
src/
├── app.ts                 # Main Express app setup
├── server.ts              # Server entry point
├── app/
│   ├── config/
│   │   ├── env.ts         # Environment variables loader
│   │   └── passport.ts    # Passport authentication config
│   ├── errorHandlers/
│   │   └── AppError.ts    # Custom error class
│   ├── helpers/           # Error handling helpers
│   ├── interfaces/        # TypeScript interfaces
│   ├── middlewares/       # Express middlewares
│   ├── modules/           # Feature modules
│   │   ├── auth/          # Authentication module
│   │   ├── transaction/   # Transaction module
│   │   ├── user/          # User management module
│   │   └── wallet/        # Wallet module
│   ├── routes/
│   │   └── index.ts       # Route aggregator
│   └── utils/             # Utility functions
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm test` - Run tests (currently placeholder)

## Testing

Currently, no tests are implemented. To add tests:

1. Install testing framework (e.g., Jest, Mocha)
2. Write unit and integration tests
3. Update package.json scripts

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, email [ahmedhshakil0512@gmail.com] or create an issue in the repository.

---

Built with ❤️ using Node.js and TypeScript
