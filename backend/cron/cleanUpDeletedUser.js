import User from "../models/user.js";
import Session from "../models/session.js";
import Tweet from "../models/tweet.js";
import Subscription from "../models/subcriptions.js";
import Payment from "../models/payment.js";
import PasswordReset from "../models/PasswordReset.js";
import Otp from "../models/otp.js";
import Invoice from "../models/invoice.js";
import fireAuth from "../libs/firebaseAdmin.js";

export async function cleanupDeletedAccounts() {
  const users = await User.find({
    deleted: true,
    scheduledDeleteAt: { $lte: new Date() },
  });

  for (const user of users) {
    try {
      await Session.deleteMany({ userId: user._id });
      await Tweet.deleteMany({ userId: user._id });
      await Subscription.deleteMany({ userId: user._id });
      await Payment.deleteMany({ userId: user._id });
      await PasswordReset.deleteMany({ userId: user._id });
      await Otp.deleteMany({ userId: user._id });
      await Invoice.deleteMany({ userId: user._id });

      await User.findByIdAndDelete(user._id);

      await fireAuth.deleteUser(user.firebaseUid);

      console.log(`Deleted account: ${user.email}`);
    } catch (error) {
      console.error(`Failed to delete ${user.email}:`, error);
    }
  }
}
