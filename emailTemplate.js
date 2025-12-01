export default ({ name, phone, address, idNumber }) => `
  <div style="font-family: Arial; padding: 20px; background: #f5f5f5;">
    <h2 style="color:#333;">Fraud Watchlist Report</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Address:</strong> ${address}</p>
    <p><strong>ID Number:</strong> ${idNumber}</p>
  </div>
`;
