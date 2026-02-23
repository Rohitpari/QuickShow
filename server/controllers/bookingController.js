// /Function to check availablity of selected Seats For a movie

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
      isPaid : false,
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
      success_url: `${origin}/loading/my-booking?session_id={CHECKOUT_SESSION_ID}`,
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

export const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: "Session ID missing" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || !session.metadata?.bookingId) {
      return res.status(404).json({ success: false, message: "Invalid session" });
    }

    const bookingId = session.metadata.bookingId;
    console.log("Booking ID:", bookingId);

    if (session.payment_status === "paid" || session.status === "completed") {
      // ✅ Updated booking return karo
      const updated = await Booking.findByIdAndUpdate(
        bookingId,
        { isPaid : true, paymentLink: "" },
        { new: true } // ✅ Yeh line uncomment karo
      ).populate("show");

      console.log("✅ Booking updated:", updated?._id);
      return res.json({ 
        success: true, 
        message: "Payment verified", 
        booking: updated // ✅ Updated booking data bhejo

      });
    }

    res.json({ success: false, message: "Payment not completed" });
  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};








