const nodemailer = require("nodemailer");
const { EMAIL } = require("../config/constants");

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'victoria.blanda68@ethereal.email',
      pass: 'bnZPHY87jFRagnprk6'
  }
});

function sendMail(data, subject) {
  transporter.sendMail({
    to: data.email,

    from: EMAIL,

    subject: subject,
    html: data.emailTemplate(data),
  });
}

module.exports = sendMail;
