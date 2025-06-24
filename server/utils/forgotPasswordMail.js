const forgotPasswordOtpTemplate = ({ name, otp }) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Reset Your Password</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f7;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      }
      .otp-box {
        font-size: 24px;
        font-weight: bold;
        color: #4f46e5;
        background-color: #f0f0ff;
        padding: 10px 20px;
        display: inline-block;
        border-radius: 6px;
        margin: 20px 0;
        letter-spacing: 4px;
      }
      .footer {
        text-align: center;
        color: #888;
        font-size: 13px;
        margin-top: 30px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Password Reset Request</h2>
      <p>Dear ${name},</p>
      <p>We received a request to reset your password. Use the OTP below to proceed:</p>

      <div class="otp-box">${otp}</div>

      <p>This OTP is valid for the next 10 minutes. Please do not share it with anyone.</p>
      <p>If you did not request a password reset, please ignore this email.</p>

      <p>Thanks,<br>The Firework Team</p>

      <div class="footer">
        © 2025 Firework, All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
};

export default forgotPasswordOtpTemplate;
