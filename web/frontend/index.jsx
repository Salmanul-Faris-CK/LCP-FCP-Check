import App from "./App";
import { createRoot } from "react-dom/client";
import { initI18n } from "./utils/i18nUtils";
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

// Log Web Vitals to the console
onCLS(console.log);
onFID(console.log);
onLCP(console.log);
onFCP(console.log);
onTTFB(console.log);

console.log('hello')
// Ensure that locales are loaded before rendering the app
initI18n().then(() => {
  const root = createRoot(document.getElementById("app"));
  root.render(<App />);
});
