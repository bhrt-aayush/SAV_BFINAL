import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Verify environment variables are loaded
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('Email configuration missing. Please check your .env file.');
    console.error('Required variables: EMAIL_USER, EMAIL_PASSWORD');
    console.error('Current values:', {
        EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not set',
        EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'Set' : 'Not set'
    });
}

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Verify transporter configuration
transporter.verify(function(error, success) {
    if (error) {
        console.error('Email service configuration error:', error);
        console.error('Please check your Gmail credentials and make sure 2-Step Verification is enabled');
    } else {
        console.log('Email service is ready to send messages');
    }
});

export const sendOTPEmail = async (email, otp) => {
    // Log the email being sent to (for debugging)
    console.log('Sending OTP to email:', email);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Verification Code',
        text: `Your OTP verification code is: ${otp}. This code will expire in 5 minutes.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #333; text-align: center;">OTP Verification</h2>
                <p style="color: #666; text-align: center;">Your OTP verification code is:</p>
                <h1 style="color: #4CAF50; font-size: 32px; text-align: center; letter-spacing: 5px; margin: 20px 0;">${otp}</h1>
                <p style="color: #666; text-align: center;">This code will expire in 5 minutes.</p>
                <p style="color: #999; text-align: center; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to:', email);
        console.log('Message ID:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email to:', email);
        console.error('Error details:', {
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode
        });
        return false;
    }
};

export default transporter; 