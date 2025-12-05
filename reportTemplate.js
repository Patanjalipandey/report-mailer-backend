const LOGO_HTML = `
<div class="tb-logo-wrapper">
  <div class="tb-frame">
    <span class="tb-main-text">TRUE BUDDY</span>
  </div>

  <div class="tb-subbox">
    <span class="tb-sub-text">Consulting</span>
  </div>
</div>
`;

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

      .tb-logo-wrapper {
        position: relative;
        display: inline-block;
      }

      .tb-frame {
        border: 4px solid #5bb8ff;
        background: #0f6b86;
        padding: 10px 20px;
        border-radius: 4px;
        display: inline-block;
        text-align: center;
      }

      .tb-main-text {
        color: white;
        font-weight: 900;
        font-size: 17px;
        letter-spacing: 4px;
        display: block;
        font-family: Arial, sans-serif;
      }

      .tb-subbox {
        position: absolute;
        left: 50%;
        bottom: -10px;
        transform: translateX(-50%) translateY(4px);
        background: #5bb8ff;
        padding: 4px 16px;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.25);
      }

      .tb-sub-text {
        color: white;
        font-size: 16px;
        font-weight: 600;
        font-family: Arial, sans-serif;
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

      .footer {
        background:linear-gradient(90deg,#0e7490,#2563eb);
        padding:12px 18px;
        color:white;
        font-size:12px;
        display:flex;
        justify-content:space-between;
      }

    </style>
  </head>

  <body>
    <div class="container">

      <div class="header">
        <div class="logo-box">
          ${LOGO_HTML}
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

            ${grouped[section].map(item => `
              <div class="item">
                <div class="item-meta">${item.date}</div>
                <div class="item-title">${item.title}</div>
                <div class="item-summary">${item.summary}</div>
                ${item.source ? `<a href="${item.source}">Source</a>` : ""}
              </div>
            `).join("")}
          </div>
        `).join("")}
      </div>

      <div class="footer">
        <div>Prepared by <b>True Buddy Consulting Pvt Ltd</b></div>
        <div>Period: ${period}</div>
      </div>

    </div>
  </body>
  </html>
  `;
}
