# Feature 6: AI Meeting Notes (Auto Summarization)

This feature automatically records meeting transcripts, uses AI to summarize key points, and provides users with a downloadable meeting summary.

## Implementation Details

### Backend Implementation

1. **Endpoint**: `POST /api/v1/meeting-notes/summarize`
2. **Request Body**: 
   ```json
   {
     "transcript": "Meeting transcript text here..."
   }
   ```
3. **Response**:
   ```json
   {
     "summary": "AI-generated meeting summary..."
   }
   ```

### Frontend Implementation

1. **Component**: `AIMeetingNotes.jsx`
2. **Integration**: Added to `VideoMeet.jsx` page
3. **Features**:
   - Text area for entering/pasting meeting transcript
   - "Summarize" button to generate AI summary
   - Display of generated summary
   - "Download Notes" button to save summary as text file

## How to Use

1. Start both backend and frontend servers:
   - Backend: `cd backend && npm run dev`
   - Frontend: `cd frontend && npm start`

2. In the video meeting room, you'll see the "AI Meeting Notes" section

3. Paste or type a meeting transcript into the text area

4. Click "Summarize" to generate an AI-powered summary

5. Click "Download Notes" to save the summary as a text file

## Configuration

To use the real AI APIs instead of the mock implementation:

### Option 1: Gemini API (Recommended)
1. Get a Gemini API key from https://aistudio.google.com/
2. Update the `.env` file in the backend directory:
   ```
   GEMINI_API_KEY=your-actual-gemini-api-key-here
   ```

### Option 2: OpenAI API (Fallback)
1. Get an OpenAI API key from https://platform.openai.com/
2. Update the `.env` file in the backend directory:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

## Testing

You can test the feature using the provided `test-feature-6.html` file or directly through the video meeting interface.

## Dependencies

- `@google/generative-ai` package (for Gemini API)
- `openai` package (for audio transcription and fallback)
- AI API key (optional, uses mock implementation if not provided)