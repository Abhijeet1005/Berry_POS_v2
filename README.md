# Berry & Blocks POS Backend

A comprehensive multi-tenant restaurant management POS system backend built with Node.js, Express, and MongoDB.

## Features

- Multi-tenant architecture with data isolation
- Order management from multiple channels (POS, Mobile App, Kiosk, Third-party)
- AI-powered dish profiling and personalized recommendations
- Real-time KOT (Kitchen Order Ticket) management
- Loyalty program and feedback management
- Payment processing with multiple methods
- Table and reservation management
- Valet service management
- Staff performance tracking
- Analytics and reporting
- Third-party integrations (Swiggy, Zomato, Tally, WhatsApp)
- Offline mode support with synchronization

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: MongoDB 6.x with Mongoose ODM
- **Cache**: Redis 7.x
- **Queue**: Bull (Redis-based)
- **Authentication**: JWT with bcrypt
- **Validation**: Joi
- **Logging**: Winston
- **Real-time**: Socket.io

## Prerequisites

- Node.js 18 or higher
- MongoDB 6 or higher
- Redis 7 or higher

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd berry-blocks-pos-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration

5. Start MongoDB and Redis services

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Running Tests
```bash
npm test
```

## Project Structure

```
berry-blocks-pos-backend/
├── src/
│   ├── config/           # Configuration files
│   ├── middleware/       # Express middleware
│   ├── models/          # Mongoose models
│   ├── modules/         # Feature modules
│   │   ├── auth/        # Authentication module
│   │   ├── tenant/      # Tenant management
│   │   ├── menu/        # Menu management
│   │   ├── order/       # Order management
│   │   ├── payment/     # Payment processing
│   │   └── ...          # Other modules
│   ├── utils/           # Utility functions
│   ├── workers/         # Background workers
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── logs/                # Application logs
├── .env.example         # Environment variables template
├── package.json         # Dependencies
└── README.md           # This file
```

## API Documentation

API documentation will be available at `/api-docs` when the server is running (Swagger UI).

## Environment Variables

See `.env.example` for all available configuration options.

## License

ISC
