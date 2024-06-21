import Section from '../Section'
import AddEmbedding from './AddEmbedding'
import AddLora from './LoRAs/AddLora'
import AdditionalOptions from './AdditionalOptions'
import ClipSkip from './ClipSkip'
import FaceFixers from './FaceFixers'
import Guidance from './Guidance'
import HordeSettings from './HordeSettings'
import ImageCount from './ImageCount'
import ImageOrientation from './ImageOrientation'
import ImageProcessing from './ImageProcessing'
import ModelSelect from './ModelSelect'
import SamplerSelect from './SamplerSelect'
import Seed from './Seed'
import Steps from './Steps'
import UploadImage from './UploadImage'
import Upscalers from './Upscalers'
import StylePresetSelect from './StylePresetSelect'

export default function AdvancedOptions() {
  return (
    <div className="grid gap-4">
      <Section>
        <StylePresetSelect />
      </Section>
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
      <AddLora />
      <AddEmbedding />
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
      <ImageProcessing />
      <UploadImage />
    </div>
  )
}
