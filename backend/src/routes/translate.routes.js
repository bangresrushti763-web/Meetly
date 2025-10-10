import express from "express";

const router = express.Router();

// Mock translation function for demonstration
// In a real application, you would replace this with an actual translation service
const mockTranslate = (text, targetLang) => {
  // Simple mock translations for demonstration
  const mockTranslations = {
    "es": {
      "Hello": "Hola",
      "how are you": "cómo estás",
      "today": "hoy",
      "Good morning": "Buenos días",
      "Thank you": "Gracias",
      "Please": "Por favor",
      "Yes": "Sí",
      "No": "No"
    },
    "fr": {
      "Hello": "Bonjour",
      "how are you": "comment allez-vous",
      "today": "aujourd'hui",
      "Good morning": "Bonjour",
      "Thank you": "Merci",
      "Please": "S'il vous plaît",
      "Yes": "Oui",
      "No": "Non"
    },
    "de": {
      "Hello": "Hallo",
      "how are you": "wie geht es Ihnen",
      "today": "heute",
      "Good morning": "Guten Morgen",
      "Thank you": "Danke",
      "Please": "Bitte",
      "Yes": "Ja",
      "No": "Nein"
    }
  };

  // Simple word replacement for demonstration
  let translatedText = text;
  if (mockTranslations[targetLang]) {
    for (const [key, value] of Object.entries(mockTranslations[targetLang])) {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      translatedText = translatedText.replace(regex, value);
    }
  }

  // If no translation found, just return the original text
  return {
    text: translatedText || text,
    from: { language: { iso: "en" } }
  };
};

// Translate endpoint
router.post("/translate", async (req, res) => {
  try {
    const { text, targetLang } = req.body;

    // Validate input
    if (!text || !targetLang) {
      return res.status(400).json({ error: "Text and targetLang are required" });
    }

    // Use mock translation for demonstration
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

// Language detection endpoint (mock)
router.post("/detect", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Mock language detection - always returns English
    res.json({ 
      detectedLanguage: "en",
      confidence: 0.9
    });
  } catch (error) {
    console.error("Language Detection Error:", error);
    res.status(500).json({ error: "Language detection failed", message: error.message });
  }
});

export default router;