
const baseUrl = "https://localhost:44392/umbraco/delivery/api/v2/content";
// Detect language from URL
const isEnglish = window.location.href.includes("/en/");
const acceptLanguage = isEnglish ? "en-us" : "ar-eg";
const ApiKey = "BCBAAB24-7226-4C6A-9310-A3AA4C50E5B7";

