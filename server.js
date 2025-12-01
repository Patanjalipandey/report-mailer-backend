import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import * as reportTemplateModule from "./reportTemplate.js";
import cors from "cors";

// PDF dependencies
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

dotenv.config();
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

// ========================================
// FIX IMPORT FOR TEMPLATE
// ========================================
const reportTemplate =
  typeof reportTemplateModule === "function"
    ? reportTemplateModule
    : typeof reportTemplateModule.default === "function"
      ? reportTemplateModule.default
      : null;

if (!reportTemplate) {
  console.error("❌ reportTemplate is not a function!");
  process.exit(1);
}

// ========================================
// RESEND SMTP CONFIG
// ========================================
const transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  port: 587,
  secure: false,
  auth: {
    user: "resend",
    pass: process.env.RESEND_API_KEY,
  },
});

// ========================================
// SEND REPORT EMAIL
// ========================================
app.post("/send-report", async (req, res) => {
  try {
    const { title, period, compiled, rows, sendTo } = req.body;

    // Generate HTML template
    const htmlContent = reportTemplate({ title, period, compiled, rows });

    // Handle multiple recipients
    const sendToList = sendTo.split(",").map((email) => email.trim());

    // ========================================
    // GENERATE PDF USING SPARTICUZ CHROMIUM
    // ========================================
    console.log("📄 Launching Chromium...");

const executablePath = await chromium.executablePath();

const browser = await puppeteer.launch({
  executablePath,
  args: chromium.args,
  headless: chromium.headless,
  defaultViewport: chromium.defaultViewport
});


    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();
    console.log("✅ PDF generated successfully!");

    // ========================================
    // SEND EMAIL
    // ========================================
    const mailOptions = {
      from: "onboarding@resend.dev",
      to: sendToList,
      subject: "Weekly Watchlist Report",
      html: htmlContent,
      attachments: [
        {
          filename: "logo.png",
          path: "./logo.png", // MUST exist in backend root
          cid: "truebuddylogo",
        },
        {
          filename: "fraud-report.pdf",
          content: pdfBuffer,
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("❌ Email Error:", error);
        return res.status(500).json({ error: "Failed to send email", details: error });
      }

      return res.json({ message: "Email sent successfully!", info });
    });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Something went wrong", details: error });
  }
});

// ========================================
// TEST ROUTE
// ========================================
app.get("/", (req, res) => {
  res.send("Mailer is running...");
});

// ========================================
// START SERVER
// ========================================
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Mailer running on port ${PORT}`));

