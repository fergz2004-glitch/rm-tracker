import express from "express";
import fetch from "node-fetch";
import { load } from "cheerio";

const app = express();

app.get("/track", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.json({ status: "Missing code" });

  try {
    // Royal Mail HTML endpoint
    const response = await fetch(
      `https://www.royalmail.com/track-your-item/track-results?trackingNumber=${code}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
          Accept: "text/html",
        },
      }
    );

    const html = await response.text();
    const $ = load(html);

    // Extract the big tracking status <h2>
    let status = $("h2")
      .filter((i, el) => $(el).text().trim().length > 0)
      .first()
      .text()
      .trim();

    if (!status) status = "Unknown";

    return res.json({ status });
  } catch (err) {
    console.error("Scrape error:", err);
    return res.json({ status: "Unknown" });
  }
});

// Render uses PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Royal Mail scraper running on port ${PORT}`)
);
