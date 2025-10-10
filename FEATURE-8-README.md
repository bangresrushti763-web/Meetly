# Feature 8: Live Polls & Quizzes

This feature allows the host to create polls or quizzes during a meeting, participants can vote in real time, and live results are shown with charts.

## Implementation Details

### Backend Implementation

The feature is implemented using Socket.IO for real-time communication:

1. **Poll Storage**: Polls are stored in memory by roomId
2. **Events**:
   - `createPoll`: Host creates a new poll
   - `votePoll`: Participants submit votes
   - `endPoll`: Host ends the poll and clears it from memory

### Frontend Implementation

1. **Component**: `Polls.jsx`
2. **Integration**: Added to `VideoMeet.jsx` page
3. **Features**:
   - Host can create polls with custom questions and options
   - Participants can vote in real-time
   - Live results displayed with pie charts using Recharts
   - Host can end polls

## How to Use

1. Start both backend and frontend servers:
   - Backend: `cd backend && npm run dev`
   - Frontend: `cd frontend && npm start`

2. In the video meeting room, you'll see the "Live Polls & Quizzes" section

3. As the host:
   - Enter a question and options for the poll
   - Click "Start Poll" to launch it
   - Participants can vote using the "Vote" buttons
   - Click "End Poll" to finish the poll

4. As a participant:
   - Wait for the host to create a poll
   - Click "Vote" next to your preferred option
   - View live results in the pie chart

## Files Created/Modified

1. `backend/src/controllers/socketManager.js` - Added poll events
2. `frontend/src/components/Polls.jsx` - New component for polls
3. `frontend/src/pages/VideoMeet.jsx` - Integrated the polls component

## Dependencies

- `socket.io` (already included)
- `recharts` (already included)

## Optional AI Enhancement

For the optional AI-generated quiz questions feature, you could integrate with OpenAI API to generate questions based on meeting topics. This would require:
1. Adding an API endpoint to generate questions
2. Modifying the Polls component to include an "AI Generate" button
3. Implementing the OpenAI integration similar to other AI features in the project