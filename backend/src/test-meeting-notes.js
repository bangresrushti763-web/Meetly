// Simple test to verify meeting notes functionality
import { MeetingNotes } from "./models/meetingNotes.model.js";
import mongoose from "mongoose";

// Connect to MongoDB
mongoose.connect("mongodb+srv://meetly:meetly@cluster0.kzloyb9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

// Create a test meeting note
const testMeetingNote = new MeetingNotes({
    meetingId: "test-meeting-123",
    transcript: "This is a test transcript of a meeting discussion.",
    summary: "This is a test summary of the meeting.",
    actionItems: ["Review the project plan", "Schedule next meeting", "Send follow-up emails"]
});

// Save the test meeting note
testMeetingNote.save()
    .then(result => {
        console.log("Test meeting note saved successfully:", result);
        mongoose.connection.close();
    })
    .catch(error => {
        console.error("Error saving test meeting note:", error);
        mongoose.connection.close();
    });