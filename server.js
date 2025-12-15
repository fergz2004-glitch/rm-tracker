import express from "express";
import fetch from "node-fetch";
import cheerio from "cheerio";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ------------- Helper: extract status from HTML -------------
function extractStatus(html) {
    const $ = cheerio.load(html);

    // 1. Delivered (Royal Mail shows a green tick + "Delivered")
    const delivered = $("h2:contains('Delivered'), .complete:contains('Delivered')").text().trim();
    if (delivered) return "Delivered";

    // 2. In transit
    const inTransit = $("strong:contains('Item'), strong:contains('We have received')").text().trim();
    if (inTransit) return "In Transit";

    // 3. Attempted delivery
    const attempted = $("*:contains('attempted')").text().trim();
    if (attempted.toLowerCase().includes("attempt")) return "Attempted Delivery";

    // 4. If Royal Mail blocks us, HTML includes "Access Denied"
    if (html.includes("Access Denied")) return "Blocked by Royal Mail - Try again";

    return "Unknown";
}

// ------------------- TRACK ENDPOINT -------------------
app.get("/track", async (req, res) => {
    const code = req.query.code;
    if (!code) return res.json({ error: "Tracking code missing" });

    try {
        const zenURL = `https://api.zenrows.com/v1/?apikey=${process.env.ZENROWS_API_KEY}&url=https://www.royalmail.com/track-your-item#/tracking-results/${code}`;

        const response = await fetch(zenURL);
        const html = await response.text();

        console.log("Raw HTML snippet:", html.substring(0, 500)); // Debug

        const status = extractStatus(html);

        res.json({ code, status });
    } catch (error) {
        res.json({ error: error.message });
    }
});

// ------------------- SERVER START -------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Royal Mail tracker running on port ${PORT}`));
