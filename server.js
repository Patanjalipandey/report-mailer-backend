import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import * as reportTemplateModule from "./reportTemplate.js";
import cors from "cors";

// PDF generator
import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

dotenv.config();
const app = express();
app.use(express.json());

app.use(cors({
  origin: "*"
}));

// =========================
// FIX IMPORT FOR TEMPLATE
// =========================
const reportTemplate =
  typeof reportTemplateModule === "function"
    ? reportTemplateModule
    : typeof reportTemplateModule.default === "function"
      ? reportTemplateModule.default
      : null;

if (!reportTemplate) {
  console.error("❌ reportTemplate is not a function. Check reportTemplate.js!");
  process.exit(1);
}

// =========================
//  RESEND SMTP CONFIG
// =========================
const transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  port: 587,
  secure: false,
  auth: {
    user: "resend",
    pass: process.env.RESEND_API_KEY
  }
});

// =========================
//  SEND REPORT EMAIL
// =========================
app.post("/send-report", async (req, res) => {
  try {
    const { title, period, compiled, rows, sendTo } = req.body;
    
    const htmlContent = reportTemplate({ title, period, compiled, rows });

    // MULTIPLE EMAIL SUPPORT
    const sendToList = sendTo.split(",").map(e => e.trim());

    // =========================
    // PDF GENERATION (Render compatible)
    // =========================
    console.log("📄 Launching Chromium...");

    const executablePath = await chromium.executablePath;

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true
    });

    await browser.close();

    console.log("✅ PDF Generated!");

    // =========================
    // EMAIL OPTIONS
    // =========================
    const mailOptions = {
      from: "onboarding@resend.dev",
      to: sendToList,
      subject: "Weekly Watchlist Report",
      html: htmlContent,
      attachments: [
        {
          filename: "logo.png",
          path: "./logo.png",
          cid: "truebuddylogo"
        },
        {
          filename: "fraud-report.pdf",
          content: pdfBuffer
        }
      ]
    };

    // SEND EMAIL
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email Error:", error);
        return res.status(500).json({ error: "Failed to send email", details: error });
      }
      return res.json({ message: "Email sent successfully!", info });
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Something went wrong", details: error });
  }
});

// =========================
//  TEST ROUTE
// =========================
app.get("/", (req, res) => {
  res.send("Mailer is running...");
});

// =========================
//  START SERVER
// =========================
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Mailer running on port ${PORT}`));
