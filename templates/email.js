const { PORT } = require("../config/constants");

exports.orderConfirmationEmail = (data) => {
  const email = `<html>
        <h3> Thankyou <b>${data.name}</b> for ordering.</h3>
        </br>
        
        <h3> Your order has been successfully placed.</h3>
        <h2> Total Cost -: $${data.totalCost}</h2>
        
        
    </html>`;

  return email;
};

exports.orderDeliveredEmail = (data) => {
  const email = `<html>
  <h3> Dear <b>${data.name}</b>, Your order with orderId ${data.orderId} has been successfully delivered</h3>
  </br>
  
</html>`;

  return email;
};

exports.resetPasswordEmail = (data) => {
  const email = `
      <html>
        <h1>Dear ${data.name},A request to reset password has been made.</h1>
        <h2>If the request was not made by you, please ignore this email</h2>
        <h2>To reset your password, please <a href="http://localhost:${PORT}/admin/password/${data.resetToken}">Click Here </a>
      </html>
   `;
  return email;
};
