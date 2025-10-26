/**
 * Utility functions for formatting numbers and currency
 */

/**
 * Safely formats a number as currency with 2 decimal places
 * @param {any} value - The value to format
 * @returns {string} Formatted currency string (e.g., "₹123.45")
 */
export const formatCurrency = (value) => {
  const n = Number(value);
  if (Number.isNaN(n)) return '₹0.00';
  return `₹${n.toFixed(2)}`;
};

/**
 * Safely formats a number with specified decimal places
 * @param {any} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number string
 */
export const formatNumber = (value, decimals = 2) => {
  const n = Number(value);
  if (Number.isNaN(n)) return '0.00';
  return n.toFixed(decimals);
};

/**
 * Safely parses a value to a number, returning 0 for invalid inputs
 * @param {any} value - The value to parse
 * @returns {number} Parsed number or 0
 */
export const safeNumber = (value) => {
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
};