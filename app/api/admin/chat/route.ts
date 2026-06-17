import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function checkAdmin(session: any) {
  if (session?.user?.role === "admin") return true;
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
  return adminEmails.includes(session?.user?.email?.toLowerCase() || "");
}

export async function GET(req: Request) {
  const session = await auth()
  const isAdmin = await checkAdmin(session);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (userId) {
    const messages = await prisma.message.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json(messages)
  } else {
    const users = await prisma.user.findMany({
      where: {
        messages: {
          some: {}
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })
    return NextResponse.json(users)
  }
}

export async function POST(req: Request) {
  const session = await auth()
  const isAdmin = await checkAdmin(session);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { content, userId } = await req.json()
  if (!content || !userId) {
    return NextResponse.json({ error: 'Message content and userId are required' }, { status: 400 })
  }

  const message = await prisma.message.create({
    data: {
      content,
      userId,
      isAdmin: true
    }
  })

  return NextResponse.json(message)
}
