

import dayjs from "dayjs";

/**
 * Format a date string or Date object into a readable format.
 * @param {string | Date} date - date to format
 * @param {string} format - optional dayjs format (default: "DD MMM YYYY")
 * @returns {string} formatted date or empty string
 */
export const formatDate = (date, format = "DD MMM YYYY") => {
  if (!date) return "";

  const parsed = dayjs(date);
  if (!parsed.isValid()) return "";

  return parsed.format(format);
};