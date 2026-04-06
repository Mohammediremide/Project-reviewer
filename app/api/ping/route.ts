import { NextResponse } from 'next/server';

export async function GET() {
  // Add cache control headers to prevent caching the ping response
  return new NextResponse('ok', {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
