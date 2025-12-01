import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import * as reportTemplateModule from "./reportTemplate.js";
import cors from "cors";
import puppeteer from "puppeteer";

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
// EMAIL CONFIG (RESEND SMTP)
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
// SEND EMAIL + PDF
// =========================
app.post("/send-report", async (req, res) => {
  try {
    const { title, period, compiled, rows, sendTo } = req.body;

    const htmlContent = reportTemplate({ title, period, compiled, rows });

    // MULTIPLE EMAILS SUPPORT
    const sendToList = sendTo.split(",").map(e => e.trim());

    // =========================
    // GENERATE PDF USING PUPPETEER
    // =========================
    console.log("Generating PDF...");

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    console.log("PDF generated!");

    // =========================
    // SEND EMAIL
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

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email Error:", error);
        return res.status(500).json({ error: "Failed to send email" });
      }
      return res.json({ message: "Email sent successfully!", info });
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Mailer is running...");
});

// START SERVER
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Mailer running on port ${PORT}`));
