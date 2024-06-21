'use client'

import { useInput } from '@/app/_providers/PromptInputProvider'
import Select, { SelectOption } from '../Select'
import OptionLabel from './OptionLabel'

export type SamplerOption =
  | 'DDIM'
  | 'k_dpm_2_a'
  | 'k_dpm_2'
  | 'k_dpm_adaptive'
  | 'k_dpm_fast'
  | 'k_dpmpp_2m'
  | 'k_dpmpp_2s_a'
  | 'k_dpmpp_sde'
  | 'k_euler_a'
  | 'k_euler'
  | 'k_heun'
  | 'k_lms'
  | 'lcm'

const samplers: Array<{ value: SamplerOption; label: SamplerOption }> = [
  { value: 'DDIM', label: 'DDIM' },
  { value: 'k_dpm_2_a', label: 'k_dpm_2_a' },
  { value: 'k_dpm_2', label: 'k_dpm_2' },
  { value: 'k_dpm_adaptive', label: 'k_dpm_adaptive' },
  { value: 'k_dpm_fast', label: 'k_dpm_fast' },
  { value: 'k_dpmpp_2m', label: 'k_dpmpp_2m' },
  { value: 'k_dpmpp_2s_a', label: 'k_dpmpp_2s_a' },
  { value: 'k_dpmpp_sde', label: 'k_dpmpp_sde' },
  { value: 'k_euler_a', label: 'k_euler_a' },
  { value: 'k_euler', label: 'k_euler' },
  { value: 'k_heun', label: 'k_heun' },
  { value: 'k_lms', label: 'k_lms' },
  { value: 'lcm', label: 'lcm' }
]

export default function SamplerSelect() {
  const { input, setInput } = useInput()

  return (
    <OptionLabel
      anchor="sampler"
      title={
        <span className="row font-bold text-sm text-white gap-1">Sampler</span>
      }
    >
      <div className="w-full">
        <Select
          onChange={(option: SelectOption) => {
            setInput({ sampler: option.value as string })
          }}
          options={samplers.map((sampler) => ({
            value: sampler.value,
            label: sampler.label
          }))}
          value={{
            value: input.sampler,
            label: input.sampler
          }}
        />
      </div>
    </OptionLabel>
  )
}
