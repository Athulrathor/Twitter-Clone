export default function isPaymentAllowed() {
  const now = new Date();

  const indiaTime = new Date(
    now.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    })
  );

  const hour = indiaTime.getHours();
  const minute = indiaTime.getMinutes();

  const currentMinutes = hour * 60 + minute;

  const startMinutes = 10 * 60; // 10:00 AM
  const endMinutes = 11 * 60;   // 11:00 AM

  return (
    currentMinutes >= startMinutes &&
    currentMinutes < endMinutes
  );
}