import mongoose from "mongoose";
const UserSchema = mongoose.Schema({
  username: { type: String, required: true },
  firebaseUid: {
    type: String,
    required: true,
  },
  displayName: { type: String, required: true },
  avatar: { type: String },
  email: { type: String, required: true, unique: true },
  phone: {
    type: {
      code: { type: String },
      num: { type: String, match: /^[0-9]{10,15}$/ },
    },
    unique: true,
    sparse: true,
  },
  bio: { type: String, default: "" },
  location: { type: String, default: "" },
  website: { type: String, default: "" },
  joinedDate: { type: Date, default: Date.now() },
  tempPassword: { type: String },
  lastPasswordResetRequestAt: Date,
  deletedAt: {type: Date,default: null},
  isDeleted: {type: Boolean,default: false},
  scheduledDeleteAt : { type: Date, default: null },
  restoreAt: { type: Date, default: null },
});

UserSchema.index(
  { scheduledDeleteAt: 1 },
  { expireAfterSeconds: 0 }
);

export default mongoose.model("User", UserSchema);
