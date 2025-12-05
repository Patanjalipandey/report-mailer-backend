const LOGO_BASE64 = `
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAoAAAANQCAYAAADYLRHeAAAAOXRFWHRTb2Z0d2FyZQBNYWNyb21lZGlhIEZpcmV3b3JrcyAzLjQuMyAoS2VybmVsIDI2LjI5MikgKFAvUE5HKTPoTbogAAAPWUlEQVR4nO3de5BW1b3/8d9zOy99BhYgWNEkSdpC8RAiQ2nYpQ7Tgl9tUyhDj2qV0FtqH1xq0tL0SYhTaoUpTQqQ2kgiYQSSAxGxIUBkWgJhGoYwilcGxiit1z9+zvnnjtebPWbNmXfeeW/mXuecMzPnzM0/zs6cM7Mz55znWcwDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABfB8jZZq2RF1jkqZ7D3RWe4ZrHQDsMFXq5S8fvfrOpz67fSzb5tFHnhOrvYDEAAAAAAAAAAAAAAAAAAAAAAAAAAIBVqT2p8jdJnrmOnYx9lYxnKZ7cfS9rG6/nOjT4NmJf2vpa98jz9Xhz7yNRfXYPgAAAAAAAAAAAAAAAAAAAAAAAAAAAFqQ7qci9sk5o4OSJZ6djC8orgy3lfq7n8brE+dbI+sd0rcx/7mACAAAAAAAAAAAAAAAAAAAAAAAAAAD4B2qN6o8r0rI8cfZLDolnJ1MHyitDLeW+rujxu0b57YjaJfSzxP+5QAgAAAAAAAAAAAAAAAAAAAAAAAAAAAOA1qh+p8o0y08wdjy5Kljp2MLyiuDLcV+rufi6tnnWUPkm9qH7H/sYAI...
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
        width:110px; height:70px;
        display:flex; align-items:center; justify-content:center;
      }

      .header-title h1 { margin:0; font-size:28px; }
      .meta { font-size:14px; margin-top:5px; }

      .content { padding:30px; }

      .section-box { border:1px solid #e5e7eb; border-radius:8px; margin-bottom:25px; padding:15px; }
      .section-heading {
        background:linear-gradient(90deg,#0e7490,#2563eb);
        color:white; padding:6px 12px; border-radius:4px;
        text-align:center; margin-bottom:15px;
      }

      .footer {
        background:linear-gradient(90deg,#0e7490,#2563eb);
        padding:12px 18px; color:white; font-size:12px;
        display:flex; justify-content:space-between;
      }
    </style>
  </head>

  <body>
    <div class="container">

      <div class="header">
        <div class="logo-box">
          <img src="${LOGO_BASE64}"
               alt="Logo"
               style="width:100%; height:auto; display:block;" />
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
