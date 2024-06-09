import Section from '../Section'
import ClipSkip from './ClipSkip'
import FaceFixers from './FaceFixers'
import Guidance from './Guidance'
import ImageCount from './ImageCount'
import ImageOrientation from './ImageOrientation'
import ModelSelect from './ModelSelect'
import SamplerSelect from './SamplerSelect'
import Steps from './Steps'

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
    </div>
  )
}
