import sendEmail from "../utils/emailService.js";

const escapeHtml = (value = "") => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const sendSupportMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: "Please fill in all fields." });
        }

        const supportRecipient = process.env.SUPPORT_EMAIL || process.env.EMAIL_USER;
        if (!supportRecipient) {
            return res.status(500).json({ message: "Support mailbox is not configured." });
        }

        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safeSubject = escapeHtml(subject);
        const safeMessage = escapeHtml(message);

        await sendEmail({
            email: supportRecipient,
            replyTo: email,
            subject: `[SUPPORT REQUEST]: ${subject}`,
            message: `New support message from ${name} (${email}):\n\n${message}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #3b82f6;">New Support Request</h2>
                    <p><strong>From:</strong> ${safeName} (${safeEmail})</p>
                    <p><strong>Subject:</strong> ${safeSubject}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="white-space: pre-wrap;">${safeMessage}</p>
                </div>
            `
        });

        res.status(200).json({ message: "Your message has been sent successfully. We'll get back to you soon!" });
    } catch (error) {
        console.error("Support Message Error:", error);
        res.status(500).json({ message: "Failed to send message. Please try again later." });
    }
};
