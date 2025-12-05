

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
}

.tb-frame {
  border: 3px solid #5bb8ff;
  background: #0f6b86;
  padding: 6px 16px;
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



