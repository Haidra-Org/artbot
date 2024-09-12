import StylePresetSelectComponent from './stylePresetSelectComponent';
import { getPresetData } from '@/app/_api/presets';

export default async function StylePresetSelect() {
  const data = await getPresetData();

  return (
    <StylePresetSelectComponent
      hasError={data.success === false}
      categories={data.categories}
      presets={data.presets}
      previews={data.previews}
    />
  );
}
