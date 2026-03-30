// // inngest/index.js
// import { Inngest } from "inngest";
// import mongoose from "mongoose";
// import connectDB from "../configs/db.js";
// import { User } from "../models/User.js";
// import Booking from "../models/Booking.js";
// import Show from "../models/Show.js";

// export const inngest = new Inngest({ id: "movie-ticket-booking" });

// // ensure DB connected in every function
// const ensureDB = async () => {
//   if (mongoose.connection.readyState === 0) {
//     await connectDB();
//   }
// };

// const syncUserCreation = inngest.createFunction(
//   { id: "sync-user-from-clerk" },
//   { event: "clerk/user.created" },
//   async ({ event }) => {
//     await ensureDB();
//     const { id, first_name, last_name, email_addresses, image_url } = event.data;
//     await User.create({
//       _id: id,
//       email: email_addresses[0].email_address,
//       name: first_name + " " + last_name,
//       image: image_url, // notice lowercase
//     });
//   }
// );

// const syncUserDeletion = inngest.createFunction(
//   { id: "delete-user-with-clerk" },
//   { event: "clerk/user.deleted" },
//   async ({ event }) => {
//     await ensureDB();
//     await User.findByIdAndDelete(event.data.id);
//   }
// );

// const syncUserUpdation = inngest.createFunction(
//   { id: "update-user-with-clerk" },
//   { event: "clerk/user.updated" },
//   async ({ event }) => {
//     await ensureDB();
//     const { id, first_name, last_name, email_addresses, image_url } = event.data;
//     await User.findByIdAndUpdate(
//       id,
//       {
//         email: email_addresses[0].email_address,
//         name: first_name + " " + last_name,
//         image: image_url,
//       },
//       { new: true }
//     );
//   }
// );


// //Inngestt functionto cencel booking and release the seat of show after 10minutes of booning creation if the
// //  booking is not confirmed by user

// const releaseSeatAfterBooking = inngest.createFunction(
//   {id: 'release-seat-delete-booking'},
//   {event : "app/checkpayment"},

//   async({event,step}) => {
//     const tenMinutesLater = new Date(Date.now() + 10 * 60 *1000)
//     await step.sleepUntil('wait-for-10-minutes',tenMinutesLater)

//     await step.run('check-payment-status',async()=>{
//       const bookingId = event.data.bookingId;
//       const booking = await Booking.findById(bookingId)

//       // if booking is not paid then release the seat
//       if(!booking.isPaid){
//         const show = await Show.findById(booking.show) ;
//         booking.bookindSeats.forEach((seat)=>{
//           delete show.occupiedSeats[seat];
//         });
//         show.markModified('occupiedSeats');
//         await show.save()
//         await Booking.findByIdAndDelete(booking._id);
//       }
//     })
//   }
// )

// export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation,
//   releaseSeatAfterBooking
// ];





// inngest/index.js

import { Inngest } from "inngest";
import mongoose from "mongoose";
import connectDB from "../configs/db.js";
import { User } from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../configs/nodeMailer.js";
import Movie from "../models/Movie.js";

// ✅ IMPORTANT: eventKey add karo
export const inngest = new Inngest({
  id: "movie-ticket-booking",
  eventKey: process.env.INNGEST_KEY,
});

// ensure DB connected in every function
const ensureDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }
};

// ✅ USER CREATE
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await ensureDB();

    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    await User.create({
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + " " + last_name,
      image: image_url,
    });
  }
);

// ✅ USER DELETE
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await ensureDB();
    await User.findByIdAndDelete(event.data.id);
  }
);

// ✅ USER UPDATE
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-with-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    await ensureDB();

    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    await User.findByIdAndUpdate(
      id,
      {
        email: email_addresses[0].email_address,
        name: first_name + " " + last_name,
        image: image_url,
      },
      { new: true }
    );
  }
);

