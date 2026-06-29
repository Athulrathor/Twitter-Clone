import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.js";
import Tweet from "./models/tweet.js";
import Plan from "./models/plan.js";
import Payment from "./models/payment.js";
import Subscription from "./models/subcriptions.js";
import Session from "./models/session.js";
import crypto from "crypto";
import Rzp from "./libs/paymentRazorpay.js";
import { generateInvoice } from "./libs/generateInvoice.js";
import { uploadInvoice } from "./libs/uploadInvoice.js";
import { sendOtpEmail, sendSubscriptionEmail } from "./libs/email.js";
import isPaymentAllowed from "./libs/payment-time.js";
import { checkTweetLimit } from "./libs/checkTweetLimit.js";
import { signBcrypt } from "./libs/bcrypt.js";
import rateLimit from "express-rate-limit";
import { getLocation } from "./libs/getLocation.js";
import { getDeviceInfo } from "./libs/getDeviceInfo.js";
import { createOtp, verifyOtp } from "./libs/otp.js";
import { authRules } from "./middlewares/authRule.middleware.js";
import { deviceInfoMiddleware } from "./middlewares/deviceDetection.middleware.js";
import { verifyFirebaseToken } from "./middlewares/verifyFirebaseToken.js";
import fireAuth from "./libs/firebaseAdmin.js";

dotenv.config();
const app = express();
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:3000"],
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

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many registration attempts. Please try again later.",
  },
});

const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes

  max: 5, // maximum 5 OTP requests

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many OTP requests. Please wait 15 minutes before trying again.",
  },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many password reset requests. Please try again later.",
  },
});

//Register
app.post("/register", registerLimiter, async (req, res) => {
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
// auth refresh token
app.get("/auth/me", verifyFirebaseToken, async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.user.email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
      firebaseUid: req.user?.uid,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch user",
    });
  }
});
// Firebase login
app.post(
  "/firebase/login",
  verifyFirebaseToken,
  deviceInfoMiddleware,
  authRules,
  async (req, res) => {
    try {
      let user = await User.findOne({
        email: req.user.email,
      });

      await Session.updateMany(
        {
          userId: user?._id,
          status: "active",
          expiresAt: { $lt: new Date() },
        },
        {
          status: "expired",
          isCurrent: false,
        },
      );

      if (!user) {
        user = await User.create({
          username:
            req.user?.email.split("@")[0] + Math.floor(Math.random() * 1000),

          displayName: req.user?.name || "User",

          avatar:
            req.user?.picture ||
            "https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg",

          email: req.user?.email,
          location:
            req.deviceInfo.location?.city || req.deviceInfo.location?.country,
        });
      }

      let session;

      if (req.securityFlags.blocked) {
        session = await Session.create({
          userId: user._id,
          firebaseUid: req.user.uid,
          ipAddress: req.deviceInfo.ipAddress,
          browser: req.deviceInfo.browser,
          os: req.deviceInfo.os,
          deviceType: req.deviceInfo.deviceType,
          location: req.deviceInfo.location,
          loginMethod: req.body.loginMethod,

          status: "blocked",
          blockedReason: req.securityFlags.blockedReason,
          blockedAt: new Date(),
        });

        return res.status(403).json({
          success: false,
          blocked: true,
          reason: req.securityFlags.blockedReason,
          session,
        });
      }

      if (req.securityFlags?.requiresStepUp) {
        session = await Session.create({
          userId: user._id,
          firebaseUid: req.user.uid,
          ipAddress: req.deviceInfo.ipAddress,
          browser: req.deviceInfo.browser,
          os: req.deviceInfo.os,
          deviceType: req.deviceInfo.deviceType,
          location: req.deviceInfo.location,
          loginMethod: req.body.loginMethod,
          otpVerified: false,
          lastActiveAt: new Date(),
        });

        const otp = await createOtp({
          firebaseUid: req.user.uid,
          email: req.user.email,
        });

        if (!otp)
          return res
            .status(401)
            .json({ success: false, message: "otp not initiated" });

        await sendOtpEmail(user.email, user.username, otp.otp, otp.expiresAt);

        return res.status(200).json({
          success: true,
          requiresOtp: true,
          session,
          expiresAt: otp.expiresAt,
          message: "OTP sent.",
          firebaseUid: req.user.uid,
        });
      }

      session = await Session.create({
        userId: user._id,
        firebaseUid: req.user.uid,
        ipAddress: req.deviceInfo.ipAddress,
        browser: req.deviceInfo.browser,
        os: req.deviceInfo.os,
        deviceType: req.deviceInfo.deviceType,
        location: req.deviceInfo.location,
        status: "active",
        isCurrent: true,
        lastActiveAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        loginMethod: req.body.loginMethod,
      });

      return res.status(200).json({
        success: true,
        user,
        security: req.securityFlags,
        device: req.deviceInfo,
        firebaseUid: req.user.uid,
        session,
      });
    } catch (error) {
      console.error(error);

      return res.status(401).json({
        success: false,
        message: "Firebase authentication failed",
      });
    }
  },
);
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
        message: "Tweet limit reached. Upgrade your plan.",
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

    const planName = subscription.planId?.name || "Free";

    const limit = PLAN_LIMITS[planName] ?? 1;

    const remaining =
      limit === Infinity ? null : Math.max(limit - tweetCount, 0);

    return res.status(200).json({
      plan: planName,
      limit: limit === Infinity ? "Unlimited" : limit,
      used: tweetCount,
      remaining,
      expiresAt: subscription.endDate,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscription status",
    });
  }
});

