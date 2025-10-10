import mongoose, { Schema } from "mongoose";

const meetingNotesSchema = new Schema({
    meetingId: { type: String, required: true },
    transcript: { type: String, required: true },
    summary: { type: String, required: true },
    actionItems: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now }
});

const MeetingNotes = mongoose.model("MeetingNotes", meetingNotesSchema);

export { MeetingNotes };