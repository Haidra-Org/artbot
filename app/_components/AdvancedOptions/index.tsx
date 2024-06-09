import Section from '../Section'
import ModelSelect from './ModelSelect'
import SamplerSelect from './SamplerSelect'

export default function AdvancedOptions() {
  return (
    <div className="grid gap-4">
      <Section>
        <ModelSelect />
        <SamplerSelect />
      </Section>
    </div>
  )
}
