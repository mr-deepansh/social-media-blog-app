// src/modules/email/services/email.service.js
import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import { emailConfig } from "../../../config/index.js";
import { ApiError } from "../../../shared/utils/ApiError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
    this.templatesPath = path.join(__dirname, "../templates");
  }

  createTransporter() {
    return nodemailer.createTransport({
      service: emailConfig.service,
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: emailConfig.auth,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendEmail({ to, subject, template, context, html, text }) {
    try {
      let emailHtml = html;
      let emailText = text;
      // If template is provided, render it
      if (template) {
        const templatePath = path.join(this.templatesPath, `${template}.ejs`);
        emailHtml = await ejs.renderFile(templatePath, context);
        emailText = this.htmlToText(emailHtml);
      }
      const mailOptions = {
        from: {
          name: emailConfig.from.name,
          address: emailConfig.from.email,
        },
        to,
        subject,
        html: emailHtml,
        text: emailText,
      };
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${to}: ${subject}`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      throw new ApiError(500, `Failed to send email: ${error.message}`);
    }
  }

  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log("✅ Email service connection verified");
      return true;
    } catch (error) {
      console.error("❌ Email service connection failed:", error);
      return false;
    }
  }
}

export const emailService = new EmailService();
