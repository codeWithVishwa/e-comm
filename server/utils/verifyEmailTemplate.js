const verifyEmailTemplate=({name,url})=>{
    return`
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Verify Your Email</title>
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
    .button {
      display: inline-block;
      padding: 12px 24px;
      margin-top: 20px;
      background-color: #4f46e5;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
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
    <h2>Verify Your Email Address</h2>
    <p>Dear ${name},</p>
    <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>

    <a href="${url}" class="button">Verify Email</a>

    <p>If you did not create an account, no further action is required.</p>
Firework
    <p>Thanks,<br>The  Team</p>

    <div class="footer">
      © 2025 Firework, All rights reserved.
    </div>
  </div>
</body>
</html>
`

}

export default verifyEmailTemplate