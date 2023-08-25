exports.orderConfirmationEmail = (data) => {
  const email = `
        <h1> ThankYou <b>${data.name}</b> for ordering.<h1>
        </br>
        
        <h3> Your order has been successfully placed.<h3>
        <h2>Your order will be delivered withing 5 minutes. You shall receive an email
         once the order is successfully dispatched </h2>
    `;
};

exports.orderDeliveredEmail = (data) => {
  const email = `
       
    
    `;
};
