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
    throw new Error("Failed Royal Mail token");
  }

  return data.access_token;
}

app.get("/track", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.json({ status: "Missing code" });

  try {
    const token = await getAccessToken();

    const response = await fetch(
      `https://api.parcel.royalmail.com/api/v1/tracking/${code}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    const data = await response.json();
    const status = data?.mailPiece?.summary?.statusDescription || "Unknown";

    res.json({ status, raw: data });
  } catch (err) {
    console.error(err);
    res.json({ status: "Unknown" });
  }
});

app.listen(3000, () => {
  console.log("Royal Mail API running on port 3000");
});
