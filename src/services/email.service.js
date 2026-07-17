import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendVendorWelcomeEmail = async (email, password) => {
    try {
        const mailOptions = {
            from: `"OriBrix Support" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Welcome to OriBrix Vendor Portal - Your Login Credentials",
            html: `
                <h3>Welcome to OriBrix!</h3>
                <p>Your Vendor account has been successfully created.</p>
                <p>Please complete your KYC verification first,also use the following credentials to login as well:</p>
                <p><b>Email:</b> ${email}</p>
                <p><b>Password:</b> ${password}</p>
                <p><i>We recommend changing your password after your first login.</i></p>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Welcome email sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending welcome email:", error);
    }
};

export const sendSubAdminWelcomeEmail = async (email, { fullName, password, mobile, permissions = [] }) => {
    try {
        const permissionsList = permissions.length
            ? `<ul>${permissions.map((p) => `<li>${p}</li>`).join("")}</ul>`
            : "<p>No permissions assigned yet.</p>";

        const mailOptions = {
            from: `"OriBrix Support" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Your OriBrix Sub Admin Account - Login Credentials",
            html: `
                <h3>Welcome to OriBrix, ${fullName || "Sub Admin"}!</h3>
                <p>A Sub Admin account has been created for you. Use the credentials below to log in:</p>
                <p><b>Full Name:</b> ${fullName || "-"}</p>
                <p><b>Email:</b> ${email}</p>
                ${mobile ? `<p><b>Mobile:</b> ${mobile}</p>` : ""}
                <p><b>Password:</b> ${password}</p>
                <p><b>Permissions:</b></p>
                ${permissionsList}
                <p><i>We recommend changing your password after your first login.</i></p>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Sub admin welcome email sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending sub admin welcome email:", error);
    }
};

export const sendVendorOTPEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: `"OriBrix Security" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Your OriBrix Login OTP",
            html: `
                <h3>Login Verification</h3>
                <p>You requested to login to your OriBrix Vendor account.</p>
                <p>Your One-Time Password (OTP) is: <h2>${otp}</h2></p>
                <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("OTP email sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending OTP email:", error);
    }
};

export const sendGenericOTPEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: `"OriBrix Security" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Your OriBrix Login OTP",
            html: `
                <h3>Login Verification</h3>
                <p>Your One-Time Password (OTP) is: <h2>${otp}</h2></p>
                <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Admin OTP email sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending generic OTP email:", error);
    }
};
