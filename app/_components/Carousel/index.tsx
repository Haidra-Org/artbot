import useEmblaCarousel from 'embla-carousel-react'
import { EmblaOptionsType } from 'embla-carousel'

import { useDotButton } from '@/app/_hooks/useCarouselDots'
import styles from './carousel.module.css'
import CarouselControls from './CarouselControls'
import { usePrevNextButtons } from './CarouselArrowButtons'
import { useCallback, useEffect } from 'react'

export default function Carousel({
  children,
  controls = 'bottom',
  numSlides,
  onSlideChange = () => {},
  options = {}
}: {
  children: React.ReactNode
  controls?: 'top' | 'bottom'
  numSlides: number
  onSlideChange?: (index: number) => void
  options?: EmblaOptionsType
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    ...options,
    watchDrag: numSlides > 1
  })
  const { selectedIndex, scrollSnaps } = useDotButton(emblaApi)

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  } = usePrevNextButtons(emblaApi)

  const emitSlidePosition = useCallback(() => {
    onSlideChange(emblaApi?.selectedScrollSnap() || 0)
  }, [emblaApi, onSlideChange])

  useEffect(() => {
    emblaApi?.on('select', emitSlidePosition)

    return () => {
      emblaApi?.off('select', emitSlidePosition)
    }
  }, [emblaApi, emitSlidePosition])

  return (
    <section className={styles.embla}>
      {numSlides > 1 && controls === 'top' && (
        <CarouselControls
          selectedIndex={selectedIndex}
          scrollSnaps={scrollSnaps}
          prevBtnDisabled={prevBtnDisabled}
          nextBtnDisabled={nextBtnDisabled}
          onPrevButtonClick={onPrevButtonClick}
          onNextButtonClick={onNextButtonClick}
        />
      )}
      <div className={styles.embla__viewport} ref={emblaRef}>
        <div className={styles.embla__container}>{children}</div>
      </div>
      {numSlides > 1 && controls === 'bottom' && (
        <CarouselControls
          selectedIndex={selectedIndex}
          scrollSnaps={scrollSnaps}
          prevBtnDisabled={prevBtnDisabled}
          nextBtnDisabled={nextBtnDisabled}
          onPrevButtonClick={onPrevButtonClick}
          onNextButtonClick={onNextButtonClick}
        />
      )}
    </section>
  )
}
