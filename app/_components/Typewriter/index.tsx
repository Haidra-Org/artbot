import React from 'react'
import styles from './typewriter.module.css'

interface TypewriterProps {
  cursor: string
  eraseDelay: number
  eraseSpeed: number
  onEraseDelay: () => void
  onEraseDone: () => void
  text: string
  typingDelay: number
}
function Typewriter({
  text,
  eraseSpeed = 400,
  cursor = '|',
  typingDelay = 2500,
  eraseDelay = 5000,
  onEraseDone = () => {},
  onEraseDelay = () => {},
  ...otherProps
}: Partial<TypewriterProps>) {
  const [currentText, setCurrentText] = React.useState('')
  const [__timeout, set__Timeout] = React.useState(null)
  const [isTyping, setIsTyping] = React.useState(true)
  const [currentIndex, setCurrentIndex] = React.useState(0)

  React.useEffect(() => {
    startTyping()
    setTimeout(onEraseDelay, 50)

    return () => {
      __timeout && clearTimeout(__timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    const rawText = getRawText()[currentIndex]
    if (isTyping) {
      if (currentText.length < rawText.length) {
        const randomSpeed = Math.floor(Math.random() * (60 - 25 + 1)) + 25
        // @ts-expect-error something or another
        set__Timeout(setTimeout(type, randomSpeed))
      } else {
        setIsTyping(false)
        // @ts-expect-error something or another
        set__Timeout(setTimeout(erase, eraseDelay))
      }
    } else {
      if (currentText.length === 0) {
        const textArray = getRawText()
        const index =
          currentIndex + 1 === textArray.length ? 0 : currentIndex + 1
        if (index === currentIndex) {
          setIsTyping(true)
          setTimeout(startTyping, typingDelay)
        } else {
          setTimeout(() => setCurrentIndex(index), typingDelay)
        }
      } else {
        // @ts-expect-error something or another
        set__Timeout(setTimeout(erase, eraseSpeed))
      }
    }
    return () => {
      __timeout && clearTimeout(__timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentText])

  React.useEffect(() => {
    if (!isTyping) {
      setIsTyping(true)
      startTyping()
    }
    return () => {
      __timeout && clearTimeout(__timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex])

  function getRawText() {
    // @ts-expect-error something or another
    return typeof text === 'string' ? [text] : [...text]
  }

  function startTyping() {
    const randomSpeed = Math.floor(Math.random() * (60 - 25 + 1)) + 25
    set__Timeout(
      // @ts-expect-error something or another
      setTimeout(() => {
        onEraseDelay()
        type()
      }, randomSpeed)
    )
  }

  function type() {
    const rawText = getRawText()[currentIndex]

    if (currentText.length < rawText.length) {
      const displayText = rawText.substr(0, currentText.length + 1)
      setCurrentText(displayText)
    }
  }

  function erase() {
    let index = currentIndex
    if (currentText.length !== 0) {
      const displayText = currentText.substr(
        -currentText.length,
        currentText.length - 1
      )
      setCurrentText(displayText)
      if (displayText === '') {
        setTimeout(() => {
          onEraseDone()
        }, 50)
      }
    } else {
      const textArray = getRawText()
      index = index + 1 === textArray.length ? 0 : index + 1
      setCurrentIndex(index)
    }
  }

  return (
    <div className={styles.Typewriter} {...otherProps}>
      <span className={styles.Typewriter__text}>
        {'> '} {currentText}
        <span className={styles.Typewriter__cursor}>{cursor}</span>
      </span>
    </div>
  )
}

export default Typewriter
