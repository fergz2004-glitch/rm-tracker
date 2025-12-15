import express from "express";
import fetch from "node-fetch";
import cheerio from "cheerio";

const app = express();

app.get("/track", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.json({ status: "Missing code" });

  try {
    const url = `https://www.royalmail.com/track-your-item#/tracking-results/${code}`;

    // NOTE: We call the actual HTML page behind this hash URL
    const htmlResponse = await fetch(
      `https://www.royalmail.com/track-your-item/track-results?trackingNumber=${code}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119 Safari/537.36",
          Accept: "text/html",
        },
      }
    );

    const html = await htmlResponse.text();

    const $ = cheerio.load(html);

    // Royal Mail status lives in a big <h2> tag like:
    // <h2 class="...">Delivered</h2>
    let status = $("h2")
      .filter((i, el) => $(el).text().trim().length > 0)
      .first()
      .text()
      .trim();

    if (!status) status = "Unknown";

    res.json({ status });
  } catch (err) {
    console.error("Scrape error:", err);
    res.json({ status: "Unknown" });
  }
});

app.listen(3000, () =>
  console.log("Royal Mail scraper running on port 3000")
);
