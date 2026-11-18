/**
 * The only place the product name is written. Everything else imports BRAND.
 * `pnpm brand:check` fails the build if the name appears anywhere else in the web sources.
 *
 * Trademark note (not a legal opinion): a federal registration for this word exists
 * (US Reg. #7312420, Class 9). Whether this use conflicts with it has not been assessed.
 * The owner should have a trademark attorney review it before launch.
 */
export const BRAND = {
  name: 'ZEROVA',
  tagline: 'Start at 0. Close the circle.',
  chain: 'Robinhood Chain',
} as const;
