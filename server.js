import express from "express";
import fetch from "node-fetch";

const app = express();

const CLIENT_ID = process.env.RM_CLIENT_ID;
const CLIENT_SECRET = process.env.RM_CLIENT_SECRET;

async function getAccessToken() {
  const response = await fetch(
    "https://api.parcel.royalmail.com/oauth/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`
    }
  );

  const data = await response.json();

  if (!data.access_token) {
    console.error("OAuth error:", data);
    throw new Error("Token failed");
  }

  return data.access_token;
}

app.get("/check", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.json({ status: "Missing code" });

  try {
    const token = await getAccessToken();

    const url = `https://api.parcel.royalmail.com/api/v1/shipping-events/${code}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      }
    });

    const data = await response.json();

    if (!data?.events || data.events.length === 0) {
      return res.json({ status: "Not Delivered" });
    }

    const delivered = data.events.find(e =>
      e.description?.toLowerCase().includes("delivered")
    );

    if (delivered) {
      return res.json({
        status: "Delivered",
        timestamp: delivered.timestamp
      });
    }

    return res.json({ status: "In Transit" });
  } catch (err) {
    console.error(err);
    return res.json({ status: "Unknown" });
  }
});

app.listen(3000, () => {
  console.log("C&D Delivery Checker running on port 3000");
});
