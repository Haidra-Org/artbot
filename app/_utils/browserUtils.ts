// This is needed to handle instances where API_BASE_PATH is not set (or is ""),
// which is casted to "undefined". We need to properly handle that here.
export const appBasepath = () => {
  const path = process.env.NEXT_PUBLIC_API_BASE_PATH

  // People shouldn't add only a slash to the config basepath, but they probably will anyway.
  if (path === '/') {
    return ''
  }

  if (path) {
    return path
  }

  // Return EMPTY string, and not "/", otherwise BAD_THINGS_HAPPEN.
  return ''
}

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
