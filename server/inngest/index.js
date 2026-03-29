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
    await step.sleepUntil("wait-for-10-minutes", tenMinutesLater);

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

// ✅ EXPORT ALL FUNCTIONS
export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  releaseSeatAfterBooking,
];