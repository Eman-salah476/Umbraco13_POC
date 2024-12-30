
const baseUrl = "https://localhost:44392/umbraco/delivery/api/v2/content";
// Detect language from URL
const isArabic = window.location.href.includes("/ar/");
const acceptLanguage = isArabic ? "ar-eg" : "en-us";

