import { FailureLimiter } from '@server/lib/limiter';
import { singleton } from '@server/lib/singleton';

/*
 * Failed attempts are counted per action, so guests guessing the friends passcode can never lock the
 * admins out of signing in (they used to share one site-wide counter). Each limiter allows a number of
 * failures per key (client address, or account) and overall, within 10 minutes. scrypt makes every
 * guess slow as well.
 */
const WINDOW = 10 * 60 * 1000;

/** Staff sign-in, per client address. */
export const loginLimiter = singleton('limiter-login', () => new FailureLimiter(8, 100, WINDOW));
/** Staff sign-in, per username: slows guessing one account from many addresses. */
export const accountLimiter = singleton('limiter-account', () => new FailureLimiter(20, 100_000, WINDOW));
/** Friends passcode. */
export const unlockLimiter = singleton('limiter-unlock', () => new FailureLimiter(8, 200, WINDOW));
/** First-time setup code. */
export const setupLimiter = singleton('limiter-setup', () => new FailureLimiter(8, 60, WINDOW));
/** "Current password" when staff change their own password. */
export const passwordLimiter = singleton('limiter-password', () => new FailureLimiter(8, 60, WINDOW));
