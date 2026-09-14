/* The commercial numbers, in one place, because three of them are not
   confirmed yet and somebody will have to change them.
 *
 * OPEN BEFORE ADS RUN (carried over from Jane's note on the offer screen):
 *  - SUBSCRIBE_PRICE is derived from the 10% subscribe-and-save on the live
 *    product page. It is not confirmed.
 *  - No 3 or 6-month bundle exists. The ladder shows one.
 *  - The Starter Guide does not exist. It is promised as step 1.
 *
 * The on-screen warning about all three now renders only in development or
 * with ?debug=1, so the team still sees it in review and a customer never does.
 */
export const ONE_MONTH_PRICE = 49.99;
export const SUBSCRIBE_PRICE = 44.99;
export const SUBSCRIBE_SAVING = '10%';
export const GUARANTEE_DAYS = 60;

export const money = (n: number) => `$${n.toFixed(2)}`;

/** True when the internal warning block should render. Never true for a customer. */
export function showInternalNotes(): boolean {
  if (import.meta.env.DEV) return true;
  try {
    return new URLSearchParams(window.location.search).get('debug') === '1';
  } catch {
    return false;
  }
}
