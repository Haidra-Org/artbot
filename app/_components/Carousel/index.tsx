import React from 'react'
import { EmblaOptionsType } from 'embla-carousel'
import { useDotButton } from '@/app/_hooks/useCarouselDots'
import {
  PrevButton,
  NextButton,
  usePrevNextButtons
} from './CarouselArrowButtons'
import useEmblaCarousel from 'embla-carousel-react'
import styles from './carousel.module.css'
import { ImageFileInterface } from '@/app/_data-models/ImageFile_Dexie'
import CarouselImage from './CarouselImage'

type PropType = {
  slides: ImageFileInterface[]
  options?: EmblaOptionsType
}

const Carousel: React.FC<PropType> = (props) => {
  const { slides, options } = props
  const [emblaRef, emblaApi] = useEmblaCarousel(options)

  const { selectedIndex, scrollSnaps } = useDotButton(emblaApi)

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  } = usePrevNextButtons(emblaApi)

  return (
    <section className={styles.embla}>
      <div className={styles.embla__viewport} ref={emblaRef}>
        <div className={styles.embla__container}>
          {slides.map((image, index) => (
            <div className={styles.embla__slide} key={index}>
              <div>
                <CarouselImage imageBlob={image.imageBlob as Blob} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {slides.length > 1 && (
        <div className={styles.embla__controls}>
          <div className={styles.embla__buttons}>
            <PrevButton
              onClick={onPrevButtonClick}
              disabled={prevBtnDisabled}
            />
            <NextButton
              onClick={onNextButtonClick}
              disabled={nextBtnDisabled}
            />
          </div>

          <div className={styles.embla__dots}>
            <div className="row">
              {selectedIndex + 1} / {scrollSnaps.length}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Carousel
