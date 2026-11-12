declare const __PUBLIC_IMAGE_PATHS__: string[]

// Known local assets avoid requesting missing photos. Restart Vite after adding a new photo.
export function hasImage(src?: string): src is string {
  return !!src && (__PUBLIC_IMAGE_PATHS__.includes(src) || /^https:\/\//i.test(src))
}
