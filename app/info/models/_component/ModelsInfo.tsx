/* eslint-disable @next/next/no-img-element */
'use client'
import { IconCube, IconExternalLink, IconHeart } from '@tabler/icons-react'
import Link from 'next/link'

import Button from '@/app/_components/Button'
import Section from '@/app/_components/Section'
import { AvailableImageModel, ImageModelDetails } from '@/app/_types/HordeTypes'
import { formatSeconds } from '@/app/_utils/numberUtils'

export default function ModelsInfo({
  modelsAvailable,
  modelDetails
}: {
  modelsAvailable: AvailableImageModel[]
  modelDetails: { [key: string]: ImageModelDetails }
}) {
  const availableModelsMap = modelsAvailable.reduce(
    (acc, item) => {
      acc[item.name] = item
      return acc
    },
    {} as { [key: string]: AvailableImageModel }

    // TODO: Handle sort
  )
  console.log(`availableModelsMap`, availableModelsMap)
  console.log(`modelDetails`, modelDetails)

  const getQueueTime = (s: number) => {
    if (s === 0) {
      return 'N/A'
    }

    if (s === 10000) {
      return 'N/A'
    }

    return `~ ${formatSeconds(s)}`
  }

  return (
    <div className="col">
      <div className="col w-full gap-4">
        {Object.keys(modelDetails).map((key) => (
          <Section key={key} anchor={key} className="text-white">
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
              <div className="row gap-1 bg-gray-600 px-2 h-[36px] rounded-md text-sm">
                <IconCube /> {modelDetails[key].baseline}
              </div>
              <div>Version: {modelDetails[key].version}</div>
            </div>
            <div className="row w-full items-start gap-4">
              <div
                style={{
                  backgroundColor: 'gray',
                  borderRadius: '8px',
                  height: '400px',
                  width: '400px'
                }}
              >
                {modelDetails[key]?.showcases &&
                  modelDetails[key]?.showcases[0] && (
                    <img
                      src={modelDetails[key].showcases[0]}
                      className="w-full h-full object-cover rounded-md"
                      alt="Model showcase"
                    />
                  )}
              </div>
              <div
                className="col justify-between h-full"
                style={{
                  minHeight: '400px',
                  width: `calc(100% - 400px)`
                }}
              >
                <div className="col">
                  {modelDetails[key].description}
                  <div className="col gap-0 text-sm">
                    <div>
                      <strong>NSFW:</strong>{' '}
                      {modelDetails[key].nsfw ? 'true' : 'false'}
                    </div>
                    <div>
                      <strong>Style:</strong> {modelDetails[key].style}
                    </div>
                  </div>
                  {modelDetails[key].homepage && (
                    <div>
                      <Link
                        href={modelDetails[key].homepage}
                        target="_blank"
                        className="text-[#1E293B] underline"
                      >
                        <div className="row gap-1 text-sm font-mono">
                          View homepage <IconExternalLink size={18} />
                        </div>
                      </Link>
                    </div>
                  )}
                  <div className="bg-[#1E293B] text-white font-mono p-2 w-full text-[14px] col gap-0">
                    <strong>AI Horde Availability</strong>
                    <div className="mt-2">
                      <strong>GPU workers:</strong>{' '}
                      {availableModelsMap[key].count}
                    </div>
                    <div>
                      <strong>Queued jobs:</strong>{' '}
                      {availableModelsMap[key].jobs}
                    </div>
                    <div className="mt-2">
                      <strong>Queued work:</strong>{' '}
                      {availableModelsMap[key].queued.toLocaleString()}{' '}
                      megapixel-steps
                    </div>
                    <div>
                      <strong>Performance:</strong>{' '}
                      {availableModelsMap[key].performance.toLocaleString()}{' '}
                      megapixel-steps / minute
                    </div>

                    <div className="mt-2">
                      <strong>Wait time:</strong>{' '}
                      {getQueueTime(availableModelsMap[key].eta)}
                    </div>
                  </div>
                </div>
                <div className="row justify-end">
                  <Button
                    onClick={() => {
                      // handleOnUseModel(key)
                    }}
                  >
                    Use Model
                  </Button>
                </div>
              </div>
            </div>
          </Section>
        ))}
      </div>
    </div>
  )
}
