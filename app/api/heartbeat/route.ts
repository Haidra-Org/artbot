export async function GET() {
  let buildId = '42'

  try {
    const buildIdJson = await import('../../../buildId.json')
    buildId = buildIdJson.buildId || buildId
  } catch (error) {
    // We'll use the default fallback value
  }

  return Response.json({
    success: true,
    buildId: buildId
  })
}
