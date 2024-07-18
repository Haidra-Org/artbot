import { PendingImagesStore } from '@/app/_stores/PendingImagesStore'
import { ImageError, JobStatus } from '@/app/_types/ArtbotTypes'
import { formatPendingPercentage } from '@/app/_utils/numberUtils'
import { useStore } from 'statery'
import Section from '../Section'
import { formatJobStatus } from '@/app/_utils/hordeUtils'

const countErrorMessages = (
  errors: ImageError[]
): { message: string; count: number }[] => {
  const errorCountMap: { [key: string]: number } = errors.reduce(
    (acc: { [key: string]: number }, error: ImageError) => {
      if (acc[error.message]) {
        acc[error.message] += 1
      } else {
        acc[error.message] = 1
      }
      return acc
    },
    {}
  )

  return Object.entries(errorCountMap).map(([message, count]) => ({
    message,
    count
  }))
}

export default function PendingImageViewStatus({
  artbot_id
}: {
  artbot_id: string
}) {
  const { pendingImages } = useStore(PendingImagesStore)

  const pendingImage = pendingImages.find(
    (image) => image.artbot_id === artbot_id
  )

  const imageError =
    pendingImage?.status === JobStatus.Error ||
    pendingImage?.images_failed === pendingImage?.images_requested

  const JobErrorsComponent = (errors: ImageError[] = []) => {
    const countedErrors = countErrorMessages(errors)

    return (
      <div className="mt-2">
        <strong>Errors:</strong>{' '}
        {countedErrors.length > 0 && (
          <div>
            {countedErrors.map(({ message, count }, idx) => (
              <div key={idx} className={`image_error_${idx} text-xs`}>
                ({count} {count === 1 ? 'image' : 'images'}) {message}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const pctComplete = formatPendingPercentage({
    init: pendingImage?.init_wait_time as number,
    remaining: pendingImage?.wait_time as number
  })

  return (
    <Section className="p-0 w-full">
      <div className="text-white font-mono p-0 w-full text-[14px] col gap-0">
        <div>
          <strong>Job status:</strong>{' '}
          {imageError
            ? 'AI Horde Error'
            : formatJobStatus(pendingImage?.status as JobStatus)}
        </div>
        {pendingImage &&
          pendingImage?.queue_position !== null &&
          pendingImage?.queue_position > 0 && (
            <div>
              <strong>Queue position:</strong> {pendingImage?.queue_position}
            </div>
          )}
        {pendingImage?.status !== JobStatus.Done &&
          pendingImage?.status !== JobStatus.Error && (
            <div>
              <strong>Wait time:</strong> {pendingImage?.wait_time} seconds{' '}
              {pctComplete ? <span>({pctComplete}% complete)</span> : ''}
            </div>
          )}
        <div>
          <strong>Images requested:</strong> {pendingImage?.images_requested}
        </div>
        {pendingImage?.images_completed ? (
          <div>
            <strong>Images completed:</strong> {pendingImage?.images_completed}
          </div>
        ) : (
          ''
        )}
        {pendingImage?.images_failed ? (
          <div>
            <strong>Images failed to complete:</strong>{' '}
            {pendingImage?.images_failed}
          </div>
        ) : (
          ''
        )}
        {pendingImage?.errors &&
          pendingImage?.errors.length > 0 &&
          JobErrorsComponent(pendingImage?.errors)}
      </div>
    </Section>
  )
}
