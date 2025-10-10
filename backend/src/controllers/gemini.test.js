// Test file for Gemini API integration
import { summarizeMeeting, extractActionItems } from "./gemini.controller.js";

// Sample meeting transcript for testing
const sampleTranscript = `
John: Good morning everyone. Let's start the meeting about the new product launch.
Sarah: Good morning. I've prepared the marketing plan for the new product.
Mike: I've completed the development timeline and it's on track for the Q1 release.
John: Great. Sarah, can you share the marketing milestones?
Sarah: Sure. We need to finalize the campaign by December 15th and start the social media push by January 5th.
Mike: From the development side, we need the final assets by December 10th to integrate them into the app.
John: Perfect. Let's assign action items. Sarah, please finalize the marketing campaign by December 15th.
Sarah: Will do.
John: Mike, please ensure the final assets are delivered by December 10th.
Mike: Absolutely.
John: I'll follow up with the finance team about the budget allocation. Let's meet again next week to review progress.
`;

// Test the summarizeMeeting function
async function testSummarizeMeeting() {
  try {
    console.log("Testing meeting summarization with Gemini...");
    const summary = await summarizeMeeting(sampleTranscript);
    console.log("Summary:", summary);
  } catch (error) {
    console.error("Error testing summarizeMeeting:", error);
  }
}

// Test the extractActionItems function
async function testExtractActionItems() {
  try {
    console.log("\nTesting action item extraction with Gemini...");
    const actionItems = await extractActionItems(sampleTranscript);
    console.log("Action Items:", actionItems);
  } catch (error) {
    console.error("Error testing extractActionItems:", error);
  }
}

// Run the tests
testSummarizeMeeting();
testExtractActionItems();

export { testSummarizeMeeting, testExtractActionItems };