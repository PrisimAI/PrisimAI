// styleManager.js
// Utility to dynamically update CSS variables in style.css at runtime
// Supports adding, updating, and resetting styles, persisted via localStorage

/**
 * Update a CSS variable in the document root.
 * @param {string} variable - The CSS variable name (without -- prefix).
 * @param {string} value - The value to assign to the variable.
 */
export function setStyle(variable, value) {
  if (!variable || typeof value === 'undefined') {
    throw new Error('Both variable and value are required.');
  }
  document.documentElement.style.setProperty(`--${variable}`, value);
  persistStyle(variable, value);
}

/**
 * Reset a CSS variable to its default by removing its inline override.
 * @param {string} variable - The CSS variable name (without -- prefix).
 */
export function resetStyle(variable) {
  document.documentElement.style.removeProperty(`--${variable}`);
  removePersistedStyle(variable);
}

/**
 * Persist style changes in localStorage so they survive page reloads.
 * @param {string} variable
 * @param {string} value
 */
function persistStyle(variable, value) {
  const styles = JSON.parse(localStorage.getItem('customStyles') || '{}');
  styles[variable] = value;
  localStorage.setItem('customStyles', JSON.stringify(styles));
}

/**
 * Remove a persisted style from localStorage.
 * @param {string} variable
 */
function removePersistedStyle(variable) {
  const styles = JSON.parse(localStorage.getItem('customStyles') || '{}');
  delete styles[variable];
  localStorage.setItem('customStyles', JSON.stringify(styles));
}

/**
 * Apply persisted styles from localStorage on page load.
 */
export function applyPersistedStyles() {
  const styles = JSON.parse(localStorage.getItem('customStyles') || '{}');
  Object.entries(styles).forEach(([variable, value]) => {
    document.documentElement.style.setProperty(`--${variable}`, value);
  });
}

// Auto-apply persisted styles on script load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', applyPersistedStyles);
}
