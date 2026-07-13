import User from "../models/user.js";
import Notification from "../models/notification.js";
import { io } from "../index.js";

const KEYWORDS = [
  "cricket",
  "science",
];

export function containsNotificationKeyword(text = "") {
  const content = text.toLowerCase();

  return KEYWORDS.some((keyword) =>
    content.includes(keyword.toLowerCase())
  );
}

export async function getNotificationUsers() {
  return User.find(
    {
      notificationEnabled: true,
    },
    {
      _id: 1,
    }
  ).lean();
}

export async function sendKeywordNotification(tweet) {
  const users = await User.find(
    {
      notificationEnabled: true,
    },
    {
      _id: 1,
    }
  ).lean();

  for (const user of users) {
    await Notification.create({
      userId: user._id,
      tweetId: tweet._id,
      title: "New Tweet",
      message: tweet.content,
    });

    io.to(user._id.toString()).emit("keyword-notification", {
      title: "New Tweet",
      body: tweet.content,
      tweetId: tweet._id,
    });
  }
}