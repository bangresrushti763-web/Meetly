// Simple test to verify translation functionality
import translate from "@vitalets/google-translate-api";

// Test translation
const testTranslation = async () => {
  try {
    console.log("Testing translation API...");
    
    const text = "Hello, how are you today?";
    const targetLang = "es";
    
    console.log(`Translating: "${text}" to ${targetLang}`);
    
    const result = await translate(text, { to: targetLang });
    
    console.log("Translation successful!");
    console.log(`Original: ${text}`);
    console.log(`Translated: ${result.text}`);
    console.log(`Detected language: ${result.from.language.iso}`);
    console.log(`Confidence: ${result.from.language.confidence}`);
    
    // Test another language
    const frenchResult = await translate(text, { to: "fr" });
    console.log(`\nFrench translation: ${frenchResult.text}`);
    
  } catch (error) {
    console.error("Translation test failed:", error.message);
  }
};

testTranslation();