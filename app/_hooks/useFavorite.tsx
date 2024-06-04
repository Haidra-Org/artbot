import { useEffect, useState } from 'react'
import {
  getFavoriteFromDexie,
  updateFavoriteInDexie
} from '@/app/_db/favorites'

export default function useFavorite(
  artbot_id: string,
  image_id: string
): [boolean, () => void] {
  const [isFavorite, setIsFavorite] = useState(false)

  const toggleFavorite = async () => {
    if (!isFavorite) {
      await updateFavoriteInDexie(artbot_id, image_id, true)
    } else {
      await updateFavoriteInDexie(artbot_id, image_id, false)
    }

    setIsFavorite(!isFavorite)
  }

  useEffect(() => {
    const getFavorite = async () => {
      const status = ((await getFavoriteFromDexie(image_id)) || {}) as {
        favorited: boolean
      }
      if ('favorited' in status) {
        setIsFavorite(status.favorited)
      }
    }

    getFavorite()
  }, [image_id])

  return [isFavorite, toggleFavorite]
}
