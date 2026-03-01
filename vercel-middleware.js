// Vercel Edge Middleware for better crawler support
// Place this in the root or vercel folder

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Log crawler user agents for debugging
  const userAgent = request.headers.get('user-agent') || '';
  const isCrawler = /bot|crawler|spider|semrush|ahrefs|screaming frog/i.test(userAgent);
  
  if (isCrawler) {
    // Add headers for crawlers to ensure they get full page content
    const response = request.headers;
    response.set('X-Robots-Tag', 'index, follow');
    response.set('Accept-CH', 'DPR, Viewport-Width, Width');
  }
  
  return request;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
