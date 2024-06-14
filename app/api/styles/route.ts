import styleTags from './styleTags.json'

export async function GET() {
  return Response.json({ data: styleTags })
}
