# Gemini API Integration

This document describes how to integrate and use Google's Gemini API in the Meetly project for AI-powered meeting summarization and action item extraction.

## Implementation Details

### Backend Implementation

1. **New Controller**: `gemini.controller.js`
   - Contains functions for meeting summarization and action item extraction
   - Uses the `gemini-1.5-flash` model

2. **Updated Routes**: `meetingNotes.routes.js`
   - Modified to use Gemini API for text processing
   - Maintains OpenAI for audio transcription (as Gemini doesn't support this)
   - Includes fallback mechanisms to ensure functionality even if Gemini fails

3. **Dependencies**:
   - Added `@google/generative-ai` package
   - Maintains existing `openai` package for audio transcription

## How to Use

1. **Setup**:
   - Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/)
   - Update the `.env` file in the backend directory:
     ```
     GEMINI_API_KEY=your-actual-gemini-api-key-here
     ```

2. **Start the servers**:
   - Backend: `cd backend && npm run dev`
   - Frontend: `cd frontend && npm start`

3. **Using the feature**:
   - The existing meeting notes functionality will now use Gemini for text processing
   - Audio transcription still uses OpenAI Whisper model
   - All existing endpoints continue to work as before

## API Endpoints

The following endpoints in `meetingNotes.routes.js` now use Gemini for text processing:

1. **POST /api/v1/meeting-notes/summarize-text**
   - Generates meeting summaries and extracts action items using Gemini

2. **POST /api/v1/meeting-notes/summarize**
   - Generates meeting summaries using Gemini with fallback to OpenAI

3. **POST /api/v1/meeting-notes/upload-audio**
   - Transcribes audio using OpenAI Whisper
   - Generates summaries and extracts action items using Gemini

## Fallback Mechanisms

The implementation includes multiple fallback mechanisms:
1. If Gemini fails, the system falls back to OpenAI for summarization
2. If both AI services fail, a mock summary is generated
3. Action item extraction gracefully handles failures

## Testing

You can test the Gemini integration using the provided test file:
```bash
cd backend
node src/controllers/gemini.test.js
```

## Dependencies

- `@google/generative-ai` package (newly added)
- `openai` package (maintained for audio transcription)
- Gemini API key (required for AI features)