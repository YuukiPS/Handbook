/**
 * Returns a Date object representing the current date one month from now.
 *
 * @return {Date} A Date object representing the current date one month from now.
 */
export default function expiresInAMonth(): Date {
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    return oneMonthFromNow;
}
