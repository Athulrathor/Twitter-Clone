const supportedLanguages = [
  "en",
  "es",
  "hi",
  "pt",
  "zh",
  "fr",
];

export const validateLanguage = (req, res, next) => {
  // GET reads stored language — no body required
  if (req.method === "GET") {
    return next();
  }

  const { language } = req.body;

  if (!language) {
    return res.status(400).json({
      success: false,
      message: "Language is required.",
    });
  }

  if (!supportedLanguages.includes(language)) {
    return res.status(400).json({
      success: false,
      message: "Unsupported language.",
    });
  }

  next();
};
