const { createOrder, captureOrder } = require("../utils/paypal.utils");

const express = require("express")
const paymentRouter = express.Router()



//CREATE NEW PAYPAL ORDER

paymentRouter.post("/createPayment", async (req, res) => {
    try {
        const { amount, currency } = req.body
        
        if (!amount) {
            return res.status(400).json({message:"Payment amount is required"})
        }

        const order = await createOrder({ amount, currency })
        res.status(200).json({
            message: "Paypal order created",
            orderId: order.id,
            approveLink: order.links.find((link) => link.rel === "approve")
        })
    } catch (error) {
          console.error("Error creating payment:", error);
          res.status(500).json({ message: "Failed to create payment." });
    }
})


//CAPTURE PAYMENT FOR AN ORDER

paymentRouter.post("/capturePayment", async (req, res) => {
    try {
        const { orderId } = req.body
        
        if (!orderId) {
            return res.status(400).json({ message: "OrderId is required" })
        }

        const capture = await captureOrder(orderId)
        return res.status(200).json({
            message: "Payment captured successfully",
            details:capture
        })

    } catch (error) {
           console.error("Error capturing payment:", error);
           res.status(500).json({ message: "Failed to capture payment." });
    }
})



module.exports = paymentRouter
