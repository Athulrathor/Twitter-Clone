import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// English
import commonEN from "./locales/en/common.json";
import authEN from "./locales/en/auth.json";
import profileEN from "./locales/en/profile.json";
import securityEN from "./locales/en/security.json";
import validationEN from "./locales/en/validation.json";
import notificationEN from "./locales/en/notification.json";
import toastEN from "./locales/en/toast.json";

// Hindi
import commonHI from "./locales/hi/common.json";
import authHI from "./locales/hi/auth.json";
import profileHI from "./locales/hi/profile.json";
import securityHI from "./locales/hi/security.json";
import validationHI from "./locales/hi/validation.json";
import notificationHI from "./locales/hi/notification.json";
import toastHI from "./locales/hi/toast.json";

// Spanish
import commonES from "./locales/es/common.json";
import authES from "./locales/es/auth.json";
import profileES from "./locales/es/profile.json";
import securityES from "./locales/es/security.json";
import validationES from "./locales/es/validation.json";
import notificationES from "./locales/es/notification.json";
import toastES from "./locales/es/toast.json";

// Portuguese
import commonPT from "./locales/pt/common.json";
import authPT from "./locales/pt/auth.json";
import profilePT from "./locales/pt/profile.json";
import securityPT from "./locales/pt/security.json";
import validationPT from "./locales/pt/validation.json";
import notificationPT from "./locales/pt/notification.json";
import toastPT from "./locales/pt/toast.json";

// French
import commonFR from "./locales/fr/common.json";
import authFR from "./locales/fr/auth.json";
import profileFR from "./locales/fr/profile.json";
import securityFR from "./locales/fr/security.json";
import validationFR from "./locales/fr/validation.json";
import notificationFR from "./locales/fr/notification.json";
import toastFR from "./locales/fr/toast.json";

// Chinese
import commonZH from "./locales/zh/common.json";
import authZH from "./locales/zh/auth.json";
import profileZH from "./locales/zh/profile.json";
import securityZH from "./locales/zh/security.json";
import validationZH from "./locales/zh/validation.json";
import notificationZH from "./locales/zh/notification.json";
import toastZH from "./locales/zh/toast.json";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: commonEN,
      auth: authEN,
      profile: profileEN,
      security: securityEN,
      validation: validationEN,
      notification: notificationEN,
      toast: toastEN,
    },
    hi: {
      common: commonHI,
      auth: authHI,
      profile: profileHI,
      security: securityHI,
      validation: validationHI,
      notification: notificationHI,
      toast: toastHI,
    },
    es: {
      common: commonES,
      auth: authES,
      profile: profileES,
      security: securityES,
      validation: validationES,
      notification: notificationES,
      toast: toastES,
    },
    pt: {
      common: commonPT,
      auth: authPT,
      profile: profilePT,
      security: securityPT,
      validation: validationPT,
      notification: notificationPT,
      toast: toastPT,
    },
    fr: {
      common: commonFR,
      auth: authFR,
      profile: profileFR,
      security: securityFR,
      validation: validationFR,
      notification: notificationFR,
      toast: toastFR,
    },
    zh: {
      common: commonZH,
      auth: authZH,
      profile: profileZH,
      security: securityZH,
      validation: validationZH,
      notification: notificationZH,
      toast: toastZH,
    },
  },
  lng: "en",
  fallbackLng: "en",
  defaultNS: "common",
  ns: [
    "common",
    "auth",
    "profile",
    "security",
    "validation",
    "notification",
    "toast",
  ],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
