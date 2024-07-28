'use client'
import { useInput } from '../../_providers/PromptInputProvider'
import Section from '../Section'
import Switch from '../Switch'

export default function AdditionalOptions() {
  const { input, setInput } = useInput()

  return (
    <Section title="Additional options" anchor="additional-options">
      <label className="row gap-2 text-white">
        <Switch
          checked={input.post_processing.includes('strip_background')}
          onChange={() => {
            if (input.post_processing.includes('strip_background')) {
              setInput({
                post_processing: input.post_processing.filter(
                  (value) => value !== 'strip_background'
                )
              })
            } else {
              setInput({
                post_processing: [...input.post_processing, 'strip_background']
              })
            }
          }}
        />
        Strip background
      </label>
      <label className="row gap-2 text-white">
        <Switch
          checked={input.karras}
          onChange={() => {
            setInput({ karras: !input.karras })
          }}
        />
        Karras
      </label>
      <label className="row gap-2 text-white">
        <Switch
          checked={input.tiling}
          onChange={() => {
            setInput({ tiling: !input.tiling })
          }}
        />
        Tiling
      </label>
      <label className="row gap-2 text-white">
        <Switch
          checked={input.transparent}
          onChange={() => {
            setInput({ transparent: !input.transparent })
          }}
        />
        Transparent background
      </label>
    </Section>
  )
}
