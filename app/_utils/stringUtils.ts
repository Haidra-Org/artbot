export function isUuid(str: string) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

interface PromptInput {
  positive: string
  negative?: string
  stylePresetPrompt: string
}

export const formatStylePresetPrompt = (input: PromptInput): string => {
  const { positive, negative, stylePresetPrompt } = input

  let finalPrompt = stylePresetPrompt.replace('{p}', positive)

  if (negative && negative.trim() !== '') {
    if (
      !stylePresetPrompt.includes('###') &&
      stylePresetPrompt.includes('{np}')
    ) {
      finalPrompt = finalPrompt.replace('{np}', `### ${negative}`)
    } else {
      finalPrompt = finalPrompt.replace('{np}', negative)
    }
  } else {
    finalPrompt = finalPrompt.replace('{np}', '')
  }

  return finalPrompt
}
