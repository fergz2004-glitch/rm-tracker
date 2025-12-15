import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";   // ✅ Correct import
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.get("/track", async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.json({ error: "Missing ?code=" });
    }

    if (!process.env.ZENROWS_API_KEY) {
        return res.json({ error: "Missing ZENROWS_API_KEY in environment settings." });
    }

    const apiKey = process.env.ZENROWS_API_KEY;

    // Royal Mail tracking page
    const targetUrl = `https://www.royalmail.com/track-your-item#/tracking-results/${code}`;

    // ZenRows URL (JS rendering + anti-bot + premium proxies)
    const zenUrl = `https://api.zenrows.com/v1/?apikey=${apiKey}&url=${encodeURIComponent(
        targetUrl
    )}&js_render=true&premium_proxy=true`;

    try {
        const response = await fetch(zenUrl);
        const html = await response.text();

        console.log("HTML returned (first 500 chars):", html.substring(0, 500));

        const $ = cheerio.load(html);

        // Extract tracking status
        let status = $("span[class*=status], div[class*=status], h2")
            .first()
            .text()
            .trim();

        if (!status) status = "Unknown";

        return res.json({
            code,
            status,
        });

    } catch (err) {
        console.error("Scraping error:", err);
        return res.json({ error: "Scraping failed" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Royal Mail tracker running on port ${PORT}`));
