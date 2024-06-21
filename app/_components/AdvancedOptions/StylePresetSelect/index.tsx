import { CategoryPreset, StylePresetConfigurations } from '@/app/_types/HordeTypes'
import StylePresetSelectComponent from './stylePresetSelectComponent'

export async function getData(): Promise<{
  success: boolean
  categories: CategoryPreset
  presets: StylePresetConfigurations
}> {
  try {
    const categoriesRes = await fetch(
      'https://raw.githubusercontent.com/Haidra-Org/AI-Horde-Styles/main/categories.json'
    )
    const presetsRes = await fetch(
      'https://raw.githubusercontent.com/Haidra-Org/AI-Horde-Styles/main/styles.json'
    )

    const categories = (await categoriesRes.json()) || {}
    // @ts-expect-error TODO: Need to properly type this.
    const presets: never = (await presetsRes.json()) || {}

    return {
      success: true,
      categories,
      presets
    }
  } catch (err) {
    console.log(err)
    return {
      success: false,
      categories: {},
      presets: {}
    }
  }
}

export default async function StylePresetSelect() {
  const data = await getData()
  return (
    <StylePresetSelectComponent
      hasError={data.success === false}
      categories={data.categories}
      presets={data.presets}
    />
  )
}
