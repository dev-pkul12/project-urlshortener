require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(path.join(__dirname, "public")));

// Basic homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// In-memory store for URLs
let urlDatabase = {};
let counter = 1;

// API endpoint for shortening
app.post("/api/shorturl", (req, res) => {
  let inputUrl = req.body.url;

  // Check valid format
  try {
    let parsedUrl = new URL(inputUrl);

    // DNS check
    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: "invalid url" });
      } else {
        let short = counter++;
        urlDatabase[short] = inputUrl;
        res.json({ original_url: inputUrl, short_url: short });
      }
    });
  } catch (e) {
    res.json({ error: "invalid url" });
  }
});

// Redirect endpoint
app.get("/api/shorturl/:id", (req, res) => {
  let short = req.params.id;
  let original = urlDatabase[short];
  if (original) {
    res.redirect(original);
  } else {
    res.json({ error: "No short URL found" });
  }
});

module.exports = app;

// If running locally
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}
