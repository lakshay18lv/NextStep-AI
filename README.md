# NextStep AI

NextStep AI is a MERN stack web application for AI-based mock interview preparation.  
It helps users sign up, verify their email, generate interview questions from their resume, save feedback, and track skill growth over time.

## Overview

This project is designed to simulate a real interview experience. A user can:

- Create an account and verify email
- Log in securely with JWT authentication
- Upload or paste resume text
- Choose difficulty level and domain
- Generate interview questions
- Answer questions one by one
- End the interview and receive feedback
- View past interviews in Feedback Studio
- Track progress in Skill Tracker

## Main Features

- JWT-based authentication
- Email verification with OTP/link
- Protected routes for dashboard, feedback, and skill tracker
- Resume-based question generation
- OpenAI integration for smarter question generation
- Fallback question generator when OpenAI quota is unavailable
- Save interview results in MongoDB
- User-wise feedback history
- Skill progress tracking
- Attractive React UI with responsive layout

## Tech Stack

- Frontend: React.js, Vite, React Router
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Authentication: JWT, bcryptjs
- Email: Nodemailer
- AI: OpenAI API

## Project Structure

- `client/` - React frontend
- `server/` - Express backend
- `server/controllers/` - business logic
- `server/routes/` - API routes
- `server/models/` - MongoDB schemas
- `server/middleware/` - auth and error handling
- `server/utils/` - email and helper utilities

## Setup Instructions

### 1. Install dependencies

Open two terminals:

```bash
cd server
npm install
```

```bash
cd client
npm install
```

### 2. Add environment variables

Create a `.env` file inside `server/` and add:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_gmail_address
SMTP_PASS=your_gmail_app_password
EMAIL_FROM=your_gmail_address

FRONTEND_URL=http://localhost:5173
```

Important:

- Use a Gmail App Password for `SMTP_PASS`
- Normal Gmail password usually will not work
- Make sure 2-Step Verification is enabled on Gmail

### 3. Run the backend

```bash
cd server
npm start
```

### 4. Run the frontend

```bash
cd client
npm run dev
```

## How the App Works

### Authentication Flow

- User registers with name, email, and password
- Email verification is sent
- User verifies email using the OTP or verification link
- After verification, user can log in
- Protected pages are available only after login

### Interview Flow

- User opens the dashboard
- Selects difficulty and domain
- Adds resume text or uploads a resume
- Questions are generated from resume content
- User answers each question
- On interview end, feedback is saved in MongoDB
- Skill tracker updates automatically

### Feedback Studio

- Shows previous interviews
- Displays score, answers, strengths, and improvement areas
- Allows clearing history for the current user

### Skill Tracker

- Shows score trend
- Shows domain-wise performance
- Shows difficulty coverage
- Shows strengths and focus areas

## API Routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-verification`
- `GET /api/auth/user`

### Interviews

- `POST /api/interviews/generate`
- `POST /api/interviews`
- `GET /api/interviews`
- `DELETE /api/interviews`
- `DELETE /api/interviews/:id`

## Notes

- If OpenAI quota is unavailable, the app uses a fallback generator so the interview still works.
- Interview feedback and skill tracking are saved per user.
- Dashboard, feedback, and skill tracker are protected routes.

## Future Improvements

- Voice interview mode
- Timer-based interview rounds
- More accurate scoring with AI answer evaluation
- Resume PDF text extraction
- Admin analytics dashboard

## License

This project is for educational and portfolio use.
