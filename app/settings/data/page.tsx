'use client'
import PageTitle from '@/app/_components/PageTitle'
import Section from '@/app/_components/Section'
import Button from '@/app/_components/Button'
import { exportImageEnhancementModules } from '@/app/_db/imageEnhancementModules'
import { db } from '@/app/_db/dexie'
import { useState, useRef } from 'react'
import { ImageEnhancementModulesTable } from '@/app/_types/ArtbotTypes'
import { Embedding, ModelVersion } from '@/app/_data-models/Civitai'

export default function ImportExportDataPage() {
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const fileContent = await file.text()
      const jsonData = JSON.parse(fileContent) as ImageEnhancementModulesTable[]

      await db.transaction('rw', db.imageEnhancementModules, async () => {
        for (const item of jsonData) {
          // Reconstruct Embedding and ModelVersion objects
          const modelVersions = item.model.modelVersions.map(
            (mv) => new ModelVersion(mv)
          )
          const embedding = new Embedding({
            ...item.model,
            modelVersions
          })

          await db.imageEnhancementModules.add({
            model_id: item.model_id,
            timestamp: item.timestamp,
            modifier: item.modifier,
            type: item.type,
            model: embedding
          })
        }
      })
    } catch (error) {
      console.error('Error importing data:', error)
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="col gap-2">
      <PageTitle>Data Import / Export</PageTitle>
      <Section title="LoRA Export">
        Export LoRA / Embedding data to JSON.
        <Button
          disabled={loading}
          onClick={async () => {
            if (loading) return
            setLoading(true)
            await exportImageEnhancementModules()
            setLoading(false)
          }}
        >
          {loading ? 'Exporting...' : 'Export'}
        </Button>
      </Section>
      <Section title="LoRA Import">
        Import LoRA / Embedding data from JSON.
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          disabled={loading}
          ref={fileInputRef}
        />
        <Button
          disabled={loading}
          onClick={() => fileInputRef.current?.click()}
        >
          {loading ? 'Importing...' : 'Import'}
        </Button>
      </Section>
    </div>
  )
}
