import express from "express";
import fetch from "node-fetch";
import { load } from "cheerio";

const app = express();

app.get("/track", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.json({ status: "Missing code" });

  try {
    // HTML endpoint behind the Royal Mail UI
    const url = `https://www.royalmail.com/track-your-item/track-results?trackingNumber=${code}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept: "text/html"
      }
    });

    const html = await response.text();
    const $ = load(html);

    // Look for the main status headline, e.g. Delivered, Retained, Attempted, etc.
    const h2List = $("h2")
      .map((i, el) => $(el).text().trim())
      .get();

    let status = h2List.find(t => t.length > 0) || "Unknown";

    return res.json({ status });

  } catch (err) {
    console.error("Scrape error:", err);
    return res.json({ status: "Unknown" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Royal Mail tracker running on port ${PORT}`)
);

