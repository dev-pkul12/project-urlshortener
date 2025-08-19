require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const bodyParser = require("body-parser");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));

// In-memory database (use MongoDB in production)
let urls = {};
let counter = 1;

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// POST to create a short URL
app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;

  // Validate URL
  try {
    const urlObj = new URL(originalUrl);
    dns.lookup(urlObj.hostname, (err) => {
      if (err) {
        return res.json({ error: "invalid url" });
      }

      // Save URL
      const shortUrl = counter++;
      urls[shortUrl] = originalUrl;

      res.json({
        original_url: originalUrl,
        short_url: shortUrl,
      });
    });
  } catch (e) {
    return res.json({ error: "invalid url" });
  }
});

// Redirect to original URL
app.get("/api/shorturl/:id", (req, res) => {
  const shortUrl = req.params.id;
  const originalUrl = urls[shortUrl];

  if (originalUrl) {
    return res.redirect(originalUrl);
  } else {
    return res.json({ error: "No short URL found for given input" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
