'use client'

import Button from '@/app/_components/Button'
import PageTitle from '@/app/_components/PageTitle'
import Section from '@/app/_components/Section'
import { ModelStore } from '@/app/_stores/ModelStore'
import { AvailableImageModel } from '@/app/_types/HordeTypes'
import { IconCube, IconExternalLink, IconHeart } from '@tabler/icons-react'
import Link from 'next/link'
import { useStore } from 'statery'

export default function ModelsPage() {
  const { availableModels, modelDetails } = useStore(ModelStore)
  const availableModelsMap = availableModels.reduce(
    (acc, item) => {
      acc[item.name] = item
      return acc
    },
    {} as { [key: string]: AvailableImageModel }

    // TODO: Handle sort
  )
  console.log(`availableModelsMap`, availableModelsMap)
  console.log(`modelDetails`, modelDetails)

  return (
    <div className="col">
      <PageTitle>Model Details</PageTitle>
      <div className="col w-full gap-4">
        {Object.keys(modelDetails).map((key) => (
          <Section key={key} anchor={key}>
            <h2 className="row font-bold text-white gap-1 text-lg">{key}</h2>
            <div className="row w-full gap-2">
              <Button
                style={{
                  height: '36px',
                  width: '36px'
                }}
              >
                <IconHeart />
              </Button>
              <div className="row gap-1 bg-gray-600 px-2 h-[36px] rounded-md">
                <IconCube /> {modelDetails[key].baseline}
              </div>
              <div>Version: {modelDetails[key].version}</div>
            </div>
            {modelDetails[key].homepage && (
              <div>
                <Link
                  href={modelDetails[key].homepage}
                  target="_blank"
                  className="primary-color"
                >
                  <div className="row gap-1">
                    Homepage <IconExternalLink />
                  </div>
                </Link>
              </div>
            )}
            <div className="row w-full items-start gap-4">
              <div
                style={{
                  backgroundColor: 'gray',
                  borderRadius: '8px',
                  height: '400px',
                  width: '400px'
                }}
              ></div>
              <div className="w-full">{modelDetails[key].description}</div>
            </div>
          </Section>
        ))}
      </div>
    </div>
  )
}
