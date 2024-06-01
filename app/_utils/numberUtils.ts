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
