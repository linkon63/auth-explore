# Authentication System

A full-stack authentication system built with Node.js, Express, and React.

## Features

- User registration and login
- JWT-based authentication
- Protected routes
- Form validation
- Responsive UI

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or Atlas)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/linkon63/auth-explore.git
cd auth-explore
```

### 2. Set up environment variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### 3. Install dependencies

#### Server

```bash
cd server
npm install
```

#### Client

```bash
cd ../client
npm install
```

### 4. Start the application

#### Development

In separate terminal windows:

```bash
# Start server (from project root)
cd server
npm run dev

# Start client (from project root)
cd client
npm start
```

The application will be available at `http://localhost:3000`

## Available Scripts

### Server

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests

### Client

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests

## Project Structure

```
├── client/                 # React frontend
│   ├── public/            # Static files
│   └── src/               # React source code
│       ├── components/    # Reusable components
│       ├── pages/         # Page components
│       ├── services/      # API services
│       └── App.tsx        # Main App component
├── server/                # Node.js backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── app.js            # Express app setup
├── .env.example         # Example environment variables
└── README.md            # This file
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
