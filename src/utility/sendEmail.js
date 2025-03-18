import nodemailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
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

		const mailOptions = {
			from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
			to: email,
			subject: subject,
			text: message,
		};
		await transporter.sendMail(mailOptions);
		console.log(`✅ Email sent to ${email}`);
	} catch (error) {
		console.error("❌ Error sending email:", error);
		throw new Error("Email could not be sent");
	}
};
