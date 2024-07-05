import Link from 'next/link'

export default function BetaWarningPanel() {
  return (
    <div
      className="row w-full"
      style={{
        border: '2px solid red',
        borderRadius: '8px',
        padding: '8px'
      }}
    >
      <div>
        IMPORTANT: This is a *beta* (probably even alpha) version of ArtBot v2
        that is rapidly changing. Feel free to play around with it! If you
        create images you like, save them to your machine. Otherwise, they will
        be lost forever. Please report issues and leave feedback in the{' '}
        <Link
          href="https://discord.com/channels/781145214752129095/1258784663405596752"
          className="primary-color font-bold"
          target="_blank"
        >
          ArtBot v2 feedback thread on Discord.
        </Link>
      </div>
    </div>
  )
}
