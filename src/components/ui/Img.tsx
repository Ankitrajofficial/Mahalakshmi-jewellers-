import NextImage, { type ImageProps } from 'next/image'

/**
 * next/image with one rule applied everywhere.
 *
 * The catalogue plates are SVG. Next's optimizer cannot resize or re-encode a
 * vector, so routing them through /_next/image buys nothing and costs a server
 * round-trip on the critical path — measurably, it was the largest contentful
 * paint on every page. SVGs are therefore marked `unoptimized` and served
 * straight from /public with immutable cache headers.
 *
 * Everything else takes the normal optimized path, so the moment real
 * photography (JPEG, PNG, WebP, or a CDN URL) replaces a plate, that image is
 * resized and re-encoded to AVIF/WebP as usual. No call site has to change.
 */
export function Img({ src, unoptimized, ...rest }: ImageProps) {
  const isVector = typeof src === 'string' && src.toLowerCase().endsWith('.svg')
  return <NextImage src={src} unoptimized={unoptimized ?? isVector} {...rest} />
}
