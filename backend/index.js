import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.js";
import Tweet from "./models/tweet.js";
import Plan from "./models/plan.js";
import Payment from "./models/payment.js";
import Subscription from "./models/subcriptions.js";
import crypto from "crypto";
import Rzp from "./libs/paymentRazorpay.js";
import {generateInvoice} from "./libs/generateInvoice.js";
import {uploadInvoice} from "./libs/uploadInvoice.js";
import {sendSubscriptionEmail} from "./libs/email.js";
import isPaymentAllowed from "./libs/payment-time.js";
import {checkTweetLimit} from "./libs/checkTweetLimit.js";
dotenv.config();
const app = express();
app.use(
  cors({
    origin: [ process.env.FRONTEND_URL,"http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Twiller backend is running successfully");
});

const port = process.env.PORT || 5000;
const url = process.env.MONGODB_URL;

mongoose
  .connect(url)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

//Register
app.post("/register", async (req, res) => {
  try {
    const existinguser = await User.findOne({ email: req.body.email });
    if (existinguser) {
      return res.status(200).send(existinguser);
    }
    const newUser = new User(req.body);
    await newUser.save();
    return res.status(201).send(newUser);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});
// loggedinuser
app.get("/loggedinuser", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).send({ error: "Email required" });
    }
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).send(user);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});
// update Profile
app.patch("/userupdate/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const updated = await User.findOneAndUpdate(
      { email },
      { $set: req.body },
      { new: true, upsert: false },
    );
    return res.status(200).send(updated);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});
// Tweet API

// POST
app.post("/post", async (req, res) => {
  try {
    const userId = req.body.author;

    const result = await checkTweetLimit(userId);

    if (!result.allowed) {
      return res.status(403).json({
        success: false,
        message:
          "Tweet limit reached. Upgrade your plan.",
      });
    }

    const tweet = new Tweet(req.body);

    await tweet.save();

    return res.status(201).send(tweet);
  } catch (error) {
    return res.status(400).send({
      error: error.message,
    });
  }
});
// get all tweet
app.get("/post", async (req, res) => {
  try {
    const tweets = await Tweet.find()
      .sort({ timestamp: -1 })
      .populate("author");

    return res.status(200).send(tweets);
  } catch (error) {
    return res.status(400).send({
      error: error.message,
    });
  }
});
//  LIKE TWEET
app.post("/like/:tweetid", async (req, res) => {
  try {
    const { userId } = req.body;
    const tweet = await Tweet.findById(req.params.tweetid);
    if (!tweet.likedBy.includes(userId)) {
      tweet.likes += 1;
      tweet.likedBy.push(userId);
      await tweet.save();
    }
    res.send(tweet);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});
// retweet
app.post("/retweet/:tweetid", async (req, res) => {
  try {
    const { userId } = req.body;
    const tweet = await Tweet.findById(req.params.tweetid);
    if (!tweet.retweetedBy.includes(userId)) {
      tweet.retweets += 1;
      tweet.retweetedBy.push(userId);
      await tweet.save();
    }
    res.send(tweet);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

// payment status time restrictions
app.get("/payments/status", async (req, res) => {
  try {
    if (!isPaymentAllowed()) {
      return res.status(403).json({
        success: false,
        message: "Payments are allowed only between 10:00 AM and 11:00 AM IST",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Payments are currently available",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Failed to check payment status",
    });
  }
});

// subscriptions status
app.get("/subscriptions/status/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || userId === "undefined") {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const tweetCount = await Tweet.countDocuments({
      author: userId,
    });

    const subscription = await Subscription.findOne({
      userId,
      isActive: true,
      endDate: {
        $gt: new Date(),
      },
    }).populate("planId");

    if (!subscription) {
      return res.status(200).json({
        plan: "Free",
        limit: 1,
        used: tweetCount,
        remaining: Math.max(1 - tweetCount, 0),
        expiresAt: null,
      });
    }

    const PLAN_LIMITS = {
      Free: 1,
      Bronze: 3,
      Silver: 5,
      Gold: Infinity,
    };

    const planName =
      subscription.planId?.name || "Free";

    const limit =
      PLAN_LIMITS[planName] ?? 1;

    const remaining =
      limit === Infinity
        ? null
        : Math.max(limit - tweetCount, 0);

    return res.status(200).json({
      plan: planName,
      limit:
        limit === Infinity
          ? "Unlimited"
          : limit,
      used: tweetCount,
      remaining,
      expiresAt:
        subscription.endDate,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch subscription status",
    });
  }
});

// payment create order
app.post("/payments/create-order/:userId", async (req, res) => {
  try {
    const { planName } = req.body;

    const {userId} = req.params;
    const plan = await Plan.findOne({
      name: planName,
    });

    if (!plan) {
      return res.status(404).json({
        message: "Plan not found",
      });
    }

    const options = {
      amount: plan.price * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await Rzp.orders.create(options);

    await Payment.create({
        userId,
        planId: plan._id,
        amount: plan.price,
        status: "PENDING",
        razorpayOrderId: order.id,
    });
    
    return res.status(201).json(order);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to place order",
    });
  }
});
// verify payment
app.post("/payment/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Validate request
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Find payment
    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // Already verified
    if (payment.status === "SUCCESS") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
      });
    }

    // Mark payment success
    payment.status = "SUCCESS";
    payment.razorpayPaymentId =
      razorpay_payment_id;

    await payment.save();

    // Get user and plan
    const user = await User.findById(
      payment.userId
    );

    const plan = await Plan.findById(
      payment.planId
    );

    if (!user || !plan) {
      return res.status(404).json({
        success: false,
        message: "User or Plan not found",
      });
    }

    // Deactivate existing subscriptions
    await Subscription.updateMany(
      {
        userId: payment.userId,
        isActive: true,
      },
      {
        isActive: false,
      }
    );

    // Create new subscription
    const startDate = new Date();

    const endDate = new Date();
    endDate.setMonth(
      endDate.getMonth() + 1
    );

    const newSubscription =
      await Subscription.create({
        userId: payment.userId,
        planId: payment.planId,
        startDate,
        endDate,
        isActive: true,
      });

    // Generate invoice
    const invoicePath =
      await generateInvoice({
        user,
        plan,
        payment,
        subscription: newSubscription,
      });


    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    // Upload invoice
    // const invoiceUrl =
    //   await uploadInvoice(invoicePath,invoiceNumber);

      // payment.invoiceUrl = invoiceUrl;

    payment.invoiceNumber = invoiceNumber

    await payment.save();

    // Send email
    await sendSubscriptionEmail({
      email: user.email,
      name: user.displayName,
      planName: plan.name,
      amount: payment.amount,
      invoiceNumber:
        payment.invoiceNumber,
      invoicePath,
      expiryDate:
        newSubscription.endDate,
    });

    return res.status(200).json({
      success: true,
      message:
        "Payment verified and subscription activated",
      subscription:
        newSubscription,
    });
  } catch (error) {
    console.error(
      "VERIFY PAYMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
