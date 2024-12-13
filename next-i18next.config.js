module.exports = {
  i18n: {
    defaultLocale: "he",
    locales: ["ar", "en", "es", "fr", "he", "it", "pt", "ru", "uk"],
    localeDetection: false
  },
  localePath:
    typeof window === "undefined"
      ? require("path").resolve("./public/locales")
      : "/public/locales"
}
