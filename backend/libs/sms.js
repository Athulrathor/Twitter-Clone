const API_KEY = process.env.FAST_TWO_API_KEY || process.env.FAST_TWO_API_KEY;

function normalizePhoneNumber(phoneNumber) {
  if (!phoneNumber) {
    throw new Error("Phone number is required for SMS verification.");
  }

  const digits = phoneNumber.replace(/\D/g, "");

  if (digits.length === 10) return digits;
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 13 && digits.startsWith("091")) return digits.slice(3);
  if (digits.length === 14 && digits.startsWith("0091")) return digits.slice(4);

  throw new Error(
    "Invalid phone number. Expected 10 digits after normalization.",
  );
}

export async function sendSmsOtp(phoneNumber, otp) {
  if (!API_KEY) {
    throw new Error("SMS API key is not configured.");
  }
  console.log("phoneNuber: ", phoneNumber);
  const normalizedPhone = normalizePhoneNumber(phoneNumber);

  try {
    const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "q", // transactional
        message: `Your verification code is ${otp}. It is valid for 5 minutes.`,
        language: "english",
        numbers: normalizedPhone,
      }),
    });

    const text = await res.text();
    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      throw new Error(`SMS service returned invalid JSON: ${text}`);
    }

    if (!res.ok || data.return === false) {
      throw new Error(data.message || "Failed to send SMS");
    }

    return { ...data, success: true };
  } catch (error) {
    console.error("SMS Error:", error.message);

    throw new Error("Failed to send SMS");
  }
}

// export async function VerifySmsOtp(id, otp) {
//   if (!API_KEY) {
//     throw new Error("SMS API key is not configured.");
//   }

//   try {
//     const res = await fetch(
//       `https://2factor.in/API/V1/${API_KEY}/SMS/VERIFY/${id}/${otp}`,
//     );

//     const text = await res.text();
//     let data;
//     try {
//       data = JSON.parse(text);
//     } catch (parseError) {
//       throw new Error(`SMS verify service returned invalid JSON: ${text}`);
//     }

//     if (!res.ok) {
//       throw new Error(
//         data?.Details || data?.message || `SMS verify service error: ${text}`,
//       );
//     }

//     return true;
//   } catch (error) {
//     console.error("SMS Error:", error.message);
//     throw new Error("Failed to verify SMS");
//   }
// }
