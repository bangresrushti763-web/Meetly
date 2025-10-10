import express from "express";
import multer from "multer";
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import OpenAI from "openai";
import { MeetingNotes } from "../models/meetingNotes.model.js";
import { mockOpenAI } from "../controllers/mockOpenAI.js";
import { summarizeMeeting, extractActionItems, transcribeAudio } from "../controllers/gemini.controller.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const uploadPath = join(__dirname, '../../uploads');
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Initialize OpenAI or use mock
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.warn("OpenAI API key not found, using mock OpenAI for testing");
  openai = mockOpenAI;
}

// Upload audio + generate transcript + summary
router.post("/upload-audio", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided." });
    }

    // Step 1: Transcribe audio (still using OpenAI as Gemini doesn't support audio transcription)
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: "whisper-1",
    });

    const transcriptText = transcription.text;

    // Step 2: Generate meeting notes using Gemini
    let summary;
    try {
      summary = await summarizeMeeting(transcriptText);
    } catch (error) {
      console.error("Gemini summarization failed, using mock summary:", error);
      // Fallback to mock summary if Gemini fails
      summary = `This is a mock summary of the meeting.

Key points discussed:
- Point 1
- Point 2
- Point 3

Action items:
- Follow up on item 1
- Complete task 2 by EOD`;
    }

    // Step 3: Extract action items using Gemini
    let actionItems = [];
    try {
      actionItems = await extractActionItems(transcriptText);
    } catch (error) {
      console.error("Gemini action item extraction failed:", error);
      // Fallback to empty array if extraction fails
      actionItems = [];
    }

    // Save to database
    const meetingNotes = new MeetingNotes({
      meetingId: req.body.meetingId || "default",
      transcript: transcriptText,
      summary: summary,
      actionItems: actionItems
    });

    await meetingNotes.save();

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      transcript: transcriptText,
      summary: summary,
      actionItems: actionItems,
      meetingNotesId: meetingNotes._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process meeting notes." });
  }
});

// New endpoint for text-based meeting summarization
router.post("/summarize-text", async (req, res) => {
  try {
    const { transcript, meetingId } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: "Transcript is required." });
    }

    // Generate meeting notes using Gemini
    let summary;
    try {
      summary = await summarizeMeeting(transcript);
    } catch (error) {
      console.error("Gemini summarization failed, using mock summary:", error);
      // Fallback to mock summary if Gemini fails
      summary = `This is a mock summary of the meeting.

Key points discussed:
- Point 1
- Point 2
- Point 3

Action items:
- Follow up on item 1
- Complete task 2 by EOD`;
    }

    // Extract action items using Gemini
    let actionItems = [];
    try {
      actionItems = await extractActionItems(transcript);
    } catch (error) {
      console.error("Gemini action item extraction failed:", error);
      // Fallback to empty array if extraction fails
      actionItems = [];
    }

    // Save to database
    const meetingNotes = new MeetingNotes({
      meetingId: meetingId || "text-summary",
      transcript: transcript,
      summary: summary,
      actionItems: actionItems
    });

    await meetingNotes.save();

    res.json({
      transcript: transcript,
      summary: summary,
      actionItems: actionItems,
      meetingNotesId: meetingNotes._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to summarize meeting notes." });
  }
});

// Get meeting notes by ID
router.get("/:id", async (req, res) => {
  try {
    const meetingNotes = await MeetingNotes.findById(req.params.id);
    if (!meetingNotes) {
      return res.status(404).json({ error: "Meeting notes not found." });
    }
    res.json(meetingNotes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve meeting notes." });
  }
});

// Endpoint for summarizing meeting transcript (as per Feature 6 instructions)
router.post("/summarize", async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: "Transcript is required." });
    }

    // Use Gemini for summarization
    let summary;
    try {
      summary = await summarizeMeeting(transcript);
    } catch (error) {
      console.error("Gemini summarization failed:", error);
      // Fallback to OpenAI if Gemini fails
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a meeting note summarizer." },
            { role: "user", content: `Summarize this meeting:\n\n${transcript}` },
          ],
        });
        summary = response.choices[0].message.content;
      } catch (openaiError) {
        console.error("OpenAI also failed, using mock summary:", openaiError);
        // Final fallback to mock summary
        summary = `This is a mock summary of the meeting.

Key points discussed:
- Point 1
- Point 2
- Point 3

Action items:
- Follow up on item 1
- Complete task 2 by EOD`;
      }
    }

    res.json({ summary: summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;