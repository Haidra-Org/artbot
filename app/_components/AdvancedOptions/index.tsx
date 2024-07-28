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
import AddWorkflow from './AddWorkflow'
import HiresFix from './HiresFix'

export default function AdvancedOptions() {
  return (
    <div className="grid gap-4">
      <Section anchor="style-preset">
        <StylePresetSelect />
      </Section>
      <Section anchor="model-select">
        <ModelSelect />
        <SamplerSelect />
      </Section>
      <Section anchor="image-orientation">
        <ImageOrientation />
        <ImageCount />
      </Section>
      <Section anchor="steps">
        <Steps />
        <Guidance />
        <ClipSkip />
      </Section>
      <AddLora />
      <AddEmbedding />
      <Section anchor="hires">
        <HiresFix />
      </Section>
      <AddWorkflow />
      <Section anchor="face-fixers">
        <FaceFixers />
      </Section>
      <Section anchor="upscalers">
        <Upscalers />
      </Section>
      <Section anchor="seed">
        <Seed />
      </Section>
      <AdditionalOptions />
      <HordeSettings />
      <ImageProcessing />
      <UploadImage />
    </div>
  )
}