// payment create order
app.post("/payments/create-order/:userId", async (req, res) => {
  try {
    const { planName } = req.body;

    const { userId } = req.params;
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // Validate request
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
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
    payment.razorpayPaymentId = razorpay_payment_id;

    await payment.save();

    // Get user and plan
    const user = await User.findById(payment.userId);

    const plan = await Plan.findById(payment.planId);

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
      },
    );

    // Create new subscription
    const startDate = new Date();

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const newSubscription = await Subscription.create({
      userId: payment.userId,
      planId: payment.planId,
      startDate,
      endDate,
      isActive: true,
    });

    // Generate invoice
    const invoicePath = await generateInvoice({
      user,
      plan,
      payment,
      subscription: newSubscription,
    });

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000,
    )}`;

    // Upload invoice
    // const invoiceUrl =
    //   await uploadInvoice(invoicePath,invoiceNumber);

    // payment.invoiceUrl = invoiceUrl;

    payment.invoiceNumber = invoiceNumber;

    await payment.save();

    // Send email
    await sendSubscriptionEmail({
      email: user.email,
      name: user.displayName,
      planName: plan.name,
      amount: payment.amount,
      invoiceNumber: payment.invoiceNumber,
      invoicePath,
      expiryDate: newSubscription.endDate,
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified and subscription activated",
      subscription: newSubscription,
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// auth
app.post("/auth/forgot-password", forgotPasswordLimiter, async (req, res) => {
  const { emailOrPhone } = req.body;

  if (!emailOrPhone) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email or phone number",
    });
  }

  const value = emailOrPhone.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const phoneRegex = /^[0-9]{10,15}$/;

  try {
    let user;

    if (emailRegex.test(value)) {
      user = await User.findOne({
        email: value.toLowerCase(),
      });
    } else if (phoneRegex.test(value)) {
      user = await User.findOne({
        "phone.num": value,
      });
    } else {
      return res.status(400).json({
        message: "Please enter a valid email or phone number",
      });
    }

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If that email is registered, a reset link has been sent.",
      });
    }

    const today = new Date();

    if (
      user.lastPasswordResetRequestAt &&
      user.lastPasswordResetRequestAt.toDateString() === today.toDateString()
    ) {
      return res.status(429).json({
        message: "You can use this option only one time per day.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await PasswordReset.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    user.lastPasswordResetRequestAt = today;

    await user.save({
      validateBeforeSave: false,
    });

    const resetLink =
      `${process.env.FRONTEND_URL}` + `/reset-password/${rawToken}`;

    const hasPhone = user.phone?.num?.trim();

    if (!hasPhone) {
      await sendPasswordRecoveryEmail(user.email, user.username, resetLink);
    } else {
      // send SMS here
    }

    return res.status(200).json({
      success: true,
      message: "A password reset link has been sent.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
});
app.post("/auth/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const resetRecord = await PasswordReset.findOne({
      tokenHash,
      used: false,
      expiresAt: {
        $gt: new Date(),
      },
    });

    if (!resetRecord) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    const user = await User.findById(resetRecord.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.password = await bcrypt.hash(password, 10);

    await user.save();

    resetRecord.used = true;

    await resetRecord.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
});

// otp verification
app.post("/login/otp", otpRateLimiter, async (req, res) => {
  try {
    const { firebaseUid, email } = req.body;

    if (!firebaseUid || !email)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credential!" });

    const otp = await createOtp({
      firebaseUid,
      email,
    });

    if (!otp)
      return res
        .status(401)
        .json({ success: false, message: "otp not initiated" });

    const username = email.split("@")[0];

    await sendOtpEmail(email, username, otp.otp, otp.expiresAt);

    return res.status(200).json({
      success: true,
      requiresOtp: true,
      expiresAt: otp.expiresAt,
      message: "OTP sent successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Otp failed!",
    });
  }
});
app.post("/login/verify", async (req, res) => {
  try {
    const { firebaseUid, otp } = req.body;

    if (!firebaseUid || !otp)
      return res
        .status(401)
        .json({ success: false, message: "Otp is required!" });

    const verify = await verifyOtp({
      firebaseUid,
      otp,
    });

    const sessionBlocked = await Session.findOne({
      firebaseUid,
      status: "blocked",
    });

    if (sessionBlocked) {
      return res.status(403).json({
        success: false,
        message: "This login attempt was blocked.",
      });
    }

    const pendingSession = await Session.findOne({
      firebaseUid,
      status: "pending",
    }).sort({ createdAt: -1 });

    if (!pendingSession) {
      return res.status(404).json({
        success: false,
        message: "Pending session not found.",
      });
    }

    await Session.updateMany(
      {
        userId: pendingSession.userId,
        isCurrent: true,
      },
      {
        isCurrent: false,
      },
    );

    const session = await Session.findByIdAndUpdate(
      pendingSession._id,
      {
        status: "active",
        otpVerified: true,
        otpVerifiedAt: new Date(),
        loginTime: new Date(),
        lastActiveAt: new Date(),
        isCurrent: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      { new: true },
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Pending session not found.",
      });
    }

    const user = await User.findById({ _id: session.userId });

    return res.status(200).json({
      success: true,
      user,
      verify,
      message: "Otp verified Successfully",
    });
  } catch (error) {
    console.error(error);

    const session = await Session.findOneAndUpdate(
      {
        firebaseUid,
        status: "pending",
      },
      {
        $set: {
          status: "failed",
          otpVerified: false,
        },
      },
      {
        sort: { createdAt: -1 },
        new: true,
      },
    );

    return res.status(500).json({
      success: false,
      message: "Otp failed!",
    });
  }
});

// session history
app.get("/sessions/history", verifyFirebaseToken, async (req, res) => {
  try {
    await Session.updateMany(
      {
        expiresAt: { $lt: new Date() },
        status: "active",
      },
      {
        $set: {
          status: "expired",
        },
      },
    );

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const user = await User.findOne({
      email: req.user.email,
    });

    // const latestSession = await Session.findOne({
    //   userId: user._id,
    //   isCurrent: true,
    // }).sort({
    //   lastActiveAt: -1,
    // });

    // if (!latestSession) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "No active session found",
    //   });
    // }

    // const currentSession = await Session.findOne({
    //   userId: user._id,
    //   isCurrent: true,
    //   status: "active",
    // }).lean();

        const userId = user._id;

    const [currentSession, activeCount, blockedCount, otpCount, deviceTypes] =
      await Promise.all([
        Session.findOne({
          userId,
          isCurrent: true,
          status: "active",
        }).lean(),

        Session.countDocuments({
          userId,
          status: "active",
        }),

        Session.countDocuments({
          userId,
          status: "blocked",
        }),

        Session.countDocuments({
          userId,
          otpVerified: true,
        }),

        Session.distinct("deviceType", {
          userId,
        }),
      ]);

    const sessions = await Session.find({
      userId: user._id,
      _id: { $ne: currentSession?._id },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalSessions = await Session.countDocuments({
      userId: user._id,
      _id: { $ne: currentSession?._id },
    });

    res.json({
      success: true,
      sessions,
      currentSession,
      stats: {
        activeCount,
        blockedCount,
        otpCount,
        deviceCount: deviceTypes.length,
      },
      pagination: {
        page,
        limit,
        total: totalSessions,
        totalPages: Math.ceil(totalSessions / limit),
        hasNext: page * limit < totalSessions,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch sessions",
    });
  }
});

// logs outs
app.post("/auth/logout", verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { sessionId } = req.body;

    const user = await User.findOne({
      email: req.user.email,
    });

    await Session.findOneAndUpdate(
      {
        _id: sessionId,
        userId: user._id,
      },
      {
        status: "logged_out",
        logoutTime: new Date(),
        isCurrent: false,
      },
    );

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/auth/logout-all", verifyFirebaseToken, async (req, res) => {
  try {
    const email = req.user.email;

    const user = await User.findOne({
      email: req.user.email,
    });

    await fireAuth.revokeRefreshTokens(req.user.uid);

    await Session.updateMany(
      { userId: user._id, status: "active" },
      {
        status: "logged_out",
        logoutTime: new Date(),
        isCurrent: false,
      },
    );

    res.json({
      success: true,
      message: "All sessions revoked successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/auth/logout-others", verifyFirebaseToken, async (req, res) => {
  try {
    const email = req.user.email;
    const { sessionId } = req.body;

    await Session.updateMany(
      {
        userId: user._id,
        _id: { $ne: sessionId },
        status: "active",
      },
      {
        status: "logged_out",
        logoutTime: new Date(),
        isCurrent: false,
      },
    );

    await fireAuth.revokeRefreshTokens(req.user.uid);

    res.json({
      success: true,
      message: "Other sessions revoked. Refresh current session.",
      requireRefresh: true,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
