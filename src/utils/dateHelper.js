/**
 * Get start of day
 */
const getStartOfDay = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

/**
 * Get end of day
 */
const getEndOfDay = (date = new Date()) => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

/**
 * Get start of month
 */
const getStartOfMonth = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Get end of month
 */
const getEndOfMonth = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};

/**
 * Add days to date
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Add hours to date
 */
const addHours = (date, hours) => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

/**
 * Add minutes to date
 */
const addMinutes = (date, minutes) => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

/**
 * Check if date is in the past
 */
const isPast = (date) => {
  return new Date(date) < new Date();
};

/**
 * Check if date is in the future
 */
const isFuture = (date) => {
  return new Date(date) > new Date();
};

/**
 * Format date to ISO string
 */
const toISOString = (date) => {
  return new Date(date).toISOString();
};

/**
 * Get date range for today
 */
const getTodayRange = () => {
  return {
    start: getStartOfDay(),
    end: getEndOfDay()
  };
};

/**
 * Get date range for this month
 */
const getThisMonthRange = () => {
  return {
    start: getStartOfMonth(),
    end: getEndOfMonth()
  };
};

/**
 * Calculate difference in days
 */
const diffInDays = (date1, date2) => {
  const diff = Math.abs(new Date(date1) - new Date(date2));
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

/**
 * Calculate difference in hours
 */
const diffInHours = (date1, date2) => {
  const diff = Math.abs(new Date(date1) - new Date(date2));
  return Math.floor(diff / (1000 * 60 * 60));
};

/**
 * Calculate difference in minutes
 */
const diffInMinutes = (date1, date2) => {
  const diff = Math.abs(new Date(date1) - new Date(date2));
  return Math.floor(diff / (1000 * 60));
};

module.exports = {
  getStartOfDay,
  getEndOfDay,
  getStartOfMonth,
  getEndOfMonth,
  addDays,
  addHours,
  addMinutes,
  isPast,
  isFuture,
  toISOString,
  getTodayRange,
  getThisMonthRange,
  diffInDays,
  diffInHours,
  diffInMinutes
};
