const nodemailer = require("nodemailer");
const { orderConfirmationEmail } = require("../templates/email");

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'greta.fahey@ethereal.email',
      pass: 'aQ5CgbXQs87epTmJeK'
  }
});

// let transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.NODEMAILER_USER,
//     pass: process.env.NODEMAILER_PASSWORD,
//   },
// });

function sendMail(data, subject) {
  transporter.sendMail({
    to: data.email,

    from: process.env.EMAIL,

    subject: subject,
    html: data.emailTemplate(data),
  });
}

module.exports = sendMail;
