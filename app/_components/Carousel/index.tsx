import useEmblaCarousel from 'embla-carousel-react'
import { EmblaOptionsType } from 'embla-carousel'

import { useDotButton } from '@/app/_hooks/useCarouselDots'
import styles from './carousel.module.css'
import CarouselControls from './CarouselControls'
import { usePrevNextButtons } from './CarouselArrowButtons'

export default function CarouselV2({
  children,
  controls = 'bottom',
  numSlides,
  options = {}
}: {
  children: React.ReactNode
  controls?: 'top' | 'bottom'
  numSlides: number
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
