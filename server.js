import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import * as reportTemplateModule from "./reportTemplate.js";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";
import { Resend } from "resend";

dotenv.config();

const app = express();

// ===============================
// MIDDLEWARE
// ===============================
app.use(express.json({ limit: "10mb" }));
const allowedOrigins = [
  "https://truebuddytbcpl.github.io",
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Disposition"]
}));

// VERY IMPORTANT — handle preflight
app.options("*", cors());


// ===============================
// TEMPLATE
// ===============================
const reportTemplate =
  typeof reportTemplateModule === "function"
    ? reportTemplateModule
    : reportTemplateModule.default;

// ===============================
// RESEND
// ===============================
if (!process.env.RESEND_API_KEY) {
  console.error("❌ RESEND_API_KEY missing");
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

// ===============================
// PDF GENERATOR (LOCAL + RENDER SAFE)
// ===============================
async function generatePDF(htmlContent) {
  const isProduction = process.env.NODE_ENV === "production";
  let browser;

  if (isProduction) {
    // 👉 Render / Linux
    const executablePath = await chromium.executablePath();

    browser = await puppeteerCore.launch({
      executablePath,
      args: chromium.args,
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    });
  } else {
    // 👉 Local Windows / Mac
    browser = await puppeteer.launch({
      headless: "new",
    });
  }

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,

  footerTemplate: `
  <style>
    .pdf-footer {
      width: 100%;
      height: 95px;
      background: linear-gradient(90deg, #0e7490, #2563eb);
      color: #ffffff;
      font-size: 9px;
      padding: 8px 16px;
      box-sizing: border-box;
      font-family: Arial, Helvetica, sans-serif;
      -webkit-print-color-adjust: exact;
    }

    .pdf-footer .divider {
      height: 1px;
      background: rgba(255,255,255,0.3);
      margin: 6px 0;
    }

    .pdf-footer .meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      white-space: nowrap;
    }

    .pdf-footer .disclaimer {
      opacity: 0.9;
      line-height: 1.4;
      text-align: justify;
    }
  </style>

  <div class="pdf-footer">
    <div class="disclaimer">
      Disclaimer – This document is based on publicly available information and field-level inputs compiled for general awareness and risk-intelligence purposes only.
      It does not constitute legal advice, investigative findings, or a determination of liability.
      Readers are advised to conduct independent verification and seek appropriate professional counsel
      before taking any action based on this information.
    </div>

    <div class="divider"></div>

    <div class="meta">
      <div>
        Prepared by <strong>True Buddy Consulting Pvt Ltd</strong>
      </div>
      <div>
        Contact: contact@tbcpl.co.in
      </div>
    </div>
  </div>
`,




    margin: {
      top: "20px",
      bottom: "120px",
    },
  });

  await browser.close();
  return pdfBuffer;
}

// ===============================
// SEND EMAIL + PDF
// ===============================
app.post("/send-report", async (req, res) => {
  try {
    const {
      title,
      period,
      compiled,
      sendTo,
      india,
      international,
      analysis,
      recommendation
    } = req.body;

    if (!sendTo) {
      return res.status(400).json({ error: "Recipient email required" });
    }

    const rows = [
      ...(india || []).map(r => ({ ...r, section: "India" })),
      ...(international || []).map(r => ({ ...r, section: "International" })),
      ...(analysis || []).map(r => ({ ...r, section: "Analysis" })),
      ...(recommendation || []).map(r => ({ ...r, section: "Recommendation" })),
    ];

    const htmlContent = reportTemplate({
      title,
      period,
      compiled,
      rows,
    });

    const pdfBuffer = await generatePDF(htmlContent);

    const recipients = sendTo.split(",").map(e => e.trim());

    const { error } = await resend.emails.send({
      from: "TBCPL Reports <reports@tbcpl.co.in>",
      to: recipients,
      subject: "Weekly Watchlist Report",
      html: `
        <p>Hello,</p>
        <p>Please find the attached report.</p>
        <p>Regards,<br/>True Buddy Consulting Pvt Ltd</p>
      `,
      attachments: [
        {
          filename: "fraud-report.pdf",
          content: pdfBuffer.toString("base64"),
          type: "application/pdf",
        },
      ],
    });

    if (error) return res.status(500).json({ error });

    res.json({ message: "Email sent successfully with PDF!" });

  } catch (err) {
    console.error("❌ /send-report error:", err);
    res.status(500).json({ error: err.toString() });
  }
});

// ===============================
// GENERATE PDF (DOWNLOAD)
// ===============================
app.post("/generate-pdf", async (req, res) => {
  try {
    const {
      title,
      period,
      compiled,
      india,
      international,
      analysis,
      recommendation
    } = req.body;

    const rows = [
      ...(india || []).map(r => ({ ...r, section: "India" })),
      ...(international || []).map(r => ({ ...r, section: "International" })),
      ...(analysis || []).map(r => ({ ...r, section: "Analysis" })),
      ...(recommendation || []).map(r => ({ ...r, section: "Recommendation" })),
    ];

    const htmlContent = reportTemplate({
      title,
      period,
      compiled,
      rows,
    });

    const pdfBuffer = await generatePDF(htmlContent);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=fraud-report.pdf",
    });

    res.send(pdfBuffer);

  } catch (err) {
    console.error("❌ /generate-pdf error:", err);
    res.status(500).json({ error: err.toString() });
  }
});

// ===============================
// HEALTH CHECK
// ===============================
app.get("/", (req, res) => {
  res.send("Mailer running with server-side PDF generation 🚀");
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server live on port ${PORT}`);
});

