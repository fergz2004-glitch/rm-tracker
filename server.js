import express from "express";
import fetch from "node-fetch";

const app = express();

// Placeholder credentials – replace later
const CLIENT_ID = "YOUR_CLIENT_ID_HERE";
const CLIENT_SECRET = "YOUR_CLIENT_SECRET_HERE";

app.get("/track", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.json({ status: "Missing code" });
  }

  try {
    const url = `https://api.royalmail.net/mailpieces/v2/${code}/events`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-ibm-client-id": CLIENT_ID,
        "x-ibm-client-secret": CLIENT_SECRET,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      return res.json({ status: "Unknown" });
    }

    const data = await response.json();

    // Extract status safely
    const status =
      data?.mailPieces?.[0]?.events?.[0]?.eventDescription ||
      data?.mailPieces?.[0]?.summary?.statusDescription ||
      "Unknown";

    return res.json({ status });
  } catch (err) {
    console.error("Error:", err);
    return res.json({ status: "Unknown" });
  }
});

// Render uses PORT environment variable
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Royal Mail tracker running on port ${PORT}`));
