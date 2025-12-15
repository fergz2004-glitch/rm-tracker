import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/track", async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).json({ error: "Missing tracking code" });
    }

    const trackingUrl = `https://www.royalmail.com/track-your-item#/tracking-results/${code}`;

    // ✅ --- THIS IS THE CORRECTED ZENROWS REQUEST SNIPPET ---
    const apiUrl =
        `https://api.zenrows.com/v1/?apikey=${process.env.ZENROWS_API_KEY
        }&url=${encodeURIComponent(trackingUrl)
        }&js_render=true&premium_proxy=true&device=desktop`;

    console.log("ZenRows URL:", apiUrl);

    const response = await fetch(apiUrl);
    const html = await response.text();

    // Log first HTML block for debugging
    console.log("FULL HTML FROM ZENROWS:\n", html.substring(0, 600));
    // ----------------------------------------------------------

    // Load HTML into Cheerio
    const $ = cheerio.load(html);

    let status = "Unknown";

    // We will fix parsing once ZenRows returns real HTML
    // Placeholder selectors for now:
    const statusElement = $("div.delivery-status, h2, .tracking-status");

    if (statusElement.length > 0) {
        status = statusElement.first().text().trim();
    }

    return res.json({
        code,
        status,
    });
});

app.listen(PORT, () => {
    console.log(`Royal Mail tracker running on port ${PORT}`);
});
