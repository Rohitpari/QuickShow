import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 465,
  secure: true, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    timeout: 10000, //  
  },
});


// configs/nodeMailer.js
const sendEmail = async (to, subject, htmlContent) => {
    const response = await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to,
        subject,
        html: htmlContent, // ✅ Nodemailer ko yahan 'html' key hi chahiye
    });
    return response;  
};

export default sendEmail;