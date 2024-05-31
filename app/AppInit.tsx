'use client'

/**
 * This component is used to initialize various
 * functions when the web app first loads.
 */

import { useEffect } from 'react'

export default function AppInit() {
  useEffect(() => {
    console.log('ArtBot v2.0.0_beta')
  }, [])

  return null
}
