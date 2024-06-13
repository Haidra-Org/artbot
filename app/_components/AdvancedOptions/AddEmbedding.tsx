'use client'

import { IconHeartSearch, IconHistory, IconPlus } from '@tabler/icons-react'
import Button from '../Button'
import Section from '../Section'
import NiceModal from '@ebay/nice-modal-react'

export default function AddEmbedding() {
  return (
    <Section>
      <div className="row justify-between">
        <h2 className="row font-bold text-white">Embeddings</h2>
        <div className="row gap-1">
          <Button
            onClick={() => {
              NiceModal.show('modal', {
                children: <div>Add TI - hello!</div>
              })
            }}
          >
            <IconPlus />
          </Button>
          <Button
            onClick={() => {
              NiceModal.show('modal', {
                children: <div>Favorite TIs - hello!</div>
              })
            }}
          >
            <IconHeartSearch />
          </Button>
          <Button
            onClick={() => {
              NiceModal.show('modal', {
                children: <div>Recently used TIs- hello!</div>
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
