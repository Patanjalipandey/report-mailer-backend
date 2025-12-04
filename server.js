import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import * as reportTemplateModule from "./reportTemplate.js";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { Resend } from "resend";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// ===============================
// IMPORT REPORT TEMPLATE
// ===============================
const reportTemplate =
  typeof reportTemplateModule === "function"
    ? reportTemplateModule
    : reportTemplateModule.default;

if (!reportTemplate) {
  console.error("❌ reportTemplate not found!");
  process.exit(1);
}

// ===============================
// INIT RESEND API
// ===============================
const resend = new Resend(process.env.RESEND_API_KEY);

// ===============================
// SEND REPORT
// ===============================
app.post("/send-report", async (req, res) => {
  try {
    const { title, period, compiled, rows, sendTo } = req.body;

    const recipients = sendTo.split(",").map((e) => e.trim());
    const htmlContent = reportTemplate({ title, period, compiled, rows });

    // ================================
    // GENERATE PDF (Chromium)
    // ================================
    console.log("📄 Launching Chromium...");
    const executablePath = await chromium.executablePath();

    const browser = await puppeteer.launch({
      executablePath,
      args: chromium.args,
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();
    console.log("✅ PDF generated!");

    // ================================
    // SEND EMAIL USING RESEND API
    // ================================
    const { data, error } = await resend.emails.send({
      from: "reports@tbcpl.co.in",
      to: recipients,
      subject: "Weekly Watchlist Report",
      html: htmlContent,

      attachments: [
        {
          fileName: "fraud-report.pdf",
          content: pdfBuffer.toString("base64"),
          type: "application/pdf",
        },
        {
          fileName: "logo.png",
          path: "./logo.png",
          content_id: "truebuddylogo",
        },
      ],
    });

    if (error) {
      console.error("❌ Resend API Error:", error);
      return res.status(500).json({ error });
    }

    return res.json({ message: "Email sent successfully!", data });

  } catch (error) {
    console.error("❌ Server Error:", error);
    return res.status(500).json({ error });
  }
});

// ===============================
// TEST ROUTE
// ===============================
app.get("/", (req, res) => {
  res.send("Mailer running with Resend API 🚀");
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server live on port ${PORT}`));
