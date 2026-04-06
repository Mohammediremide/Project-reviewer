import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
  const sessionEmail = (session.user.email || "").toLowerCase()
  const isAllowlistedAdmin = adminEmails.includes(sessionEmail)

  if (currentUser?.role !== "admin") {
    if (isAllowlistedAdmin) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { role: "admin" }
      })
    } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  const [users, projects, totalUsers, totalProjects] = await Promise.all([
    prisma.user.findMany({
      include: {
        accounts: { select: { provider: true } },
        projects: { select: { score: true, createdAt: true } },
        _count: { select: { projects: true } }
      },
      orderBy: { id: 'desc' }
    }),
    prisma.project.findMany({
      include: {
        user: { select: { name: true, email: true, image: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    }),
    prisma.user.count(),
    prisma.project.count()
  ])

  const allScores = projects.filter(p => p.score !== null).map(p => p.score as number)
  const avgScore = allScores.length > 0
    ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(2)
    : "0.00"

  const oauthUsers = users.filter(u => u.accounts.length > 0).length
  const passwordUsers = users.filter(u => u.accounts.length === 0).length
  const githubUsers = users.filter(u => u.accounts.some(a => a.provider === 'github')).length
  const googleUsers = users.filter(u => u.accounts.some(a => a.provider === 'google')).length

  // New users in last 7 days (by project createdAt proxy since we don't store user createdAt)
  const topUser = [...users].sort((a, b) => b._count.projects - a._count.projects)[0]

  return NextResponse.json({
    stats: {
      totalUsers,
      totalProjects,
      avgScore,
      oauthUsers,
      passwordUsers,
      githubUsers,
      googleUsers,
      topUser: topUser ? { name: topUser.name, email: topUser.email, count: topUser._count.projects } : null
    },
    users: users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      role: u.role,
      isTwoFactorEnabled: u.isTwoFactorEnabled,
      providers: u.accounts.map(a => a.provider),
      projectCount: u._count.projects,
      avgScore: u.projects.length > 0
        ? (u.projects.reduce((a, p) => a + (p.score || 0), 0) / u.projects.length).toFixed(1)
        : null,
      latestProject: u.projects[0]?.createdAt ?? null,
    })),
    recentProjects: projects.map(p => ({
      id: p.id,
      name: p.name,
      score: p.score,
      repoUrl: p.repoUrl,
      deployedUrl: p.deployedUrl,
      createdAt: p.createdAt,
      user: p.user
    }))
  })
}
