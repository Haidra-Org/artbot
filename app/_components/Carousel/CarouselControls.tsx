/* eslint-disable @next/next/no-img-element */
import React from 'react'
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
