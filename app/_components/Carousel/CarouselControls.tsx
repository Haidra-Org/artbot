/* eslint-disable @next/next/no-img-element */
import React, { useEffect } from 'react'
import { PrevButton, NextButton } from './CarouselArrowButtons'
import styles from './carousel.module.css'

type CarouselControlsProps = {
  selectedIndex: number
  scrollSnaps: number[]
  prevBtnDisabled: boolean
  nextBtnDisabled: boolean
  onPrevButtonClick: () => void
  onNextButtonClick: () => void
}

const CarouselControls: React.FC<CarouselControlsProps> = ({
  selectedIndex,
  scrollSnaps,
  prevBtnDisabled,
  nextBtnDisabled,
  onPrevButtonClick,
  onNextButtonClick
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        if (event.key === 'ArrowLeft') {
          onPrevButtonClick()
        } else if (event.key === 'ArrowRight') {
          onNextButtonClick()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onNextButtonClick, onPrevButtonClick])

  return (
    <div className={styles.embla__controls}>
      <div className={styles.embla__buttons}>
        <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
        <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
      </div>

      <div className={styles.embla__dots}>
        <div className="row">
          {selectedIndex + 1} / {scrollSnaps.length}
        </div>
      </div>
    </div>
  )
}

export default CarouselControls
