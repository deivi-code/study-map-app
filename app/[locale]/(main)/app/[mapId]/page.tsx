import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { fetchMapData } from "@/lib/fetch-map-data"
import { MapContextWrapper } from "@/components/map-context-wrapper"
import { SkillTreePageWrapper } from "@/components/skill-tree-page-wrapper"

export default async function MapPage({
  params,
}: {
  params: Promise<{ mapId: string }>
}) {
  const { mapId } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user?.id

  let mapData = null
  if (userId) {
    mapData = await fetchMapData(mapId, userId)
  }

  return (
    <MapContextWrapper mapData={mapData}>
      <SkillTreePageWrapper />
    </MapContextWrapper>
  )
}
