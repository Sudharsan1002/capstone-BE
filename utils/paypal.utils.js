const paypal = require("@paypal/checkout-server-sdk")
const dotenv = require("dotenv");
dotenv.config();
PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
PAYPAL_SECRET = process.env.PAYPAL_SECRET


const environment = new paypal.core.SandboxEnvironment(
    PAYPAL_CLIENT_ID,
    PAYPAL_SECRET
)

const paypalClient = new paypal.core.PayPalHttpClient(environment)


// CREATE AN ORDER

async function createOrder(orderDetails) {
    const request = new paypal.orders.OrdersCreateRequest()
    request.prefer("return=representation")
    request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
            {
                amount: {
                    currency_code: orderDetails.currency || "USD",
                    value:orderDetails.amount
                }
            }
        ]
    })


    try {
        const order = await paypalClient.execute(request)
        return order.result
    } catch (error) {
         console.error("Error creating PayPal order:", error);
         throw new Error("Failed to create PayPal order.");
    }

}



//CAPTURING PAYPAL ORDER

async function captureOrder(orderId) {
    const request = new paypal.orders.OrdersCaptureRequest(orderId)
    request.requestBody({})

    try {
        const capture = await paypalClient.execute(request)
        return capture.result
    } catch (error) {
        console.error("Error capturing PayPal order:", error);
        throw new Error("Failed to capture PayPal order.");
    }
    
}


module.exports = {
    createOrder,
    captureOrder
}