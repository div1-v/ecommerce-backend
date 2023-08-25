const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'estrella.jast74@ethereal.email',
        pass: 'Eq6eRgAvAVTKUgeSYQ'
    }
});


function sendMail(orderData){

    transporter.sendMail({
        to: orderData.email,

        from: process.env.EMAIL,

        subject: "Order Details",
        html: `
          <p>Thankyou for ordering ${orderData.name}</p></br>
          <p>Order Details -:</p>

          <p></p>
          
        `
      });
}

module.exports = sendMail;