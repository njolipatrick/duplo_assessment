import { createTransport } from 'nodemailer';
import { config } from 'dotenv';
config();

const nodemailer = (subject: string, html: string, emailArray: string[]) => {
  const auth = { user: process.env.GMAIL, pass: process.env.GMAIL_PASSWORD };

  const transporter = createTransport({
    service: 'Gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth,
  });
  emailArray.map(async (email) => {
    const mailOptions = {
      from: auth.user,
      to: email,
      subject,
      html,
    };
    await transporter.sendMail(mailOptions);
  });
};
export const mailer = (subject: string, html: string, emailArray: string[]) => {
  switch (process.env.NODE_ENV) {
    case 'production':
    // Send Production mail function here
    case 'staging':
      return nodemailer(subject, html, emailArray);
    default:
      return nodemailer(subject, html, emailArray);
  }
};
