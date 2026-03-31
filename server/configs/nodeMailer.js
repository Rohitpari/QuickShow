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




import nodemailer from "nodemailer";

const sendEmail = async (to, subject, body) => {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 465, 
    secure: true, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 30000, // 30 seconds wait
  });

  const mailOptions = {
    from: `"QuickShow" <${process.env.SENDER_EMAIL}>`,
    to,
    subject,
    html: body,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent: " + info.response);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("❌ Nodemailer Error:", error);
    throw error; 
  }
};

export default sendEmail;