import nodemailer from "nodemailer";

/**
 * Send email with HTML and text support
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content (optional)
 * @param {string} options.text - Plain text content (optional)
 * @param {string} options.message - Legacy text message (fallback)
 * @returns {Promise<void>}
 */
export const sendEmail = async ({ email, subject, html, text, message }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Use provided text or fallback to message
    const textContent = text || message || "";

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: email,
      subject,
      text: textContent,
      ...(html && { html }), // Only include html if provided
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${email}`, result.messageId);
    return result;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};

/**
 * Send HTML email with fallback to text
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text fallback
 * @returns {Promise<void>}
 */
export const sendHtmlEmail = async ({ email, subject, html, text }) => {
  return await sendEmail({ email, subject, html, text });
};
