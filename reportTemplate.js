

export default function reportTemplate({ title, period, compiled, rows }) {
  const grouped = {};
  rows.forEach(r => {
    if (!grouped[r.section]) grouped[r.section] = [];
    grouped[r.section].push(r);
  });

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>

    <style>
      body { font-family: Arial; background:#f4f7fa; margin:0; padding:0; }
      .container { max-width:900px; margin:auto; background:#fff; border-radius:10px; }

      .header {
        background:linear-gradient(90deg,#0e7490,#2563eb);
        color:white; padding:25px 30px;
        display:flex; align-items:center; gap:20px;
      }

      .logo-box {
        width:auto;
        height:auto;
        display:flex;
        align-items:center;
        justify-content:center;
      }

      /* ---------------------------
         TRUE BUDDY LOGO (PURE CSS)
      ----------------------------*/

/* EMAIL-SAFE + PDF-SAFE LOGO */
.tb-wrapper {
  display: inline-block;
  font-family: Arial, sans-serif;
  margin-top:  20px;
  margin-right:  10px;
}

.tb-frame {
  border: 6px solid #5bb8ff;
  background: #0f6b86;
  padding: 6px 12px;
  border-radius: 4px;
}

.tb-main {
  color: #ffffff;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 3px;
}

.tb-subbox {
  background: #5bb8ff;
  padding: 3px 12px;
  border-radius: 4px;
  margin-top: -6px;   /* THIS WORKS IN GMAIL because inside <td> */
  display: inline-block;
}

.tb-sub {
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
}


      /* -------------------------------- */

      .header-title h1 { margin:0; font-size:28px; }
      .meta { font-size:14px; margin-top:5px; }

      .content { padding:30px; }

      .section-box { 
        border:1px solid #e5e7eb; 
        border-radius:8px; 
        margin-bottom:25px; 
        padding:15px; 
      }

      .section-heading {
        background:linear-gradient(90deg,#0e7490,#2563eb);
        color:white;
        padding:6px 12px;
        border-radius:4px;
        text-align:center;
        margin-bottom:15px;
      }

      .report-footer {
    background: linear-gradient(to right, #0e7490, #2563eb); /* cyan-700 → blue-500 */
    color: #ffffff;
    padding: 12px 16px;
    font-size: 12px;
    font-family: Arial, Helvetica, sans-serif;
}

/* Disclaimer */
.footer-disclaimer {
    margin-bottom: 8px;
    text-align: justify;
    text-justify: inter-word;
    line-height: 1.4;
    opacity: 0.9;
}

/* Footer meta row */
.footer-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255, 255, 255, 0.3);
    padding-top: 8px;
}

/* Left and right sections */
.footer-left,
.footer-right {
    white-space: nowrap;
}

/* Strong text */
.footer-left strong {
    font-weight: 700;
}
.item {
  margin-bottom: 15px;
}

.item-meta {
  font-size: 12px;
  color: #6b7280;
}

.item-title {
  font-weight: 700;
  margin: 4px 0;
}

.item-summary {
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-line;
}

.analysis-list {
  margin: 8px 0 0 18px;
  font-size: 13px;
  line-height: 1.5;
}

.analysis-list li {
  margin-bottom: 6px;
}

.source-link {
  display: inline-block;
  margin-top: 6px;
  font-size: 12px;
  color: #2563eb;
  text-decoration: none;
}


    </style>
  </head>

  <body>
    <div class="container">

      <div class="header">
<div class="tb-wrapper">
  <table cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center">
        <div class="tb-frame">
          <span class="tb-main">TRUE BUDDY</span>
        </div>
      </td>
    </tr>

    <tr>
      <td align="center">
        <div class="tb-subbox">
          <span class="tb-sub">Consulting</span>
        </div>
      </td>
    </tr>
  </table>
</div>



        <div class="header-title">
          <h1>${title}</h1>
          <div class="meta">
            <strong>Period:</strong> ${period}<br/>
            <strong>Compiled By:</strong> ${compiled}
          </div>
        </div>
      </div>

      <div class="content">
        ${Object.keys(grouped).map(section => `
          <div class="section-box">
            <div class="section-heading">${section}</div>

           ${grouped[section].map(item => {
  let summaryHTML = "";

  if (item.section === "Analysis" || item.section === "Recommendation") {
    const points = item.summary
      .split("\n")
      .filter(Boolean)
      .map(point =>
        `<li>${point.replace(/^\d+\.\s*/, "")}</li>`
      )
      .join("");

    summaryHTML = `<ol class="analysis-list">${points}</ol>`;
  } else {
    summaryHTML = `<p class="item-summary">${item.summary}</p>`;
  }

  return `
    <div class="item">
      <div class="item-meta">${item.date}</div>
      <div class="item-title">${item.title}</div>
      ${summaryHTML}
      ${item.source ? `<a class="source-link" href="${item.source}" target="_blank">Source</a>` : ""}
    </div>
  `;
}).join("")}

          </div>
        `).join("")}
      </div>

<footer class="report-footer">
    <!-- Disclaimer -->
    <div class="footer-disclaimer">
        Disclaimer – This document is based on publicly available information and field-level inputs compiled for general awareness and risk-intelligence purposes only.
        It does not constitute legal advice, investigative findings, or a determination of liability.
        Readers are advised to conduct independent verification and seek appropriate professional counsel
        before taking any action based on this information.
    </div>

    <!-- Footer Meta -->
    <div class="footer-meta">
        <div class="footer-left">
            Prepared by <strong>True Buddy Consulting Pvt Ltd</strong> · Period: <span id="report-period">Jan–Dec 2025</span>
        </div>
        <div class="footer-right">
            Contact: contact@tbcpl.co.in
        </div>
    </div>
</footer>


    </div>
  </body>
  </html>
  `;
}











