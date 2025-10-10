// Simple test server to verify translation routes
import express from "express";
import translate from "@vitalets/google-translate-api";

const app = express();
app.use(express.json());

app.post("/translate", async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    console.log(`Translating: "${text}" to ${targetLang}`);
    
    const result = await translate(text, { to: targetLang });
    
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

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Translation test server running on port ${PORT}`);
  
  // Test the translation directly
  setTimeout(async () => {
    try {
      console.log("Testing translation directly...");
      const result = await translate("Hello, how are you?", { to: "es" });
      console.log("Direct translation result:", result.text);
    } catch (error) {
      console.error("Direct translation failed:", error.message);
    }
  }, 1000);
});