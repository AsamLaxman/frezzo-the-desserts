import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const otpStore = new Map<string, string>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, systemInstruction } = req.body;
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: messages,
        config: { systemInstruction: systemInstruction }
      });
      res.json({ text: response.text });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/design-session", async (req, res) => {
    try {
      const { messages } = req.body;
      
      const designPrompt = {
        role: "user",
        parts: [{ text: "Based on the conversation history, generate a custom dessert recommendation. Output valid JSON containing 'title' (string), 'script' (string - an appetizing description of the dessert, about 100 words), 'imagePrompt' (string - highly detailed visual prompt for a gorgeous, mouth-watering dessert on a clean, elegant plate, 4K food photography), 'flavorProfiles' (array of strings, max 3 items, representing primary flavor notes like 'Rich', 'Zesty', 'Nutty'), and 'ingredients' (array of strings, listing the main ingredients)." }]
      };
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: [...messages, designPrompt],
        config: { 
          responseMimeType: "application/json"
        }
      });
      
      let parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/daily-special", async (req, res) => {
    try {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const prompt = `Generate a unique, mouth-watering dessert idea for the 'Daily Special' highlight card for the date ${today}. Output valid JSON containing 'title' (string, max 5 words) and 'description' (string, max 15 words). Keep it highly appetizing, premium, and creative.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: { 
          responseMimeType: "application/json"
        }
      });
      
      let parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, size } = req.body;
      let aspectRatio = "1:1";
      if (size === "1K" || size === "2K" || size === "4K") {
        aspectRatio = "16:9";
      }
      
      const response = await ai.models.generateImages({
        model: 'gemini-3-pro-image-preview',
        prompt,
        config: { 
            aspectRatio,
            outputMimeType: "image/jpeg"
        }
      });
      res.json({ imageBase64: response.generatedImages[0].image.imageBytes });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/generate-audio", async (req, res) => {
    try {
      const { text } = req.body;
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: text
      });
      const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (audioPart && audioPart.inlineData) {
        res.json({ audioBase64: audioPart.inlineData.data, mimeType: audioPart.inlineData.mimeType });
      } else {
        res.status(500).json({ error: "No audio generated" });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/send-otp", (req, res) => {
    const { contact } = req.body;
    if (!contact) return res.status(400).json({ error: "Contact required" });
    
    // Normalize and validate contact
    const isEmail = contact.includes("@");
    const cleanPhone = contact.replace(/[^0-9]/g, "");
    
    const isAllowedEmail = isEmail && contact.toLowerCase() === "asamlaxman2003@gmail.com";
    const isAllowedPhone = !isEmail && (cleanPhone === "9346122148" || cleanPhone === "919346122148");

    if (!isAllowedEmail && !isAllowedPhone) {
      return res.status(403).json({ error: "Access Denied. Only the authorized developer phone number (9346122148) or email is permitted." });
    }

    // Generate 6-digit random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(contact, otp);
    
    console.log(`[Mock SMS/Email] Sent OTP ${otp} to ${contact}`);
    
    res.json({ success: true, message: "OTP sent successfully", devOtp: otp });
  });

  app.post("/api/verify-otp", (req, res) => {
    const { contact, otp } = req.body;
    if (!contact) return res.status(400).json({ error: "Contact required" });

    // Normalize and validate contact
    const isEmail = contact.includes("@");
    const cleanPhone = contact.replace(/[^0-9]/g, "");
    
    const isAllowedEmail = isEmail && contact.toLowerCase() === "asamlaxman2003@gmail.com";
    const isAllowedPhone = !isEmail && (cleanPhone === "9346122148" || cleanPhone === "919346122148");

    if (!isAllowedEmail && !isAllowedPhone) {
      return res.status(403).json({ error: "Access Denied." });
    }

    const storedOtp = otpStore.get(contact);
    
    if (storedOtp && storedOtp === otp) {
      otpStore.delete(contact);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Invalid or expired OTP" });
    }
  });

  app.post("/api/export-to-drive", async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) throw new Error("Unauthorized - No access token provided");
      
      const { profileData } = req.body;
      const { google } = await import('googleapis');
      
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: token });
      
      const drive = google.drive({ version: 'v3', auth: oauth2Client });
      
      const fileMetadata = {
        name: 'Frezzo_Profile_Data.json',
        mimeType: 'application/json'
      };
      
      const media = {
        mimeType: 'application/json',
        body: JSON.stringify(profileData, null, 2)
      };
      
      const file = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink'
      });
      
      res.json({ success: true, fileId: file.data.id, link: file.data.webViewLink });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/export-to-sheets", async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) throw new Error("Unauthorized - No access token provided");
      
      const { profileData } = req.body;
      const { google } = await import('googleapis');
      
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: token });
      
      const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
      
      const spreadsheet = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: 'Frezzo Storage & Profile Data'
          }
        }
      });
      
      const spreadsheetId = spreadsheet.data.spreadsheetId;
      
      const values = [
        ['Category', 'Key', 'Value'],
        ['Personal', 'Name', profileData.personal?.name || ''],
        ['Personal', 'Email', profileData.personal?.email || ''],
        ['Personal', 'Phone', profileData.personal?.phone || ''],
        ['Financial', 'Status', profileData.financial?.status || ''],
        ['Financial', 'Member Type', profileData.financial?.memberType || ''],
        ['Login', 'Provider', profileData.loginInformation?.provider || ''],
        ['Login', 'Last Login', profileData.loginInformation?.lastLogin || ''],
        ['Storage', 'Provider', profileData.storage?.provider || ''],
        ['Storage', 'Capacity', profileData.storage?.capacity || ''],
      ];
      
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1:C10',
        valueInputOption: 'RAW',
        requestBody: {
          values
        }
      });
      
      res.json({ success: true, spreadsheetId, link: spreadsheet.data.spreadsheetUrl });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
