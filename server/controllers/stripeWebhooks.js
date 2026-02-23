// import Stripe from "stripe";
// import Booking from "../models/Booking.js";

// export const stripeWebhook = async (req, res) => {
//   console.log("🔔 stripe webhook received");
//   const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
//   const sig = req.headers["stripe-signature"];

//   let event;

//   try {
//     event = stripeInstance.webhooks.constructEvent(
//       req.body, 
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (error) {
//     console.log("❌ Webhook Signature Error:", error.message);
//     return res.status(400).send(`Webhook Error: ${error.message}`);
//   }

//   try {
//     if (event.type === "checkout.session.completed") {
//       // console.log(hii);

      
//       const session = event.data.object;
//       const { bookingId } = session.metadata;

//       if (session.payment_status === "paid") {
//         await Booking.findByIdAndUpdate(bookingId, {
//           isPaid: true,
//           paymentLink: "",
//         });

//         console.log(`✅ Booking ${bookingId} marked as PAID!`);
//       }
//     }

//     res.json({ received: true });
//   } catch (error) {
//     console.error("❌ Webhook Handler Error:", error.message);
//     res.status(500).send("internal server error");
//   }
// };



// controllers/stripeWebhooks.js (Corrected Code)

import Stripe from "stripe";
import Booking from "../models/Booking.js";

export const stripeWebhook = async (req, res) => {
    console.log("🔔 Stripe Webhook Received");
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers["stripe-signature"];

    let event;

    // --- 1. Signature Verification ---
    try {
        event = stripeInstance.webhooks.constructEvent(
            req.body, 
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.log("❌ Webhook Signature Error:", error.message);
        // Signature verification fail hone par 400 status code wapis jaana chahiye.
        return res.status(400).send(`Webhook Signature Error: ${error.message}`);
    }

    // --- 2. Handle Event Type ---
    try {
        if (event.type === "checkout.session.completed") {
            
            // ❌ Removed the erroneous console.log(hii);
            
            const session = event.data.object;
            const { bookingId } = session.metadata;

            if (session.payment_status === "paid") {
                const updatedBooking = await Booking.findByIdAndUpdate(
                    bookingId, 
                    {
                        isPaid: true,
                        paymentLink: "",
                    },
                    { new: true } // Update hua data wapas pane ke liye
                );

                if (updatedBooking) {
                    console.log(`✅ Booking ${bookingId} successfully marked as PAID via Webhook.`);
                } else {
                    console.log(`⚠️ Booking ${bookingId} not found for update.`);
                }
            } else {
                 console.log(`ℹ️ Session ${session.id} not paid (Status: ${session.payment_status}).`);
            }
        }
        
        // --- 3. Send Success Response ---
        // Stripe ko success response wapas bhejna bahut zaroori hai.
        res.json({ received: true }); 
        
    } catch (error) {
        console.error("❌ Webhook Handler Error:", error.message);
        // Agar database update mein error aaye, toh bhi Stripe ko 200 OK wapis na bhejein.
        res.status(500).send("Internal server error during event processing.");
    }
};














