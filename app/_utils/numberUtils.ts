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
