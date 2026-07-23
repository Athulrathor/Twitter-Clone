const API_KEY = process.env.TWO_FACTOR_API_KEY;

export async function sendSmsOtp(phoneNumber, otp) {
  try {
    const res = await fetch(
      `https://2factor.in/API/V1/${API_KEY}/SMS/VERI/${phoneNumber}/${otp}/otp1`
    );

    const data = res.json();

    return {...data,success: true};
  } catch (error) {
    console.error(
      "SMS Error:",
      error.response?.data || error.message
    );

    throw new Error("Failed to send SMS");
  }
}

export async function VerifySmsOtp(id, otp) {
  try {
    await fetch(
      `https://2factor.in/API/V1/${API_KEY}/SMS/VERIFY/${id}/${otp}`
    );

    return true;
  } catch (error) {
    console.error(
      "SMS Error:",
      error.response?.data || error.message
    );

    throw new Error("Failed to send SMS");
  }
}