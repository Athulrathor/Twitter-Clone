import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en/common.json";
import hi from "./locales/hi/common.json";
import es from "./locales/es/common.json";
import pt from "./locales/pt/common.json";
import zh from "./locales/zh/common.json";
import fr from "./locales/fr/common.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      es: { translation: es },
      pt: { translation: pt },
      zh: { translation: zh },
      fr: { translation: fr },
    },
    lng: "en",
    fallbackLng: "en",

    interpolation: {
      escapeValue: false,
    },
  });


export default i18n;