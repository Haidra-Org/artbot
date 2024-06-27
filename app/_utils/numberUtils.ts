// Define the type for the input object
interface TimeDifferenceInput {
  timestamp1: number
  timestamp2: number
  unit: 'seconds' | 'minutes' | 'hours' | 'days'
  round?: boolean
}

export const calculateTimeDifference = ({
  timestamp1,
  timestamp2,
  unit,
  round = false
}: TimeDifferenceInput): number => {
  if (typeof timestamp1 !== 'number' || typeof timestamp2 !== 'number') {
    throw new Error('Both timestamps must be numbers.')
  }

  // Calculate the absolute difference in milliseconds
  const diffInMillis = Math.abs(timestamp2 - timestamp1)

  // Convert the difference based on the specified unit
  let difference: number
  switch (unit) {
    case 'seconds':
      difference = diffInMillis / 1000
      break
    case 'minutes':
      difference = diffInMillis / (1000 * 60)
      break
    case 'hours':
      difference = diffInMillis / (1000 * 60 * 60)
      break
    case 'days':
      difference = diffInMillis / (1000 * 60 * 60 * 24)
      break
    default:
      throw new Error(
        'Invalid unit. Use "seconds", "minutes", "hours", or "days".'
      )
  }

  // Return the difference, rounded if specified
  if (round) {
    return Math.round(difference)
  } else {
    return parseFloat(difference.toFixed(2))
  }
}

export const formatSeconds = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const hoursStr = hours > 0 ? `${hours}h ` : ''
  const minutesStr = minutes > 0 ? `${minutes}m ` : ''
  const secondsStr = `${secs}s`

  return `${hoursStr}${minutesStr}${secondsStr}`.trim()
}

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp)

  // Format date to YYYY/MM/DD
  const formattedDate = date.toLocaleDateString('en-CA') // "en-CA" gives "YYYY-MM-DD"

  // Format time to h:mm AM/PM
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  })

  return `${formattedDate.replace(/-/g, '/')} ${formattedTime}`
}

export const formatPendingPercentage = ({
  init,
  remaining
}: {
  init: number
  remaining: number
}) => {
  let pctComplete = 1

  if (init > 0 && remaining >= 0) {
    const pct = 100 - (remaining / init) * 100
    pctComplete = Math.round(pct * 100) / 100
  }

  if (pctComplete < 1) {
    pctComplete = 1
  }

  if (pctComplete > 95) {
    pctComplete = 95
  }

  return pctComplete
}

export const formatKudos = (num: number) => {
  if (num === 0) {
    return '...'
  }

  if (num < 1000) {
    return num.toString()
  } else if (num < 1000000) {
    if ((num / 1000).toFixed(1) + 'K' === '1000.0K') {
      return '1.0M'
    }
    return (num / 1000).toFixed(1) + 'K'
  } else if (num < 1000000000) {
    if ((num / 1000000).toFixed(1) + 'M' === '1000.0M') {
      return '1.0B'
    }
    return (num / 1000000).toFixed(1) + 'M'
  } else {
    return (num / 1000000000).toFixed(1) + 'B'
  }
}

export const nearestWholeMultiple = (input: number, X = 64) => {
  let output = Math.round(input / X)
  if (output === 0 && input > 0) {
    output += 1
  }

  output *= X

  return output
}
