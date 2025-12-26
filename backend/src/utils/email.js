const nodemailer = require("nodemailer");

const sendOrderConfirmation = async (userEmail, order, orderItems) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8080";

    const itemsList = orderItems
      .map(
        (item) =>
          `<li>
            <a href="${FRONTEND_URL}/product/${item.product}" style="color: #4CAF50; text-decoration: none; font-weight: bold;">
              ${item.name}
            </a> x ${item.quantity} (NRs ${item.price})
          </li>`
      )
      .join("");

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "Order Confirmation - SecondHand-Store",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Thank you for your purchase!</h2>
          <p>Hi there,</p>
          <p>Your order has been successfully placed. Here are the details:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Order Summary</h3>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Total Amount:</strong> NRs ${order.total}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
          </div>

          <h3>Items Ordered:</h3>
          <ul>
            ${itemsList}
          </ul>

          <p>Users will be notified to ship your items soon.</p>
          
          <p style="margin-top: 30px; font-size: 12px; color: #888;">
            This is an automated message from SecondHand-Store.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error("Email send failed:", error);
    return false;
  }
};

const sendSellerNotification = async (sellerEmail, products) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8080";

    const productList = products
      .map(
        (product) =>
          `<li>
            <a href="${FRONTEND_URL}/product/${product.id}" style="color: #4CAF50; text-decoration: none; font-weight: bold;">
              ${product.name}
            </a>
          </li>`
      )
      .join("");

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: sellerEmail,
      subject: "You made a sale! - SecondHand-Store",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Good news!</h2>
          <p>Hi,</p>
          <p>One or more of your items have just been purchased:</p>
          
          <div style="background-color: #f0f7ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Sold Items:</h3>
            <ul>
              ${productList}
            </ul>
          </div>

          <p>Please check your orders dashboard to arrange shipping.</p>
          
          <p style="margin-top: 30px; font-size: 12px; color: #888;">
            This is an automated message from SecondHand-Store.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Seller notification sent to ${sellerEmail}`);
    return true;
  } catch (error) {
    console.error("Seller email send failed:", error);
    return false;
  }
};

module.exports = { sendOrderConfirmation, sendSellerNotification };
