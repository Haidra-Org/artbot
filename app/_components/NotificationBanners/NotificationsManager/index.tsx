import BetaWarningBanner from '../BetaWarningBanner';

export default function NotificationsManager() {
  let isBeta = false;
  if (process.env.NEXT_PUBLIC_NO_BETA === 'true') isBeta = true;
  
  return null;
  // return <>{isBeta && <BetaWarningBanner />}</>;
}
