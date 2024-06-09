import Section from '../Section'
import ImageCount from './ImageCount'
import ModelSelect from './ModelSelect'
import SamplerSelect from './SamplerSelect'

export default function AdvancedOptions() {
  return (
    <div className="grid gap-4">
      <Section>
        <ModelSelect />
        <SamplerSelect />
      </Section>
      <Section>
        <ImageCount />
      </Section>
    </div>
  )
}
