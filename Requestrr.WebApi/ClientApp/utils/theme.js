// Applies/persists the Requestrr appearance (theme) setting.
//
// "light" is the default and applies no class (keeps the original Argon
// styling untouched). "dark" and "high-contrast" toggle a class on <html>
// which is targeted by src/assets/scss/custom/_theme-dark.scss.
//
// The theme is the source of truth on the server (see Settings.jsx / the
// /api/settings endpoint), but we also cache the last known value in
// localStorage purely so the very first paint on a repeat visit can already
// be in the right theme, before the settings API call resolves.

const STORAGE_KEY = "requestrr-theme";
const VALID_THEMES = ["light", "dark", "high-contrast"];
const THEME_CLASSES = {
  dark: "theme-dark",
  "high-contrast": "theme-high-contrast",
};

export function applyTheme(theme) {
  const safeTheme = VALID_THEMES.includes(theme) ? theme : "light";
  const root = document.documentElement;

  Object.values(THEME_CLASSES).forEach(className => root.classList.remove(className));

  if (THEME_CLASSES[safeTheme]) {
    root.classList.add(THEME_CLASSES[safeTheme]);
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, safeTheme);
  } catch (e) {
    // localStorage can be unavailable (e.g. some embedded/iframe contexts
    // with strict privacy settings) - theme still applies for this load,
    // it just won't be cached for next time.
  }

  return safeTheme;
}

export function getCachedTheme() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) || "light";
  } catch (e) {
    return "light";
  }
}
