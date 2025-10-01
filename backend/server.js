import express from "express";
import { spawn } from "child_process";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

/**
 * Profile scraper endpoint
 * Runs Python scraper and returns profile + posts
 */
app.get("/api/profile/:username", (req, res) => {
  const username = req.params.username;
  console.log(`Scraping profile: ${username}`);

  const pyProcess = spawn("python", ["scraper.py", username]);

  let result = "";
  pyProcess.stdout.on("data", (data) => {
    result += data.toString();
  });

  pyProcess.stderr.on("data", (data) => {
    console.error("Python error:", data.toString());
  });

  pyProcess.on("close", (code) => {
    try {
      const parsed = JSON.parse(result);
      res.json(parsed);
    } catch (err) {
      console.error("JSON parse error:", err);
      res.status(500).json({ error: "Failed to parse scraper output" });
    }
  });
});

/**
 * Image proxy endpoint
 * Fetches Instagram CDN images through backend to bypass CORS
 */
app.get("/api/image", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).send("No URL provided");

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const buffer = await response.arrayBuffer();
    res.set("Content-Type", response.headers.get("content-type"));
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("Image proxy error:", err);
    res.status(500).send("Error fetching image");
  }
});

app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
