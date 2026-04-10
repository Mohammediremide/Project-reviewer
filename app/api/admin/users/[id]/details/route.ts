import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Ensure requester is an admin
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, email: true }
  })

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
  const isAllowlistedAdmin = adminEmails.includes((currentUser?.email || "").toLowerCase())

  if (currentUser?.role !== "admin" && !isAllowlistedAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }


  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: {
          select: {
            provider: true,
          }
        },
        projects: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { projects: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate specific stats for this user
    const confirmedScores = user.projects.filter(p => p.score !== null).map(p => p.score as number)
    const avgScore = confirmedScores.length > 0
      ? (confirmedScores.reduce((a, b) => a + b, 0) / confirmedScores.length).toFixed(1)
      : null

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        providers: user.accounts.map(a => a.provider),
        createdAt: user.id, // Proxy for createdAt if not available
        projectCount: user._count.projects,
        avgScore,
      },
      projects: user.projects
    })
  } catch (error) {
    console.error("ADMIN_USER_DETAILS_ERROR:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
