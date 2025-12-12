import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/track", async (req, res) => {
  const code = req.query.code;

  if (!code) return res.json({ status: "Missing code" });

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
    );

    // Listen for Royal Mail API JSON response
    let trackingResult = null;

    page.on("response", async (response) => {
      const url = response.url();

      if (url.includes("/track-your-item/track")) {
        try {
          const json = await response.json();
          trackingResult = json;
        } catch (e) {}
      }
    });

    // Load RM tracking page
    await page.goto("https://www.royalmail.com/track-your-item", {
      waitUntil: "networkidle2"
    });

    await page.type("#tracking-number", code);

    await Promise.all([
      page.click("button[type=submit]"),
      page.waitForNavigation({ waitUntil: "networkidle2" })
    ]);

    await page.waitForTimeout(3000);

    await browser.close();

    if (!trackingResult) {
      return res.json({ status: "Unknown" });
    }

    const status =
      trackingResult?.mailPieces?.[0]?.summary?.statusDescription ||
      "Unknown";

    res.json({ status });
  } catch (err) {
    console.error(err);
    res.json({ status: "Unknown" });
  }
});

app.listen(3000, () => {
  console.log("Royal Mail tracker running on port 3000");
});
