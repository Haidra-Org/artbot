export const isiOS = () => {
  return (
    [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator?.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  )
}

export const isSafariBrowser = () => {
  const is_chrome = navigator.userAgent.indexOf('Chrome') > -1
  const is_safari = navigator.userAgent.indexOf('Safari') > -1

  if (is_safari) {
    if (is_chrome)
      // Chrome seems to have both Chrome and Safari userAgents
      return false
    else return true
  }
  return false
}
