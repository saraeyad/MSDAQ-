import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(HttpApi)
  .init({
    fallbackLng: "ar",
    supportedLngs: ["ar", "en"],
    backend: { loadPath: "/locales/{{lng}}/translation.json?v=10" },
    interpolation: { escapeValue: false },
  });

export default i18n;
