/** Accept only configured Google Maps links, never arbitrary external actions. */
export function isValidMapsUrl(value?: string): boolean {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password && (
      (['www.google.com', 'google.com', 'maps.google.com'].includes(url.hostname)
        && (url.pathname === '/maps' || url.pathname.startsWith('/maps/')))
      || (url.hostname === 'maps.app.goo.gl' && url.pathname.length > 1)
      || (url.hostname === 'goo.gl' && url.pathname.startsWith('/maps/'))
    )
  } catch { return false }
}
