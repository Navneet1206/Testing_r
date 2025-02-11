const nodemailer = require('nodemailer');
const twilio = require('twilio');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

module.exports.sendEmailOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Signup',
    text: `Your OTP for signup is: ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports.sendSMSOTP = async (mobileNumber, otp) => {
    // Ensure mobile number starts with +91
    if (!mobileNumber.startsWith('+91')) {
      mobileNumber = `+91${mobileNumber}`;
    }
  
    await twilioClient.messages.create({
      body: `Your OTP for signup is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobileNumber,
    });
  }; 
  
module.exports.sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};