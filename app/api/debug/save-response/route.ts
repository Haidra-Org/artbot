import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

export async function POST(request: NextRequest) {
  const { id, data, route } = await request.json()
  const now = new Date()
  const timestamp = now.toISOString().replace(/[:T]/g, '-').split('.')[0]
  const prettyDate = now.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })
  const filename = `${timestamp}.txt`

  // Use the home directory and append the desired path, including the id
  const baseLogDir = path.join(os.homedir(), 'projects', 'logs')
  const idLogDir = path.join(baseLogDir, id)
  const filePath = path.join(idLogDir, filename)

  const fileContent = `${prettyDate}
${route}
${id}

${JSON.stringify(data, null, 2)}
`

  try {
    // Ensure the base directory and id-specific directory exist
    await fs.mkdir(baseLogDir, { recursive: true })
    await fs.mkdir(idLogDir, { recursive: true })

    // Write the file
    await fs.writeFile(filePath, fileContent)

    return NextResponse.json(
      { message: 'Response saved successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error saving response:', error)
    return NextResponse.json(
      { error: 'Failed to save response' },
      { status: 500 }
    )
  }
}
