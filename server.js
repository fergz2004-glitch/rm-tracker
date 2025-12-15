import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

const ZENROWS_API_KEY = process.env.ZENROWS_API_KEY;

app.get("/", (req, res) => {
  res.send("Royal Mail tracker (ZenRows version) running");
});

app.get("/track", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.json({ error: "Missing tracking code" });

  try {
    const rmUrl = `https://www.royalmail.com/track-your-item#/tracking-results/${code}`;

    const zenUrl = `https://api.zenrows.com/v1/?apikey=${ZENROWS_API_KEY}&url=${encodeURIComponent(
      rmUrl
    )}&js_render=true&premium_proxy=true`;

    const zenResponse = await fetch(zenUrl);
    const html = await zenResponse.text();

    console.log("HTML length:", html.length);

    const $ = cheerio.load(html);

    let status =
      $("h2").first().text().trim() ||
      $(".tracking-progress li strong").first().text().trim() ||
      $(".panel h2").first().text().trim() ||
      $(".status-summary h2").first().text().trim() ||
      "Unknown";

    res.json({ code, status });
  } catch (err) {
    console.error("ZenRows ERROR:", err);
    res.json({ status: "Error fetching tracking info" });
  }
});

app.listen(PORT, () => {
  console.log(`Royal Mail tracker running on port ${PORT}`);
});
