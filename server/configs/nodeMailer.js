// import nodemailer from "nodemailer";
// // import env from "dotenv";

// // env.config();
// // import nodemailer from "nodemailer";


// const transporter = nodemailer.createTransport({
//   host: "smtp-relay.brevo.com",
//   port: 587, // Port 587 best hai Render ke liye
//   secure: false, // Port 587 ke saath false rahega
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
//   connectionTimeout: 30000, // 30 seconds wait karega
//   // greetingTimeout: 5000,
// });

// const sendEmail = async (to, subject, htmlContent) => {
//   try {
//     const response = await transporter.sendMail({
//       from: `QuickShow <${process.env.SENDER_EMAIL}>`, // Sender email format sahi karein
//       to,
//       subject,
//       html: htmlContent,
//     });
//     return response;
//   } catch (error) {
//     console.error("Nodemailer Error:", error);
//     throw error; // Inngest ko error dikhne dein
//   }
// };

// export default sendEmail;




// import nodemailer from "nodemailer";

import fetch from "node-fetch";

const sendEmail = async (to, subject, body) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: "QuickShow", email: process.env.SENDER_EMAIL },
      to: [{ email: to }],
      subject: subject,
      htmlContent: body,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(JSON.stringify(err));
  }

  console.log("✅ Email sent via Brevo API");
  return { success: true };
};

export default sendEmail;