import Section from '../Section'
import AdditionalOptions from './AdditionalOptions'
import ClipSkip from './ClipSkip'
import FaceFixers from './FaceFixers'
import Guidance from './Guidance'
import HordeSettings from './HordeSettings'
import ImageCount from './ImageCount'
import ImageOrientation from './ImageOrientation'
import ModelSelect from './ModelSelect'
import SamplerSelect from './SamplerSelect'
import Seed from './Seed'
import Steps from './Steps'
import Upscalers from './Upscalers'

export default function AdvancedOptions() {
  return (
    <div className="grid gap-4">
      <Section>
        <ModelSelect />
        <SamplerSelect />
      </Section>
      <Section>
        <ImageOrientation />
        <ImageCount />
      </Section>
      <Section>
        <Steps />
        <Guidance />
        <ClipSkip />
      </Section>
      <Section>
        <FaceFixers />
      </Section>
      <Section>
        <Upscalers />
      </Section>
      <Section>
        <Seed />
      </Section>
      <AdditionalOptions />
      <HordeSettings />
    </div>
  )
}
