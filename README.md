# Meetly - Video Conferencing Application

A full-stack video conferencing web application with AI-powered features like meeting notes, live subtitles, polls, code collaboration, and whiteboard.

## Features

- Real-time video conferencing
- AI Meeting Notes (powered by Google Gemini)
- Live Subtitles & Translation
- Live Polls & Quizzes
- Live Code Collaboration
- Shared Whiteboard
- Meeting Productivity Tracking

## Project Structure

```
.
├── backend/          # Node.js + Express backend
├── frontend/         # React frontend
└── ...
```

## Deployment to Render

This project is configured for deployment to Render using the `render.yaml` configuration file.

### Services Created

1. **meetly-backend** - Node.js web service
2. **meetly-frontend** - Static site

### Environment Variables

For the backend, you'll need to set the following environment variables in the Render dashboard:

- `MONGODB_URI` - Your MongoDB connection string
- `GEMINI_API_KEY` - Your Google Gemini API key
- `PORT` - The port to run the server on (Render will set this automatically)

### Deployment Steps

1. Fork this repository to your GitHub account
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New+" and select "Web Service"
4. Connect your GitHub account and select your forked repository
5. Set the following options:
   - Name: `meetly`
   - Environment: `Node`
6. In the "Build Command" field, enter:
   ```
   npm install && npm run build
   ```
7. In the "Start Command" field, enter:
   ```
   npm start
   ```
8. Add the required environment variables in the "Environment Variables" section:
   - `MONGODB_URI` - Your MongoDB connection string
   - `GEMINI_API_KEY` - Your Google Gemini API key
9. Click "Create Web Service"

For the frontend:
1. Click "New+" and select "Static Site"
2. Select the same repository
3. Set the following options:
   - Name: `meetly-frontend`
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/build`
4. Add environment variables:
   - `REACT_APP_BACKEND_URL` - The URL of your deployed backend service
5. Click "Create Static Site"

### Alternative: Using render.yaml

If you prefer to use the provided `render.yaml` file:

1. Fork this repository to your GitHub account
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New Blueprint Instance"
4. Connect your GitHub account and select your forked repository
5. Render will automatically detect the `render.yaml` file and create both services
6. Add the required environment variables in each service's settings:
   - For backend: `MONGODB_URI` and `GEMINI_API_KEY`
   - For frontend: `REACT_APP_BACKEND_URL` (pointing to your backend service)

## Local Development

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

### Setup

1. Clone the repository
2. Install dependencies for both backend and frontend:
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```
   
3. Create a `.env` file in the `backend` directory with your configuration:
   ```
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   PORT=8002
   ```

4. Start both services:
   ```bash
   # From the root directory
   npm run dev
   ```

## Available Scripts

From the root directory:
- `npm run dev` - Start both backend and frontend in development mode
- `npm run start` - Start both backend and frontend in production mode

## Learn More

- [Render Documentation](https://render.com/docs)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)