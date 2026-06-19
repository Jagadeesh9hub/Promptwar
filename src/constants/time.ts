/** Date/time constants used by the O(n) trend aggregation. */

/** Length of an ISO date key, 'YYYY-MM-DD'. */
export const DATE_KEY_LENGTH = 10;

/** Length of a month key, 'YYYY-MM'. */
export const MONTH_KEY_LENGTH = 7;

/** Result of Date#getUTCDay() for Sunday and Monday (0 = Sunday … 6 = Saturday). */
export const SUNDAY_INDEX = 0;
export const MONDAY_INDEX = 1;

/** Days to step back from a Sunday to reach the week's Monday start. */
export const MONDAY_OFFSET_FROM_SUNDAY = -6;
