import nodemailer from "nodemailer";
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_EMAIL } from "../config/config.js";

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
});

export const sendBookingEmail = async (bookingDetails) => {
    const { customerName, customerPhone, eventType, eventDate, eventRegion, eventLocation, services, duration } = bookingDetails;
    const emailBody = `
        <h1>New Booking Received</h1>
        <p><strong>Name:</strong> ${customerName}</p>
        <p><strong>Phone:</strong> ${customerPhone}</p>
        <p><strong>Event Type:</strong> ${eventType}</p>
        <p><strong>Event Date:</strong> ${eventDate}</p>
        <p><strong>Event Region:</strong> ${eventRegion}</p>
        <p><strong>Event Location:</strong> ${eventLocation}</p>
        <p><strong>Requested Services:</strong> ${services}</p>
        <p><strong>Duration:</strong> ${duration}</p>
    `;

    await transporter.sendMail({
        from: SMTP_USER,
        to: ADMIN_EMAIL,
        subject: "New Booking",
        html: emailBody,
    });
};
