import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Royal Mail tracker running");
});

app.get("/track", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.json({ error: "Missing code" });

  try {
    const url = `https://www.royalmail.com/track-your-item#/tracking-results/${code}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const html = await response.text();

    // 🔥 DEBUG LOG — this shows the first 500 characters received from Royal Mail
    console.log("HTML returned from Royal Mail:", html.substring(0, 500));

    // Parse the HTML
    const $ = cheerio.load(html);

    // Try scraping various possible status locations
    let status =
      $(".tracking-progress > li strong").first().text().trim() ||
      $(".status-summary h2").first().text().trim() ||
      $(".panel h2").first().text().trim() ||
      "Unknown";

    res.json({ status });
  } catch (err) {
    console.error("ERROR scraping Royal Mail:", err);
    res.json({ status: "Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Royal Mail tracker running on port ${PORT}`);
});
