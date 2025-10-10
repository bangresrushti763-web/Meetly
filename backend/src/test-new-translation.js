// Simple test to verify the new translation library
import translate from "google-translate-api";

// Test translation
const testTranslation = async () => {
  try {
    console.log("Testing new translation API...");
    
    const text = "Hello, how are you today?";
    const targetLang = "es";
    
    console.log(`Translating: "${text}" to ${targetLang}`);
    
    const result = await translate(text, { to: targetLang });
    
    console.log("Translation successful!");
    console.log(`Original: ${text}`);
    console.log(`Translated: ${result.text}`);
    console.log(`Detected language: ${result.from.language.iso}`);
    
    // Test another language
    const frenchResult = await translate(text, { to: "fr" });
    console.log(`\nFrench translation: ${frenchResult.text}`);
    
  } catch (error) {
    console.error("Translation test failed:", error.message);
    console.error("Error details:", error);
  }
};

testTranslation();