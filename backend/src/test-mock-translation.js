// Simple test to verify the mock translation implementation
import express from "express";

const app = express();
app.use(express.json());

// Mock translation function for testing
const mockTranslate = (text, targetLang) => {
  const mockTranslations = {
    "es": {
      "Hello": "Hola",
      "how are you": "cómo estás",
      "today": "hoy"
    },
    "fr": {
      "Hello": "Bonjour",
      "how are you": "comment allez-vous",
      "today": "aujourd'hui"
    }
  };

  let translatedText = text;
  if (mockTranslations[targetLang]) {
    for (const [key, value] of Object.entries(mockTranslations[targetLang])) {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      translatedText = translatedText.replace(regex, value);
    }
  }

  return {
    text: translatedText || text,
    from: { language: { iso: "en" } }
  };
};

app.post("/translate", async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    console.log(`Translating: "${text}" to ${targetLang}`);
    
    const result = mockTranslate(text, targetLang);
    
    res.json({ 
      translatedText: result.text,
      from: result.from.language.iso,
      to: targetLang
    });
  } catch (error) {
    console.error("Translation Error:", error);
    res.status(500).json({ error: "Translation failed", message: error.message });
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Mock translation test server running on port ${PORT}`);
  
  // Test the translation directly
  setTimeout(async () => {
    try {
      console.log("Testing mock translation directly...");
      const result = mockTranslate("Hello, how are you today?", "es");
      console.log("Mock translation result:", result.text);
    } catch (error) {
      console.error("Mock translation failed:", error.message);
    }
  }, 1000);
});