import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
// import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 465, // Port 465 best hai Render ke liye
  secure: true, // Port 465 ke saath true rahega
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000, // 10 seconds wait karega
  greetingTimeout: 5000,
});

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const response = await transporter.sendMail({
      from: `QuickShow <${process.env.SENDER_EMAIL}>`, // Sender email format sahi karein
      to,
      subject,
      html: htmlContent,
    });
    return response;
  } catch (error) {
    console.error("Nodemailer Error:", error);
    throw error; // Inngest ko error dikhne dein
  }
};

export default sendEmail;