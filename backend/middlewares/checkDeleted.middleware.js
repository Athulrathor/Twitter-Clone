import User from "../models/User.js";

export const checkDeletedAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.email).select(
      "deleted scheduledDeleteAt"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user?.isDeleted) {
      return res.status(403).json({
        success: false,
        code: "ACCOUNT_DELETED",
        message: "Your account is scheduled for deletion.",
        deleteAt: user?.scheduledDeleteAt,
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};