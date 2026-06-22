import Subscription from "../models/subcriptions.js";
import Tweet from "../models/tweet.js";

const PLAN_LIMITS = {
  Free: 1,
  Bronze: 3,
  Silver: 5,
  Gold: Infinity,
};

export async function checkTweetLimit(
  userId
) {
  const subscription =
  await Subscription.findOne({
    userId,
    isActive: true,
    endDate: {
      $gt: new Date(),
    },
  }).populate("planId");

  const PLAN_LIMITS = {
    FREE: 1,
    BRONZE: 3,
    SILVER: 5,
    GOLD: Infinity,
  };

  const planName =
    subscription?.plan?.name?.toUpperCase() ??
    "FREE";

  const limit =
    PLAN_LIMITS[
      planName
    ];

  const tweetCount =
  await Tweet.countDocuments({
    author: userId,
  });

  if (
    limit !== Infinity &&
    tweetCount >= limit
  ) {
    return {
      allowed: false,
      plan: planName,
      limit,
      tweetCount,
    };
  }

  return {
    allowed: true,
    plan: planName,
    limit,
    tweetCount,
  };
}