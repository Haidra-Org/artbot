/* eslint-disable @next/next/no-img-element */
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
export interface ImageWithSrc {
  src: string
}

type PropType = {
  controls?: 'top' | 'bottom'
  slides: ImageFileInterface[] | ImageWithSrc[]
  options?: EmblaOptionsType
}

const Carousel: React.FC<PropType> = (props) => {
  const { controls = 'bottom', slides, options } = props
  const [emblaRef, emblaApi] = useEmblaCarousel(options)

  const { selectedIndex, scrollSnaps } = useDotButton(emblaApi)

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  } = usePrevNextButtons(emblaApi)

  function isImageWithSrc(
    image: ImageWithSrc | ImageFileInterface
  ): image is ImageWithSrc {
    return (image as ImageWithSrc).src !== undefined
  }

  function renderControls() {
    return (
      <>
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
      </>
    )
  }

  return (
    <section className={styles.embla}>
      {slides.length > 1 && controls === 'top' && renderControls()}
      <div className={styles.embla__viewport} ref={emblaRef}>
        <div className={styles.embla__container}>
          {slides.map((image, index) => (
            <div className={styles.embla__slide} key={index}>
              <div>
                {isImageWithSrc(image) ? (
                  <img src={image.src} alt="Carousel Slide" />
                ) : (
                  <CarouselImage imageBlob={image.imageBlob as Blob} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {slides.length > 1 && controls === 'bottom' && renderControls()}
    </section>
  )
}

export default Carousel
