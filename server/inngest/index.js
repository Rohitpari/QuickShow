// inngest/index.js
import { Inngest } from "inngest";
import mongoose from "mongoose";
import connectDB from "../configs/db.js";
import { User } from "../models/User.js";

export const inngest = new Inngest({ id: "movie-ticket-booking" });

// ensure DB connected in every function
const ensureDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }
};

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
      image: image_url, // notice lowercase
    });
  }
);

const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await ensureDB();
    await User.findByIdAndDelete(event.data.id);
  }
);

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

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];
