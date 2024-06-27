'use client'

import Button from '@/app/_components/Button'
import PageTitle from '@/app/_components/PageTitle'
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
      <div className="col w-full">
        {Object.keys(modelDetails).map((key) => (
          <div
            key={key}
            className="col text-white p-2 flex gap-2 rounded-md bg-[#c1c1c1] dark:bg-zinc-700"
          >
            <h3 className="row font-bold text-white gap-1">{key}</h3>
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
          </div>
        ))}
      </div>
    </div>
  )
}
