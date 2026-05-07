import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const pathname = request.nextUrl.pathname
  const publicPaths = new Set(['/signup', '/auth/callback'])
  const isPublicPath = publicPaths.has(pathname)

  // Refresh the auth token and require a logged-in user for protected routes.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && !isPublicPath) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/signup'
    redirectUrl.search = ''
    return NextResponse.redirect(redirectUrl)
  }

  // Require a registered profile for protected routes.
  const allowsMissingProfile = pathname === '/setup-profile'

  if (user && !isPublicPath && !allowsMissingProfile) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (error || !profile) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/signup'
      redirectUrl.search = ''
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}
