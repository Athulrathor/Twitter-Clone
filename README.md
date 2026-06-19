<<<<<<< HEAD
# Twitter Clone

A full-stack social media application inspired by Twitter, built with **Next.js** for the frontend and **Express + MongoDB** for the backend.

## Features

- User authentication flow (Google sign-in and email-based sign-up/login flow)
- Home feed with tweets
- Create, like, and retweet posts
- Profile viewing and editing
- Responsive UI for desktop and mobile

## Tech Stack

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Axios
- Firebase Authentication

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- dotenv

## Project Structure

- `frontend/` — Next.js application
- `backend/` — Express API server
- `backend/models/` — MongoDB schemas

## Prerequisites

Make sure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- MongoDB running locally or a MongoDB Atlas connection string

## Environment Variables

### Backend
Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONOGDB_URL=mongodb://127.0.0.1:27017/twitter-clone
```

### Frontend
Create a `.env.local` file inside the `frontend` folder:

```env
BACKEND_URL=http://localhost:5000
```

## Getting Started

### 1) Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2) Start the backend server

```bash
cd backend
npm start
```

The backend will run on:

- http://localhost:5000

### 3) Start the frontend

```bash
cd frontend
npm run dev
```

The frontend will run on:

- http://localhost:3000

## API Notes

The frontend connects to the backend using `BACKEND_URL` defined in the frontend environment configuration.

## Production Build

To create a production build for the frontend:

```bash
cd frontend
npm run build
```

## Notes

- The Firebase configuration is currently included in the frontend code for authentication setup.
- If you are using MongoDB Atlas, replace the `MONOGDB_URL` value with your database connection string.
=======
# Twitter-Clone
>>>>>>> f82b642dda1e7d028ddb55e44eac49a239280564
