import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import { User } from "../models/User.js";

//api to check if user is admin
export const isAdmin = async (req, res) => {
  res.json({ success: true, isAdmin: true });
};
//api to get dashboarddata

export const getDashboardData = async (req, res) => {
  try {
    const booking = await Booking.find({ isPaid: true });
    const activeShows = await Show.find({
      showDateTime: { $gte: new Date() },
    }).populate("movie");
    const totalUser = await User.countDocuments();
    const dashboardData = {
      totalBooking: booking.length,
      totalRevenue: booking.reduce((acc, booking) => acc + booking.amount, 0),
      activeShows,
      totalUser,
    };
    res.json({ success: true, dashboardData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//API  to get all shows
export const getAllShows = async (req, res) => {
  try {
    // FIX 1: sort() को find() के साथ chain करें
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate({
        path: "movie",
      })
      .sort({ showDateTime: 1 }); // <-- Mongoose query chain में शामिल किया गया

    res.json({ success: true, shows });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//API TO get all booking

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("user")
      .populate({
        path: "show",
        populate: { path: "movie" },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
