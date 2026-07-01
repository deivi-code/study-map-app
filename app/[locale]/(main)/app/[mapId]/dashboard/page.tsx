import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { fetchMapData } from "@/lib/fetch-map-data"
import { MapContextWrapper } from "@/components/map-context-wrapper"
import { DashboardPageWrapper } from "@/components/dashboard-page-wrapper"

export default async function MapDashboardPage({
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
      <DashboardPageWrapper />
    </MapContextWrapper>
  )
}
