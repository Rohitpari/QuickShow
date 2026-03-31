// /Function to check availablity of selected Seats For a movie

import { inngest } from "../inngest/index.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import Stripe from "stripe";

const checkSeatAvailability = async (showId, selectedSeats) => {
  try {
    const showData = await Show.findById(showId);
    if (!showData) return false;

    const occupiedSeats = showData.occupiedSeats;

    const isAnySeatTaken = selectedSeats.some((seat) => occupiedSeats[seat]);
    return !isAnySeatTaken;
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

export const createBooking = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { showId, selectedSeats } = req.body;
    const { origin } = req.headers;

    //stripe Gateway Initialize

    //check if Seat is available for the selected show
    const isAvailable = await checkSeatAvailability(showId, selectedSeats);
    if (!isAvailable) {
      return res.json({
        success: false,
        message: "Selected Seats are not available.",
      });
    }
    // Get the show Details
    const showData = await Show.findById(showId).populate("movie");

    //craete a new booking

    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
      isPaid: false,
    });
    selectedSeats.map((seat) => {
      showData.occupiedSeats[seat] = userId;
    });
    showData.markModified("occupiedSeats");
    await showData.save();

    //stripe gateway initialize
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    //Create a line items to for stripe
    const line_items = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Booking for ${showData.movie.title}`,
            images: [showData.movie.poster],
          },
          unit_amount: Math.floor(booking.amount) * 100,
        },
        quantity: 1,
      },
    ];

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/my-booking?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/my-booking`,
      line_items,
      mode: "payment",
      payment_method_types: ["card"],
      metadata: {
        bookingId: booking._id.toString(),
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    booking.paymentLink = session.url;
    await booking.save();

    // Run Inngest Funtion to check payment status after 10 minutes of booking creation
    await inngest.send({
      name: "app/checkpayment",
      data: {
        bookingId: booking._id.toString(),
      },
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const showData = await Show.findById(showId);

    if (!showData) {
      return res.json({ success: true, occupiedSeats: [] });
    }
    const occupiedSeats = Object.keys(showData.occupiedSeats);
    res.json({ success: true, occupiedSeats });
  } catch (error) {
    console.error("GET OCCUPIED SEATS ERROR:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Server Error fetching seats." });
  }
};

// import Stripe from "stripe";
// import Booking from "../models/Booking.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Initialize Stripe

// export const verifyPayment = async (req, res) => {

//   try {
//     const { sessionId } = req.body;
//     const session = await stripe.checkout.sessions.retrieve(sessionId);

//     // Metadata se bookingId nikaalein aur console karein check karne ke liye
//     const bookingId = session.metadata?.bookingId;
//     console.log("Processing Payment for Booking ID:", bookingId);

//     if (session.payment_status === "paid") {
//       const updated = await Booking.findByIdAndUpdate(
//         bookingId,
//         { isPaid: true, paymentLink: "" }, // Link empty kar dein taaki user dubara click na kare
//         { new: true }
//       ).populate("show");

//       if (updated) {
//         return res.json({ success: true, message: "Payment verified", booking: updated });
//       }
//     }

//     res.json({ success: false, message: "Payment not completed" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

export const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    // 1. Stripe se session retrieve karein
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // 2. Metadata se bookingId nikaalein
    const bookingId = session.metadata?.bookingId;

    if (session.payment_status === "paid" && bookingId) {
      // 3. Database update karein
      const updated = await Booking.findByIdAndUpdate(
        bookingId,
        { isPaid: true, paymentLink: "" }, // Link delete karein taaki user firse pay na kar sake
        { new: true },
      );


      //for sending confirmation email after payment successfull

      if (updated) {

        console.log("Booking updated, sending Inngest event...");
        
      await inngest.send({
        "name": "app/show.booked",
        "data": { "bookingId" : "69ca0ffe3b0ad5d949a9bbc6" },
      });
    }

      
        return res.json({
          success: true,
          message: "Payment successful!",
          booking: updated,
        });
      
    }

    res.json({
      success: false,
      message: "Payment failed or booking not found",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
