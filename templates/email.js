const { PORT } = require("../config/constants");

exports.orderConfirmationEmail = (data) => {
  const email = `<html>
        <h1> ThankYou <b>${data.name}</b> for ordering.</h1>
        </br>
        
        <h3> Your order has been successfully placed.</h3>
        <h1> Total Cost -: $${data.totalCost}</h1>
        
        <h2>You shall receive an email once the order is successfully dispatched </h2>
    </html>`;

  return email;
};

exports.orderDeliveredEmail = (data) => {
  const email = `<html>
  <h1> Dear <b>${data.name}</b> Your order with orderId ${data.orderId} has been successfully delivered</h1>
  </br>
  
</html>`;

    return email;
};

exports.resetPasswordEmail = (data)=>{
   const email =`
      <html>
        <h1>Dear ${data.name},A request to reset password has been made.</h1>
        <h2>If the request was not made by you, please ignore this email</h2>
        <h2>To reset your password, please <a href="http://localhost:${PORT}/password/${data.resetToken}">Click Here </a>
      </html>
   `
   return email;
}
