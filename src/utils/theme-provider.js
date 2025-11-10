/**
 * Theme Provider Utility
 *
 * Provides functions to manage themes in the Vue Timelines library.
 */

/**
 * Apply a theme to an element
 * @param {HTMLElement} element - Element to apply theme to (defaults to document.body)
 * @param {string} theme - Theme name ('light' or 'dark')
 */
export function applyTheme(element = document.body, theme = 'light') {
  if (theme === 'dark') {
    element.classList.add('vt-theme-dark');
  } else {
    element.classList.remove('vt-theme-dark');
  }
}

/**
 * Get current theme
 * @param {HTMLElement} element - Element to check (defaults to document.body)
 * @returns {string} Current theme ('light' or 'dark')
 */
export function getTheme(element = document.body) {
  return element.classList.contains('vt-theme-dark') ? 'dark' : 'light';
}

/**
 * Toggle between light and dark theme
 * @param {HTMLElement} element - Element to toggle theme on (defaults to document.body)
 * @returns {string} New theme ('light' or 'dark')
 */
export function toggleTheme(element = document.body) {
  const currentTheme = getTheme(element);
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(element, newTheme);
  return newTheme;
}

/**
 * Watch for system preference changes and apply theme
 * @param {HTMLElement} element - Element to apply theme to (defaults to document.body)
 * @param {Function} callback - Optional callback when theme changes
 * @returns {Function} Cleanup function to stop watching
 */
export function watchSystemTheme(element = document.body, callback) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handleChange = (e) => {
    const theme = e.matches ? 'dark' : 'light';
    applyTheme(element, theme);
    if (callback) callback(theme);
  };

  // Apply initial theme
  handleChange(mediaQuery);

  // Listen for changes
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  } else {
    // Fallback for older browsers
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }
}

