import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
  return user?.role === "admin" ? session : null
}

type RouteParams = { id?: string | string[] }

function getIdFromParams(params?: RouteParams) {
  const raw = params?.id
  return Array.isArray(raw) ? raw[0] : raw
}

export async function DELETE(req: Request, { params }: { params?: RouteParams }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const id = getIdFromParams(params)
  if (!id) return NextResponse.json({ error: "Missing user id" }, { status: 400 })

  if (id === session.user.id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 })
  }

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

export async function PATCH(req: Request, { params }: { params?: RouteParams }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const id = getIdFromParams(params)
  if (!id) return NextResponse.json({ error: "Missing user id" }, { status: 400 })

  const body = await req.json()
  const { role } = body

  if (!["user", "admin"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  const updated = await prisma.user.update({ where: { id }, data: { role } })
  return NextResponse.json({ success: true, role: updated.role })
}