// ✅ AUTO CANCEL BOOKING FUNCTION
const releaseSeatAfterBooking = inngest.createFunction(
  { id: "release-seat-delete-booking" },
  { event: "app/checkpayment" },

  async ({ event, step }) => {
    await ensureDB();

    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);

    // ⏳ wait 10 minutes
    await step.sleep("wait-for-10-minutes", tenMinutesLater);

    await step.run("check-payment-status", async () => {
      const bookingId = event.data.bookingId;

      const booking = await Booking.findById(bookingId);

      // ✅ safety check
      if (!booking) return;

      // ❌ if not paid → release seats
      if (!booking.isPaid) {
        const show = await Show.findById(booking.show);

        if (!show) return;

        // ✅ FIXED: bookedSeats (not bookindSeats ❌)
        booking.bookedSeats.forEach((seat) => {
          delete show.occupiedSeats[seat];
        });

        show.markModified("occupiedSeats");
        await show.save();

        await Booking.findByIdAndDelete(booking._id);

        console.log("❌ Booking expired, seats released");
      }
    });
  }
);

//Inngest Function to send Email when user books a show 

// const sendBookingConfirmationEmail = inngest.createFunction(
//   {id:"send-booking-confirmation-email"},
//   {event : "app/show.booked"},

//   async({event,step})=>{
//     await ensureDB();
//     const {bookingId} = event.data;
//     const booking = await Booking.findById(bookingId).populate({
//       path : "show",
//       populate : {path : "movie",model : "movie"}
//     }).populate("user");


//     await sendEmail({
//       to : booking.user.email,
//       subject : `Payment Confirmation : "${booking.show.movie.title}" booked!`,
//       body : `<div style ="font-family : Arial,sans-serif; line-height: 1.6;">
//       <h2> Hi ${booking.user.name}!</h2>
//       <p> your booking for <strong style = "color : #f84565;">${booking.show.movie.title}</strong> is confirmed. </p>
      
//       <p>
//       <strong> Date : </strong> ${new Date(booking.show.showDateTime).toLocaleDateString('en-US',{timeZone:"Asia/Kolkata"})} <br/>
//       <strong> Time : </strong> ${new Date(booking.show.showDateTime).toLocaleTimeString('en-US',{timeZone:"Asia/Kolkata"})}
//       </p>

//       <p> Enjoy the show!</p>
//       <p> Thanks for booking with us!<br/>-- QuickShow Team </p>
//       </div>
//       `
      
//     })
//   }
// )


const sendBookingConfirmationEmail = inngest.createFunction(
  { id: "send-booking-confirmation-email" },
  { event: "app/show.booked" },

  async ({ event, step }) => {
    await ensureDB();
    const { bookingId } = event.data;

    // 1. Booking aur User data fetch karein
    const booking = await Booking.findById(bookingId).populate({
      path: "show",
      populate: { path: "movie", model: "Movie" }
    }).populate("user");

    if (!booking || !booking.user) {
      console.log("❌ Booking or User not found");
      return;
    }

    // 2. Email Body taiyar karein
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #f84565;">Hi ${booking.user.name}!</h2>
        <p>Your booking for <strong>${booking.show.movie.title}</strong> is confirmed.</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
          <p style="margin: 0;"><strong>Date:</strong> ${new Date(booking.show.showDateTime).toLocaleDateString('en-IN', { timeZone: "Asia/Kolkata" })}</p>
          <p style="margin: 0;"><strong>Time:</strong> ${new Date(booking.show.showDateTime).toLocaleTimeString('en-IN', { timeZone: "Asia/Kolkata" })}</p>
          <p style="margin: 0;"><strong>Seats:</strong> ${booking.bookedSeats.join(", ")}</p>
        </div>
        <p>Enjoy the show!</p>
        <p>Thanks for booking with us!<br/>-- <strong>QuickShow Team</strong></p>
      </div>`;

    // 3. Email Bhejein (Using step.run for reliability)
    await step.run("send-confirmation-email", async () => {
      // ✅ Yahan humne curly braces {} hata diye hain
      return await sendEmail(
        booking.user.email, 
        `Payment Confirmation: "${booking.show.movie.title}" booked!`, 
        emailHtml
      );
    });
  }
);


// ✅ EXPORT ALL FUNCTIONS
export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  releaseSeatAfterBooking,
  sendBookingConfirmationEmail,
];