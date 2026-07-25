const API_KEY = process.env.TWO_FACTOR_API_KEY;

export async function sendSmsOtp(phoneNumber, otp) {
  try {
    const res = await fetch(
      `https://2factor.in/API/V1/${API_KEY}/SMS/VERI/${phoneNumber}/${otp}/otp1`
    );

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      throw new Error(`SMS service returned invalid JSON: ${text}`);
    }

    if (!res.ok) {
      throw new Error(data?.message || `SMS service error: ${text}`);
    }

    return { ...data, success: true };
  } catch (error) {
    console.error("SMS Error:", error.message);

    throw new Error("Failed to send SMS");
  }
}

export async function VerifySmsOtp(id, otp) {
  try {
    const res = await fetch(
      `https://2factor.in/API/V1/${API_KEY}/SMS/VERIFY/${id}/${otp}`
    );

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      throw new Error(`SMS verify service returned invalid JSON: ${text}`);
    }

    if (!res.ok) {
      throw new Error(data?.message || `SMS verify service error: ${text}`);
    }

    return true;
  } catch (error) {
    console.error("SMS Error:", error.message);
    throw new Error("Failed to verify SMS");
  }
}