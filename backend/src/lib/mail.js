import nodemailer from "nodemailer";
import { ENV } from "./env.js";

// 1. Create Nodemailer SMTP Transporter
export const transporter = nodemailer.createTransport({
  host: ENV.SMTP_HOST,
  port: ENV.SMTP_PORT,
  secure: ENV.SMTP_PORT === 465, // true for 465, false for 587
  auth: {
    user: ENV.SMTP_USER,
    pass: ENV.SMTP_PASS,
  },
});

// 2. Helper to send 6-digit OTP email
export const sendOtpEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: ENV.EMAIL_FROM,
    to: toEmail,
    subject: `${otp} is your ShopNear verification code`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 16px; background-color: #FFFFFF;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #16A34A; margin: 0; font-size: 26px; font-weight: bold; letter-spacing: -0.5px;">ShopNear</h1>
          <p style="color: #64748B; margin: 4px 0 0 0; font-size: 13px;">Discover Shops Around You</p>
        </div>

        <div style="padding: 20px; background-color: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0;">
          <h2 style="color: #0F172A; font-size: 18px; margin-top: 0; margin-bottom: 8px;">Your Verification Code</h2>
          <p style="color: #64748B; font-size: 14px; margin: 0 0 16px 0; line-height: 1.5;">
            Use the 6-digit code below to verify your account. This code is confidential and will expire in 5 minutes.
          </p>

          <div style="background-color: #EBF8F2; border: 1px dashed #16A34A; padding: 14px; text-align: center; border-radius: 10px; margin: 16px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #16A34A; font-family: monospace;">${otp}</span>
          </div>

          <p style="color: #94A3B8; font-size: 12px; margin: 0; text-align: center;">
            ⏰ Valid for 5 minutes • Do not share this code with anyone.
          </p>
        </div>

        <div style="margin-top: 24px; text-align: center; border-top: 1px solid #F1F5F9; padding-top: 16px;">
          <p style="color: #94A3B8; font-size: 11px; margin: 0;">
            If you did not request this email, please ignore it safely.<br/>
            © 2026 ShopNear Team. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

// 3. Helper to send Welcome Email upon Signup
export const sendWelcomeEmail = async (toEmail) => {
  const mailOptions = {
    from: ENV.EMAIL_FROM,
    to: toEmail,
    subject: "Welcome to ShopNear! 🎉",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 16px; background-color: #FFFFFF;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #16A34A; margin: 0; font-size: 26px; font-weight: bold;">ShopNear</h1>
          <p style="color: #64748B; margin: 4px 0 0 0; font-size: 13px;">Discover Shops Around You</p>
        </div>

        <div style="padding: 20px; background-color: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0;">
          <h2 style="color: #0F172A; font-size: 18px; margin-top: 0;">Welcome to the neighborhood! 👋</h2>
          <p style="color: #64748B; font-size: 14px; line-height: 1.6;">
            We're excited to have you on <strong>ShopNear</strong>. Whether you need an urgent printout for an interview, local sweets, or reliable mobile repair, ShopNear helps you discover trusted nearby shops in seconds.
          </p>
        </div>

        <div style="margin-top: 24px; text-align: center; border-top: 1px solid #F1F5F9; padding-top: 16px;">
          <p style="color: #94A3B8; font-size: 11px; margin: 0;">
            © 2026 ShopNear Team. Local Shops, Stronger Communities.
          </p>
        </div>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

// 4. Helper to send Login Alert
export const sendLoginAlertEmail = async (toEmail, details = {}) => {
  const time = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const mailOptions = {
    from: ENV.EMAIL_FROM,
    to: toEmail,
    subject: "Security Alert: New sign-in to your ShopNear account",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 16px; background-color: #FFFFFF;">
        <h2 style="color: #0F172A; font-size: 18px; margin-top: 0;">New Sign-In Detected</h2>
        <p style="color: #64748B; font-size: 14px; line-height: 1.5;">
          Your ShopNear account was just accessed on <strong>${time} (IST)</strong>.
        </p>
        <p style="color: #94A3B8; font-size: 12px; margin-top: 16px;">
          If this was you, you can safely ignore this email. If not, please reset your password immediately.
        </p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};
