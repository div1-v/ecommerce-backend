const nodemailer = require('nodemailer');
const { orderConfirmationEmail } = require('../templates/email');

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'ramiro41@ethereal.email',
      pass: 'GacsS56dduCqdrV7rx'
  }
});


function sendMail(data, subject){
    console.log(data.emailTemplate(data));
    transporter.sendMail({
        to: data.email,

        from: process.env.EMAIL,

        subject: subject,
        html: data.emailTemplate(data)
      });
}

module.exports = sendMail;