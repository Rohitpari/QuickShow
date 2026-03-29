//     import express from 'express';
//     import cors from 'cors';
//     import 'dotenv/config';
//     import { clerkClient, clerkMiddleware } from '@clerk/express';
//     import connectDB from './configs/db.js';
    
//     import { serve } from "inngest/express";
//     import { inngest, functions } from './inngest/index.js';
//     import showRouter from './routes/showRoutes.js';
//     import bookingRouter from './routes/bookingroutes.js';
//     import adminRouter from './routes/adminRoutes.js';
//     import userRouter from './routes/userRoutes.js';
// import { stripeWebhook } from './controllers/stripeWebhooks.js';


//     // export {ClerkExpressWithAuth} from '@clerk/clerk-sdk-node'


// const app = express();
//     await connectDB();

    
//     app.post("/api/stripe",express.raw({ type: "application/json" }),stripeWebhook);

//     app.use(express.json());
//     app.use(cors());https://github.com/Rohitpari/QuickShow
//     app.use(clerkMiddleware());






//     // Your protected route

//     app.get('/', (req,res) => res.send('server is Live!'));
//     app.use('/api/inngest', serve({ client: inngest, functions }));
//     app.use('/api/show', showRouter);
//     app.use('/api/booking',bookingRouter)
//     app.use('/api/admin',adminRouter);
//     app.use('/api/user',userRouter)



//     app.listen(3000, () => console.log(`server listening on 3000`));



import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express';
import connectDB from './configs/db.js';
import { serve } from "inngest/express";
import { inngest, functions } from './inngest/index.js';
import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingroutes.js';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';
import { stripeWebhook } from './controllers/stripeWebhooks.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Database Connection
connectDB();

// Stripe Webhook (JSON parse se pehle aana chahiye)
app.post("/api/stripe", express.raw({ type: "application/json" }), stripeWebhook);

// Middlewares
app.use(express.json());
app.use(cors()); // Link hata diya gaya hai
app.use(clerkMiddleware());

// Routes
app.get('/', (req, res) => res.send('Server is Live!'));
app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api/show', showRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));