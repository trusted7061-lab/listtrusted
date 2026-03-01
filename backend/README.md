# Trusted Escort Backend API

A secure Node.js/Express backend API for the Trusted Escort application with email verification, user authentication, and MongoDB integration.

## Features

- **User Registration & Authentication**: Secure user registration with email verification
- **JWT Authentication**: Token-based authentication for protected routes
- **Email Verification**: SendGrid integration for email verification codes
- **MongoDB Integration**: User data persistence with Mongoose ODM
- **Security**: Helmet, CORS, rate limiting, input validation
- **Development Support**: Console logging fallback for email testing

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Email Service**: SendGrid (with console fallback)
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs, helmet, express-rate-limit
- **Validation**: express-validator

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- SendGrid account (optional for development)

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. Start MongoDB (if running locally)

5. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/trusted-escort

# JWT Secret (change in production)
JWT_SECRET=your-super-secret-jwt-key-here

# SendGrid Configuration
SENDGRID_API_KEY=your-sendgrid-api-key-here
SENDGRID_FROM_EMAIL=noreply@trustedescort.in
SENDGRID_FROM_NAME=Trusted Escort

# Email Templates
VERIFICATION_EMAIL_SUBJECT=Verify Your Email - Trusted Escort
VERIFICATION_EMAIL_TEMPLATE_ID=your-sendgrid-template-id-here

# Security
BCRYPT_ROUNDS=12
```

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/register`
Register a new user with email verification.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "businessName": "My Business",
  "phone": "1234567890"
}
```

**Response:**
```json
{
  "message": "User registered successfully. Please check your email for verification code.",
  "userId": "...",
  "emailSent": true
}
```

#### POST `/api/auth/verify-email`
Verify user's email with code.

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

#### POST `/api/auth/login`
Login user (requires email verification).

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/complete-login`
Complete login with verification code (for unverified users).

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

#### GET `/api/auth/profile`
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### Email Routes (`/api/email`)

#### POST `/api/email/send-verification`
Send verification email (for testing).

#### GET `/api/email/test`
Test email service.

## Development

### Running Tests
```bash
npm test
```

### Code Structure

```
backend/
├── models/          # MongoDB models
│   └── User.js     # User schema
├── routes/         # API routes
│   ├── auth.js    # Authentication routes
│   └── email.js   # Email routes
├── services/       # Business logic services
│   └── emailService.js
├── server.js       # Main application file
├── package.json
├── .env.example    # Environment template
└── README.md
```

## Security Features

- **Password Hashing**: bcryptjs with configurable rounds
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: Prevents abuse with express-rate-limit
- **Input Validation**: express-validator for all inputs
- **CORS**: Configured for frontend origin
- **Helmet**: Security headers
- **Email Verification**: Prevents unauthorized account access

## Email Service

The application uses SendGrid for production email sending. In development, codes are logged to the console for easy testing.

### SendGrid Setup

1. Create a SendGrid account
2. Get your API key
3. Set up a sender email (verify domain or single sender)
4. (Optional) Create a dynamic template for better email styling

## Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Use a production MongoDB instance (MongoDB Atlas recommended)
3. Configure SendGrid with verified sender
4. Set strong `JWT_SECRET`
5. Use environment variables for all sensitive data

### Process Management

Consider using PM2 for production:
```bash
npm install -g pm2
pm2 start server.js --name "trusted-escort-api"
```

## Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Use meaningful commit messages

## License

ISC