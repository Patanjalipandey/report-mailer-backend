export default function reportTemplate({ title, period, compiled, rows, logo }) {

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
      body {
        font-family: Arial, sans-serif;
        background: #f4f7fa;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 900px;
        margin: auto;
        background: #ffffff;
        box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        border-radius: 10px;
        overflow: hidden;
      }
      .header {
        background: linear-gradient(90deg, #0e7490, #2563eb);
        color: white;
        padding: 25px 30px;
        display: flex;
        align-items: center;
        gap: 20px;
      }
      .logo-box {
        background: rgba(255,255,255,0.15);
        padding: 10px;
        border-radius: 8px;
        width: 110px;
        height: 70px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .logo-box img {
        max-width: 100%;
        max-height: 100%;
      }
      .header-title h1 {
        font-size: 28px;
        margin: 0;
        text-transform: uppercase;
      }
      .meta {
        margin-top: 5px;
        font-size: 14px;
        opacity: 0.85;
      }
      .content {
        padding: 30px;
      }
      .section-box {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 25px;
      }
      .section-heading {
        background: linear-gradient(90deg, #0e7490, #2563eb);
        color: white;
        padding: 6px 12px;
        border-radius: 4px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 15px;
        font-size: 13px;
      }
      .footer {
        background: linear-gradient(90deg, #0e7490, #2563eb);
        color: white;
        padding: 12px 18px;
        font-size: 12px;
        display: flex;
        justify-content: space-between;
      }
    </style>
  </head>

  <body>
    <div class="container">

      <div class="header">
        <div class="logo-box">
          <img src="data:image/png;base64,${logo}" alt="True Buddy Logo" />
        </div>

       <div class="header-title">
          <h1>${title}</h1>
          <div class="meta">
            <strong>Period:</strong> ${period}
            <br/>
            <strong>Compiled By:</strong> ${compiled}
          </div>
        </div>
      </div>

      <!-- CONTENT -->
      <div class="content">
        ${Object.keys(grouped)
      .map(
        (section) => `
          <div class="section-box">
            <div class="section-heading">${section}</div>

            ${grouped[section]
            .map(
              (item) => `
              <div class="item">
                <div class="item-meta">${item.date}</div>
                <div class="item-title">${item.title}</div>
                <div class="item-meta">${item.meta}</div>
                <div class="item-summary">${item.summary}</div>

                ${item.source
                  ? `<div class="item-source">
                        <a href="${item.source}" target="_blank">Source</a>
                      </div>`
                  : ""
                }
              </div>`
            )
            .join("")}
          </div>
        `
      )
      .join("")}
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <div>Prepared by <strong>True Buddy Consulting Pvt Ltd</strong></div>
        <div>Period: ${period}</div>
      </div>

    </div>
  </body>
  </html>`;
}

