const nodemailer = require('nodemailer');
const { orderConfirmationEmail } = require('../templates/email');

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'renee.bruen@ethereal.email',
      pass: 'faNFVDFEZJFDyq2RXK'
  }
});


function sendMail(data, subject){
    
    transporter.sendMail({
        to: data.email,

        from: process.env.EMAIL,

        subject: subject,
        html: data.emailTemplate(data)
      });
}

module.exports = sendMail;