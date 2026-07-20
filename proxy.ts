import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  if (!url.searchParams.has('statusToken')) return NextResponse.next();

  url.searchParams.delete('statusToken');
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/post-local/:path*'],
};
