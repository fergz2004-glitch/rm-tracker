import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";   // ✅ FIXED IMPORT
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.get("/track", async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.json({ error: "Missing ?code=" });
    }

    const apiKey = process.env.ZENROWS_API_KEY;

    const url = `https://api.zenrows.com/v1/?apikey=${apiKey}&url=${encodeURIComponent(
        "https://www.royalmail.com/track-your-item"
    )}&js_render=true&premium_proxy=true`;

    try {
        const response = await fetch(url);
        const html = await response.text();

        console.log("HTML returned (first 500 chars):", html.substring(0, 500));

        const $ = cheerio.load(html);   // ✅ FIXED

        let status = $("span[class*=status], div[class*=status]")
            .first()
            .text()
            .trim();

        if (!status) status = "Unknown";

        return res.json({
            code,
            status,
        });

    } catch (err) {
        console.error(err);
        return res.json({ error: "Scraping failed" });
    }
});

app.listen(10000, () => console.log("Royal Mail tracker running on port 10000"));
