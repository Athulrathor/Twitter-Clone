import { toast } from "sonner";

export const notify = {
  success: (message: string) =>
    toast.success(message),

  error: (message: string) =>
    toast.error(message),

  warning: (message: string) =>
    toast.warning(message),

  info: (message: string) =>
    toast.info(message),

  loading: (message: string) =>
    toast.loading(message),

  dismiss: (id: string | number) =>
    toast.dismiss(id),
};

// Login
// ✅ Welcome back, Athul!
// ❌ Invalid email or password.
// ⚠️ Too many login attempts. Try again in 15 minutes.
// ℹ️ Logging you in...
// Signup
// ✅ Account created successfully.
// ⚠️ Email already exists.
// ❌ Failed to create account.
// Email Verification
// ℹ️ Verification email sent.
// ✅ Email verified.
// ⚠️ Verification link expired.
// OTP
// ℹ️ OTP sent successfully.
// ✅ OTP verified.
// ❌ Invalid OTP.
// ⚠️ OTP expired.
// ⚠️ Too many OTP attempts.
// 4. Audio Upload
// ℹ️ Uploading audio...
// ✅ Audio uploaded successfully.
// ❌ Audio upload failed.
// ⚠️ Audio exceeds 100MB.
// ⚠️ Unsupported audio format.
// ⚠️ Audio duration exceeds limit.
// 5. Image Upload
// ℹ️ Uploading image...
// ✅ Image uploaded.
// ❌ Image upload failed.
// ⚠️ Unsupported image format.
// ⚠️ Image exceeds size limit.
// 6. Tweet
// ℹ️ Posting tweet...
// ✅ Tweet posted.
// ❌ Failed to post tweet.
// ⚠️ Tweet cannot be empty.
// ⚠️ Tweet exceeds character limit.
// 7. Delete
// ℹ️ Removing audio...
// ✅ Audio removed.
// ❌ Failed to remove audio.
// 8. Permissions
// ❌ You don't have permission to perform this action.
// ⚠️ Session expired. Please login again.
// ⚠️ Audio upload verification required.
// ⚠️ Email verification required.
// 9. Network
// ❌ No internet connection.
// ⚠️ Server unavailable.
// ❌ Request timed out.
// 10. Restrictions
// ⚠️ Maximum one audio per tweet.
// ⚠️ Maximum four images allowed.
// ⚠️ File type not supported.
// ⚠️ Maximum upload limit reached.
// 11. Success Actions
// ✅ Profile updated.
// ✅ Password changed.
// ✅ Settings saved.
// ✅ Comment added.
// ✅ Reply posted.
// ✅ Tweet deleted.