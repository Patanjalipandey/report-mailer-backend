import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import * as reportTemplateModule from "./reportTemplate.js";
import emailTemplate from "./emailTemplate.js";
import pdf from "html-pdf-node";

import cors from "cors";



dotenv.config();
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());


// =========================
//   FIX IMPORT FOR TEMPLATE
// =========================
const reportTemplate =
  typeof reportTemplateModule === "function"
    ? reportTemplateModule
    : typeof reportTemplateModule.default === "function"
      ? reportTemplateModule.default
      : null;

console.log("reportTemplate loaded =>", reportTemplate);

// If still null, stop early
if (!reportTemplate) {
  console.error("❌ reportTemplate is not a function. Check reportTemplate.js!");
  process.exit(1);
}

// =========================
//  EMAIL + PDF CONFIG
// =========================
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true, // SSL for Gmail port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// =========================
//  SEND EMAIL + ATTACH PDF
// =========================
app.post("/send-report", async (req, res) => {
  try {
    const { title, period, compiled, rows, sendTo } = req.body;


    // Generate HTML content
    const htmlContent = reportTemplate({ title, period, compiled, rows });

    const sendToList = sendTo.split(",").map(e => e.trim());




    // Create PDF buffer
    const file = { content: htmlContent };
    const pdfBuffer = await pdf.generatePdf({ content: htmlContent }, { format: "A4" });


    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: sendToList, // send to yourself for testing
      subject: "Weekly Watchlist Report",
      html: htmlContent,
      attachments: [
        {
          filename: "logo.png",
          path: "./logo.png",
          cid: "truebuddylogo" // Unique ID
        },
        {
          filename: "fraud-report.pdf",
          content: pdfBuffer
        }
      ]

    };

    // Send email
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

// Test route
app.get("/", (req, res) => {
  res.send("Mailer is running...");
});

// Start server
app.listen(5001, () => console.log("Mailer running on port 5001"));
