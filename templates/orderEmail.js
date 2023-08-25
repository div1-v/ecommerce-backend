exports.orderConfirmationEmail = (data) => {
  const email = `<html>
        <h1> ThankYou <b>${data.name}</b> for ordering.<h1>
        </br>
        
        <h3> Your order has been successfully placed.<h3>
        <h1> Total Cost -: $${data.totalCost}</h1>
        
        <h2>You shall receive an email once the order is successfully dispatched </h2>
    </html>`;

  return email;
};

exports.orderDeliveredEmail = (data) => {
  const email = `<html>
  <h1> Dear <b>${data.name}</b> Your order has been successfully delivered<h1>
  </br>
  
</html>`;
};
