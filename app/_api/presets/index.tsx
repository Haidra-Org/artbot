// utils/fetchPresetData.ts
import {
  CategoryPreset,
  StylePresetConfigurations,
  StylePreviewConfigurations
} from '@/app/_types/HordeTypes';

export async function getPresetData(): Promise<{
  success: boolean;
  categories: CategoryPreset;
  presets: StylePresetConfigurations;
  previews: StylePreviewConfigurations;
}> {
  try {
    const urls = [
      'https://raw.githubusercontent.com/Haidra-Org/AI-Horde-Styles/main/categories.json',
      'https://raw.githubusercontent.com/Haidra-Org/AI-Horde-Styles/main/styles.json',
      'https://raw.githubusercontent.com/amiantos/AI-Horde-Styles-Previews/main/previews.json'
    ];

    const [categoriesRes, presetsRes, previewsRes] = await Promise.allSettled(
      urls.map((url) => fetch(url))
    );

    const categories =
      categoriesRes.status === 'fulfilled'
        ? await categoriesRes.value.json()
        : {};
    const presets: StylePresetConfigurations =
      presetsRes.status === 'fulfilled' ? await presetsRes.value.json() : {};
    const previews: StylePreviewConfigurations =
      previewsRes.status === 'fulfilled' ? await previewsRes.value.json() : {};

    // Filter categories to include only those keys that exist in presets
    const filteredCategories = Object.keys(categories).reduce((acc, key) => {
      acc[key] = categories[key].filter(
        (category: string) => category in presets
      );
      return acc;
    }, {} as CategoryPreset);

    return {
      success: true,
      categories: filteredCategories,
      presets,
      previews
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      categories: {},
      presets: {},
      previews: {}
    };
  }
}
