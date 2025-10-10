import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

// Initialize Gemini with API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to get the generative model
const getModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

// Function to summarize meeting transcript
export const summarizeMeeting = async (transcript) => {
  try {
    const model = getModel();
    
    const prompt = `You are a meeting assistant. Your task is to summarize meeting transcripts and extract action items. Provide a concise summary and a list of action items with owners if mentioned.
    
    Summarize this meeting transcript and extract action items:
    ${transcript}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();
    
    return summary;
  } catch (error) {
    console.error("Error summarizing meeting with Gemini:", error);
    throw error;
  }
};

// Function to extract action items from transcript
export const extractActionItems = async (transcript) => {
  try {
    const model = getModel();
    
    const prompt = `Extract action items from this meeting transcript. Return them as a numbered list. If there are no action items, return 'No action items identified.'
    
    Extract action items from this meeting transcript:
    ${transcript}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const actionItemsText = response.text();
    
    // Convert action items text to array
    let actionItems = [];
    if (actionItemsText && !actionItemsText.includes("No action items identified")) {
      actionItems = actionItemsText.split('\n').filter(item => item.trim() !== '' && /^\d+\./.test(item.trim()));
    }
    
    return actionItems;
  } catch (error) {
    console.error("Error extracting action items with Gemini:", error);
    throw error;
  }
};

// Function to transcribe audio (Note: Gemini doesn't do audio transcription, so we'll keep using OpenAI for this)
export const transcribeAudio = async (filePath) => {
  // This function is a placeholder as Gemini doesn't handle audio transcription
  // We'll continue using OpenAI for audio transcription
  throw new Error("Audio transcription not implemented with Gemini. Use OpenAI for this feature.");
};