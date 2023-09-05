import express from "express";
import puppeteer from "puppeteer";
import cors from "cors";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const minimal_args = [
  "--autoplay-policy=user-gesture-required",
  "--disable-background-networking",
  "--disable-background-timer-throttling",
  "--disable-backgrounding-occluded-windows",
  "--disable-breakpad",
  "--disable-client-side-phishing-detection",
  "--disable-component-update",
  "--disable-default-apps",
  "--disable-dev-shm-usage",
  "--disable-domain-reliability",
  "--disable-extensions",
  "--disable-features=AudioServiceOutOfProcess",
  "--disable-gpu",
  "--disable-hang-monitor",
  "--disable-ipc-flooding-protection",
  "--disable-notifications",
  "--disable-offer-store-unmasked-wallet-cards",
  "--disable-popup-blocking",
  "--disable-print-preview",
  "--disable-prompt-on-repost",
  "--disable-renderer-backgrounding",
  "--disable-setuid-sandbox",
  "--disable-speech-api",
  "--disable-sync",
  "--hide-scrollbars",
  "--ignore-gpu-blacklist",
  "--metrics-recording-only",
  "--mute-audio",
  "--no-default-browser-check",
  "--no-first-run",
  "--no-pings",
  "--no-sandbox",
  "--no-zygote",
  "--password-store=basic",
  "--single-process",
  "--use-gl=swiftshader",
  "--use-mock-keychain",
];

interface BookmarkItem {
  title: string;
  screenshot: Buffer;
}

// Endpoint to take a screenshot, extract title and description
app.post("/api/screenshot", async (req, res) => {
  const { urls } = req.body;

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: minimal_args,
    });
    const page = await browser.newPage();

    const data: BookmarkItem[] = [];

    for (const url of urls) {
      console.log("Going to URL");
      await page.goto(url, { waitUntil: "domcontentloaded" });
      console.log("Gone to URL");

      const title = await page.title();
      console.log("Got title");
      const screenshot = await page.screenshot({ type: "jpeg", quality: 30 });
      console.log("Got screenshot");

      data.push({ title, screenshot });

      console.log("Finished", url);
    }

    await browser.close();

    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`⚡️ Server is running on port ${port}`);
});
