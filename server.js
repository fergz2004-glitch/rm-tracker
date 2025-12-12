import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/track", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.json({ status: "Missing code" });
  }

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    console.log("Loading tracking page...");
    await page.goto("https://www.royalmail.com/track-your-item", {
      waitUntil: "networkidle2"
    });

    await page.type("#tracking-number", code);
    await page.click("button[type=submit]");

    console.log("Waiting for results...");
    await page.waitForSelector(".track-summary", { timeout: 20000 });

    const status = await page.evaluate(() => {
      const el = document.querySelector(".track-summary .status-description");
      return el ? el.innerText.trim() : "Unknown";
    });

    await browser.close();

    return res.json({ status });

  } catch (err) {
    console.error("Error:", err);
    return res.json({ status: "Unknown" });
  }
});

app.listen(3000, () => {
  console.log("Royal Mail tracker running on port 3000");
});
