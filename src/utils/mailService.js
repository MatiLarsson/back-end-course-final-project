import nodemailer from 'nodemailer'
import config from '../config/config.js';

export default async function sendMail(from = "", to = config.gmailService.MAIL_TO, subject = "", html = "", attachments = []) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
      user: config.gmailService.GMAIL_AUTH_USER,
      pass: config.gmailService.GMAIL_AUTH_PASS
    }
  });
  try {
    await transporter.sendMail({
      from: from,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments
    })
  } catch (error) {
    console.log(error)
  }
}