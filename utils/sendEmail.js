const nodemailer = require('nodemailer');
const { orderConfirmationEmail } = require('../templates/orderEmail');

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'lyla61@ethereal.email',
      pass: 'ZH5cbm7UQStVmdH1sD'
  }
});


function sendMail(orderData, subject){

    transporter.sendMail({
        to: orderData.email,

        from: process.env.EMAIL,

        subject: subject,
        html: orderConfirmationEmail(orderData)
      });
}

module.exports = sendMail;