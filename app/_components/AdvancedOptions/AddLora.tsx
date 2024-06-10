'use client'

import { IconHeartSearch, IconHistory, IconPlus } from '@tabler/icons-react'
import Button from '../Button'
import Section from '../Section'
import NiceModal from '@ebay/nice-modal-react'
import LoraSearch from './LoraSearch'

export default function AddLora() {
  return (
    <Section>
      <div className="row justify-between">
        <h2 className="row font-bold">
          LoRAs <span className="text-xs font-normal">(0 / 5)</span>
        </h2>
        <div className="row gap-1">
          <Button
            onClick={() => {
              NiceModal.show('modal', {
                children: <LoraSearch />
              })
            }}
          >
            <IconPlus />
          </Button>
          <Button
            onClick={() => {
              NiceModal.show('modal', {
                children: <div>Favorite LoRAs - hello!</div>
              })
            }}
          >
            <IconHeartSearch />
          </Button>
          <Button
            onClick={() => {
              NiceModal.show('modal', {
                children: <div>Recently used LoRAs- hello!</div>
              })
            }}
          >
            <IconHistory />
          </Button>
        </div>
      </div>
    </Section>
  )
}
