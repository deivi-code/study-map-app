import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const event = await request.json()

    if (event.type === "email.received") {
      return NextResponse.json(event)
    }

    return NextResponse.json({})
  } catch {
    return NextResponse.json({}, { status: 400 })
  }
}
