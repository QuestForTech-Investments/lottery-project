/**
 * Format a number as currency (USD)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return '$0.00';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Check if a balance is positive
 * @param {number} balance - The balance to check
 * @returns {boolean} True if positive
 */
export const isPositiveBalance = (balance: number): boolean => {
  return balance > 0;
};

/**
 * Check if a balance is negative
 * @param {number} balance - The balance to check
 * @returns {boolean} True if negative
 */
export const isNegativeBalance = (balance: number): boolean => {
  return balance < 0;
};
