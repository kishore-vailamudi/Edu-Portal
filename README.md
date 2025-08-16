# EdTech Portal

## The Demonstration video of the project is in the Youtube
https://youtu.be/j45Pi8nYEkg

## Team: Shouranga
### Team Members:
- Harsha Vardhan Settipalli
- Koduru Sasidhar Reddy
- Pemmala Raghunath Reddy
- Dheeraj Kumar

## Developed During
This project was developed during a hackathon at **IIIT Kanchipuram**.

## Problem Statement
Traditional online learning platforms often fail to provide personalized learning experiences. Students struggle to find relevant study materials, track their progress, and identify weak areas. A lack of adaptive learning mechanisms leads to inefficient study habits and decreased engagement.

## Solution
EdTech Portal is an adaptive learning platform that provides personalized study recommendations and review assessments based on student performance and engagement. By analyzing quiz results and learning progress, the platform tailors study materials to enhance understanding and retention.

## Features

- **Adaptive Learning**: Personalized study recommendations based on quiz performance.
- **Unit-wise Course Materials**: Navigate through videos, PDFs, and interactive exercises.
- **Review Quizzes**: Assess understanding with quizzes that analyze performance.
- **Personalized Recommendations**: Get tailored study materials based on detected weaknesses.
- **Progress Tracking**: Monitor learning progress across subjects and units.

## Tech Stack

### Frontend
- React
- React Router
- Tailwind CSS

### Backend
- Node.js/Express
- MongoDB
- JWT Authentication

## Project Structure

```
project/
├── src/                  # React frontend
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page components
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Entry point
├── backend/              # Node.js backend
│   ├── src/
│   │   ├── controllers/  # API controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # MongoDB models
│   │   ├── routes/       # API routes
│   │   └── server.js     # Server entry point
│   └── .env              # Environment variables
```

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB

### Installation

1. Clone the repository:
```sh
git clone <repository-url>
cd project
```

2. Install frontend dependencies:
```sh
npm install
```

3. Install backend dependencies:
```sh
cd backend
npm install
```

4. Set up environment variables:
   - Create a `.env` file in the `backend` directory with the following variables:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/edtech-portal
     JWT_SECRET=your_jwt_secret_key
     ```

### Running the Application

1. Start the MongoDB server:
```sh
mongod
```

2. Start the Node.js backend:
```sh
cd backend
npm run dev
```

3. Start the React frontend:
```sh
cd ..
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### User Routes
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/profile` - Update user profile

### Subject Routes
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get subject by ID
- `POST /api/subjects` - Create a new subject (admin only)
- `PATCH /api/subjects/:id` - Update a subject (admin only)
- `DELETE /api/subjects/:id` - Delete a subject (admin only)

### Unit Routes
- `GET /api/units/subject/:subjectId` - Get all units for a subject
- `GET /api/units/:id` - Get unit by ID
- `POST /api/units` - Create a new unit (admin only)
- `PATCH /api/units/:id` - Update a unit (admin only)
- `PATCH /api/units/lesson/status` - Update lesson completion status
- `DELETE /api/units/:id` - Delete a unit (admin only)

### Quiz Routes
- `GET /api/quizzes/:id` - Get quiz by ID
- `POST /api/quizzes/submit` - Submit quiz answers
- `GET /api/quizzes/results/user` - Get quiz results for a user
- `POST /api/quizzes` - Create a new quiz (admin only)

### Review Routes
- `GET /api/reviews/materials` - Get review materials for a user
- `GET /api/reviews/ai-recommendations` - Get personalized recommendations
- `POST /api/reviews/materials` - Create a new review material (admin only)
- `PATCH /api/reviews/materials/:id` - Update a review material (admin only)

### Progress Routes
- `GET /api/progress` - Get user progress
- `PATCH /api/progress/unit` - Update unit progress
- `PATCH /api/progress/quiz` - Update quiz score
- `PATCH /api/progress/time` - Update time spent

## License
This project is licensed under the MIT License - see the LICENSE file for details.
