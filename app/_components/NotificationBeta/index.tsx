import BetaWarningBanner from './BetaWarningBanner'

export default function BetaBanner() {
  if (process.env.NEXT_PUBLIC_NO_BETA === 'true') return null

  return <BetaWarningBanner />
}
