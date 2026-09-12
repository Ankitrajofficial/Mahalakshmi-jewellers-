/**
 * Builds the site's jewellery plates as self-contained SVG.
 *
 * Real photography is a client deliverable (Section 17). Until it lands, every
 * product ships with a deliberate, on-brand illustration rather than a grey box:
 * 1:1, cream seamless ground, gold gradient metal, ink detailing — the same
 * treatment across pack shot, lifestyle and scale-reference variants.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const OUT = join(process.cwd(), 'public', 'catalog')
mkdirSync(OUT, { recursive: true })

const P = {
  cream: '#FDFAF4',
  pale: '#F5E6C8',
  gold: '#B8860B',
  light: '#D4AF37',
  maroon: '#6B1F2E',
  ink: '#1A1512',
  muted: '#6E645C',
  white: '#FFFFFF',
}

const S = 1600
const C = S / 2

const defs = (tone) => `
<defs>
  <linearGradient id="metal" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1600" y2="1600">
    <stop offset="0%" stop-color="${tone.hi}"/>
    <stop offset="38%" stop-color="${tone.mid}"/>
    <stop offset="62%" stop-color="${tone.lo}"/>
    <stop offset="100%" stop-color="${tone.mid}"/>
  </linearGradient>
  <linearGradient id="metal2" gradientUnits="userSpaceOnUse" x1="1600" y1="0" x2="0" y2="1600">
    <stop offset="0%" stop-color="${tone.mid}"/>
    <stop offset="50%" stop-color="${tone.hi}"/>
    <stop offset="100%" stop-color="${tone.lo}"/>
  </linearGradient>
  <radialGradient id="stone" cx="35%" cy="30%">
    <stop offset="0%" stop-color="${tone.stoneHi}"/>
    <stop offset="55%" stop-color="${tone.stone}"/>
    <stop offset="100%" stop-color="${tone.stoneLo}"/>
  </radialGradient>
  <radialGradient id="ground" cx="50%" cy="46%">
    <stop offset="0%" stop-color="${P.white}"/>
    <stop offset="62%" stop-color="${P.cream}"/>
    <stop offset="100%" stop-color="${P.pale}"/>
  </radialGradient>
  <radialGradient id="shadow" cx="50%" cy="50%">
    <stop offset="0%" stop-color="${P.ink}" stop-opacity="0.10"/>
    <stop offset="100%" stop-color="${P.ink}" stop-opacity="0"/>
  </radialGradient>
</defs>`

const TONES = {
  yellow: { hi: '#F0D98A', mid: '#D4AF37', lo: '#8F6A08', stoneHi: '#FFFFFF', stone: '#E8EEF2', stoneLo: '#A9B7C2' },
  rose: { hi: '#F3D2C0', mid: '#D69A76', lo: '#96573A', stoneHi: '#FFFFFF', stone: '#F0D9D9', stoneLo: '#BE9090' },
  white: { hi: '#F4F2EC', mid: '#CFCBC0', lo: '#8B8579', stoneHi: '#FFFFFF', stone: '#E8EEF2', stoneLo: '#A9B7C2' },
  silver: { hi: '#F2F2F0', mid: '#C6C6C2', lo: '#82827D', stoneHi: '#FFFFFF', stone: '#EDEDEA', stoneLo: '#AFAFA9' },
  polki: { hi: '#F0D98A', mid: '#D4AF37', lo: '#8F6A08', stoneHi: '#FFFFFF', stone: '#F6F1E4', stoneLo: '#C8BC9C' },
  emerald: { hi: '#F0D98A', mid: '#D4AF37', lo: '#8F6A08', stoneHi: '#BFEAD2', stone: '#1F7A4C', stoneLo: '#0C3F27' },
  ruby: { hi: '#F0D98A', mid: '#D4AF37', lo: '#8F6A08', stoneHi: '#F3B8C2', stone: '#9B1B31', stoneLo: '#5A0C1B' },
}

const wrap = (tone, body, opts = {}) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}" role="img">
${defs(tone)}
<rect width="${S}" height="${S}" fill="url(#ground)"/>
${opts.vignette ? `<rect width="${S}" height="${S}" fill="${P.maroon}" opacity="0.05"/>` : ''}
<ellipse cx="${C}" cy="${S * 0.62}" rx="${S * 0.34}" ry="${S * 0.3}" fill="url(#shadow)"/>
${body}
${opts.frame ? `<rect x="52" y="52" width="${S - 104}" height="${S - 104}" fill="none" stroke="${P.gold}" stroke-opacity="0.28" stroke-width="3"/>` : ''}
</svg>`

const stroke = (w) => `fill="none" stroke="url(#metal)" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`

/** A faceted brilliant, drawn as a rosette so it reads as cut stone at any size. */
function gem(cx, cy, r) {
  const pts = []
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i - Math.PI / 8
    pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`)
  }
  const inner = []
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i - Math.PI / 8
    inner.push(`${(cx + Math.cos(a) * r * 0.5).toFixed(1)},${(cy + Math.sin(a) * r * 0.5).toFixed(1)}`)
  }
  // One path with eight subpaths rather than eight <line> elements: the same
  // rosette at roughly a third of the bytes, across 155 generated plates.
  const spokes = `<path d="${pts.map((p, i) => `M${p}L${inner[i]}`).join('')}" stroke="${P.white}" stroke-opacity="0.55" stroke-width="${Math.max(1, r * 0.05).toFixed(1)}" fill="none"/>`
  return `<g><polygon points="${pts.join(' ')}" fill="url(#stone)" stroke="url(#metal)" stroke-width="${Math.max(2, r * 0.16)}"/><polygon points="${inner.join(' ')}" fill="${P.white}" fill-opacity="0.28"/>${spokes}</g>`
}

/** Bead run along an arc — used for chains, mangalsutra and payal. */
function beadArc(cx, cy, rx, ry, from, to, n, r, fill) {
  let out = ''
  for (let i = 0; i <= n; i++) {
    const a = from + ((to - from) * i) / n
    const x = cx + Math.cos(a) * rx
    const y = cy + Math.sin(a) * ry
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${fill}" stroke="url(#metal)" stroke-width="3"/>`
  }
  return out
}

/** Point on a quadratic Bezier — lets beads sit exactly on the strung curve. */
function qPoint(x0, y0, cx, cy, x1, y1, t) {
  const u = 1 - t
  return {
    x: u * u * x0 + 2 * u * t * cx + t * t * x1,
    y: u * u * y0 + 2 * u * t * cy + t * t * y1,
  }
}

/** Beads threaded along a quadratic curve, evenly spaced in parameter space. */
function beadCurve(x0, y0, cx, cy, x1, y1, n, r, fill, from = 0.04, to = 0.96) {
  let out = ''
  for (let i = 0; i <= n; i++) {
    const t = from + ((to - from) * i) / n
    const p = qPoint(x0, y0, cx, cy, x1, y1, t)
    out += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r}" fill="${fill}" stroke="url(#metal)" stroke-width="3"/>`
  }
  return out
}

const MOTIFS = {
  ring: () => `
    <ellipse cx="${C}" cy="${C + 110}" rx="300" ry="300" ${stroke(58)}/>
    <ellipse cx="${C}" cy="${C + 110}" rx="300" ry="300" fill="none" stroke="${P.white}" stroke-opacity="0.35" stroke-width="10"/>
    <path d="M ${C - 150} ${C - 130} Q ${C} ${C - 250} ${C + 150} ${C - 130}" ${stroke(40)}/>
    ${gem(C, C - 210, 118)}
    ${gem(C - 200, C - 96, 44)}${gem(C + 200, C - 96, 44)}`,
  necklace: () => `
    <path d="M ${C - 470} ${C - 330} Q ${C} ${C + 250} ${C + 470} ${C - 330}" ${stroke(26)}/>
    <path d="M ${C - 470} ${C - 330} Q ${C} ${C + 250} ${C + 470} ${C - 330}" fill="none" stroke="${P.white}" stroke-opacity="0.3" stroke-width="7"/>
    ${beadCurve(C - 470, C - 330, C, C + 250, C + 470, C - 330, 22, 20, 'url(#metal2)')}
    ${[0.24, 0.38, 0.62, 0.76]
      .map((t) => {
        const p = qPoint(C - 470, C - 330, C, C + 250, C + 470, C - 330, t)
        const r = t > 0.3 && t < 0.7 ? 54 : 40
        return `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${p.x.toFixed(1)}" y2="${(p.y + 70).toFixed(1)}" ${stroke(9)}/>${gem(p.x, p.y + 70 + r, r)}`
      })
      .join('')}
    ${(() => {
      const p = qPoint(C - 470, C - 330, C, C + 250, C + 470, C - 330, 0.5)
      return `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${p.x.toFixed(1)}" y2="${(p.y + 60).toFixed(1)}" ${stroke(12)}/>${gem(p.x, p.y + 60 + 100, 100)}`
    })()}`,
  earrings: () =>
    [-1, 1]
      .map((side) => {
        const x = C + side * 250
        const domeCy = C + 150
        const r = 200
        const ghungroo = Array.from({ length: 7 }, (_, k) => {
          const gx = x - r * 0.86 + (r * 1.72 * k) / 6
          return `<line x1="${gx.toFixed(1)}" y1="${domeCy}" x2="${gx.toFixed(1)}" y2="${domeCy + 52}" ${stroke(8)}/><circle cx="${gx.toFixed(1)}" cy="${domeCy + 84}" r="32" fill="url(#metal2)" stroke="url(#metal)" stroke-width="6"/>`
        }).join('')
        return `<g>
          <circle cx="${x}" cy="${C - 400}" r="54" ${stroke(20)}/>
          ${gem(x, C - 268, 76)}
          <line x1="${x}" y1="${C - 192}" x2="${x}" y2="${domeCy - r}" ${stroke(14)}/>
          <path d="M ${x - r} ${domeCy} A ${r} ${r} 0 0 1 ${x + r} ${domeCy} Z" fill="url(#metal)" stroke="url(#metal)" stroke-width="10"/>
          <path d="M ${x - r * 0.62} ${domeCy - r * 0.3} A ${r * 0.7} ${r * 0.7} 0 0 1 ${x + r * 0.62} ${domeCy - r * 0.3}" fill="none" stroke="${P.white}" stroke-opacity="0.4" stroke-width="10"/>
          ${gem(x, domeCy - 74, 54)}
          <line x1="${x - r - 10}" y1="${domeCy}" x2="${x + r + 10}" y2="${domeCy}" ${stroke(16)}/>
          ${ghungroo}
        </g>`
      })
      .join(''),
  bangle: () => `
    <ellipse cx="${C - 120}" cy="${C}" rx="330" ry="330" ${stroke(72)}/>
    <ellipse cx="${C + 120}" cy="${C}" rx="330" ry="330" ${stroke(72)}/>
    <ellipse cx="${C - 120}" cy="${C}" rx="330" ry="330" fill="none" stroke="${P.white}" stroke-opacity="0.3" stroke-width="12"/>
    <ellipse cx="${C + 120}" cy="${C}" rx="330" ry="330" fill="none" stroke="${P.white}" stroke-opacity="0.3" stroke-width="12"/>
    ${beadArc(C + 120, C, 330, 330, -Math.PI * 0.35, Math.PI * 0.35, 7, 24, 'url(#stone)')}`,
  bracelet: () => `
    <path d="M ${C - 430} ${C - 60} Q ${C} ${C + 300} ${C + 430} ${C - 60}" ${stroke(20)}/>
    ${Array.from({ length: 9 }, (_, i) => {
      const p = qPoint(C - 430, C - 60, C, C + 300, C + 430, C - 60, 0.04 + (0.92 * i) / 8)
      return `<rect x="${(p.x - 46).toFixed(1)}" y="${(p.y - 40).toFixed(1)}" width="92" height="80" rx="26" fill="${P.cream}" stroke="url(#metal)" stroke-width="16"/>${gem(p.x, p.y, 26)}`
    }).join('')}
    <path d="M ${C - 430} ${C - 60} L ${C - 430} ${C - 190}" ${stroke(18)}/>
    <path d="M ${C + 430} ${C - 60} L ${C + 430} ${C - 190}" ${stroke(18)}/>`,
  chain: () => `
    ${Array.from({ length: 11 }, (_, i) => {
      const y = 260 + i * 108
      const odd = i % 2
      return `<ellipse cx="${C + (odd ? 26 : -26)}" cy="${y}" rx="${odd ? 46 : 76}" ry="${odd ? 76 : 46}" ${stroke(22)}/>`
    }).join('')}`,
  pendant: () => `
    <path d="M ${C - 420} 250 Q ${C} 520 ${C + 420} 250" ${stroke(12)}/>
    <ellipse cx="${C}" cy="${C - 130}" rx="58" ry="82" ${stroke(22)}/>
    <path d="M ${C} ${C - 40} L ${C + 230} ${C + 150} L ${C} ${C + 470} L ${C - 230} ${C + 150} Z" fill="url(#metal)" stroke="url(#metal)" stroke-width="10"/>
    ${gem(C, C + 170, 130)}`,
  mangalsutra: () => `
    <path d="M ${C - 470} ${C - 300} Q ${C} ${C + 210} ${C + 470} ${C - 300}" fill="none" stroke="${P.ink}" stroke-width="9"/>
    ${beadCurve(C - 470, C - 300, C, C + 210, C + 470, C - 300, 30, 16, P.ink, 0.02, 0.98)}
    ${(() => {
      const p = qPoint(C - 470, C - 300, C, C + 210, C + 470, C - 300, 0.5)
      return `<g>
        <circle cx="${(p.x - 105).toFixed(1)}" cy="${(p.y + 150).toFixed(1)}" r="105" fill="url(#metal)" stroke="url(#metal)" stroke-width="8"/>
        <circle cx="${(p.x + 105).toFixed(1)}" cy="${(p.y + 150).toFixed(1)}" r="105" fill="url(#metal)" stroke="url(#metal)" stroke-width="8"/>
        ${gem(p.x - 105, p.y + 150, 56)}${gem(p.x + 105, p.y + 150, 56)}
      </g>`
    })()}`,
  nosepin: () => `
    <circle cx="${C}" cy="${C + 60}" r="230" ${stroke(22)}/>
    ${gem(C, C - 170, 150)}
    ${gem(C - 150, C - 60, 52)}${gem(C + 150, C - 60, 52)}
    <path d="M ${C + 210} ${C + 130} q 120 60 60 190" ${stroke(14)}/>`,
  anklet: () => `
    <path d="M ${C - 470} ${C - 180} Q ${C} ${C + 240} ${C + 470} ${C - 180}" ${stroke(18)}/>
    ${Array.from({ length: 13 }, (_, i) => {
      const p = qPoint(C - 470, C - 180, C, C + 240, C + 470, C - 180, 0.03 + (0.94 * i) / 12)
      return `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${p.x.toFixed(1)}" y2="${(p.y + 92).toFixed(1)}" ${stroke(9)}/><circle cx="${p.x.toFixed(1)}" cy="${(p.y + 128).toFixed(1)}" r="36" fill="url(#metal2)" stroke="url(#metal)" stroke-width="7"/>`
    }).join('')}`,
  temple: () => `
    <circle cx="${C}" cy="${C}" r="360" fill="url(#metal)" opacity="0.16"/>
    ${Array.from({ length: 24 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 24
      return `<line x1="${(C + Math.cos(a) * 300).toFixed(1)}" y1="${(C + Math.sin(a) * 300).toFixed(1)}" x2="${(C + Math.cos(a) * 420).toFixed(1)}" y2="${(C + Math.sin(a) * 420).toFixed(1)}" ${stroke(16)}/>`
    }).join('')}
    <circle cx="${C}" cy="${C}" r="300" ${stroke(30)}/>
    <path d="M ${C} ${C - 190} q 130 100 0 240 q -130 -140 0 -240 Z" fill="url(#metal)" stroke="url(#metal)" stroke-width="8"/>
    <path d="M ${C - 170} ${C + 40} q 170 130 340 0" ${stroke(16)}/>
    ${gem(C, C + 20, 54)}`,
  polki: () => `
    <circle cx="${C}" cy="${C}" r="330" fill="url(#metal)" opacity="0.2"/>
    ${gem(C, C, 150)}
    ${Array.from({ length: 8 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 8
      return gem(C + Math.cos(a) * 250, C + Math.sin(a) * 250, 84)
    }).join('')}
    ${Array.from({ length: 16 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 16 + Math.PI / 16
      return gem(C + Math.cos(a) * 400, C + Math.sin(a) * 400, 40)
    }).join('')}`,
  silver: () => `
    <ellipse cx="${C}" cy="${C + 180}" rx="420" ry="130" ${stroke(26)}/>
    <path d="M ${C - 420} ${C + 180} q 0 -330 420 -330 q 420 0 420 330" ${stroke(26)}/>
    <ellipse cx="${C}" cy="${C - 150}" rx="420" ry="120" fill="url(#metal)" opacity="0.35"/>
    <path d="M ${C - 300} ${C - 150} q 300 130 600 0" ${stroke(12)}/>
    ${gem(C, C - 330, 64)}`,
  mens: () => `
    <ellipse cx="${C}" cy="${C - 110}" rx="340" ry="300" ${stroke(90)}/>
    <ellipse cx="${C}" cy="${C - 110}" rx="340" ry="300" fill="none" stroke="${P.ink}" stroke-opacity="0.2" stroke-width="10"/>
    <rect x="${C - 130}" y="${C + 250}" width="260" height="210" rx="46" ${stroke(34)}/>
    ${gem(C, C + 355, 66)}`,
  kids: () => `
    <ellipse cx="${C - 150}" cy="${C}" rx="230" ry="230" ${stroke(46)}/>
    <ellipse cx="${C + 150}" cy="${C}" rx="230" ry="230" ${stroke(46)}/>
    ${beadArc(C - 150, C, 230, 230, 0, Math.PI * 2, 12, 20, 'url(#metal2)')}
    ${beadArc(C + 150, C, 230, 230, 0, Math.PI * 2, 12, 20, 'url(#metal2)')}`,
  bridal: () => `
    <path d="M ${C - 470} ${C - 400} Q ${C} ${C + 120} ${C + 470} ${C - 400}" ${stroke(24)}/>
    ${beadCurve(C - 470, C - 400, C, C + 120, C + 470, C - 400, 20, 22, 'url(#metal2)')}
    ${(() => {
      const p = qPoint(C - 470, C - 400, C, C + 120, C + 470, C - 400, 0.5)
      const l = qPoint(C - 470, C - 400, C, C + 120, C + 470, C - 400, 0.3)
      const r = qPoint(C - 470, C - 400, C, C + 120, C + 470, C - 400, 0.7)
      return `${gem(p.x, p.y + 130, 100)}${gem(l.x, l.y + 80, 56)}${gem(r.x, r.y + 80, 56)}`
    })()}
    ${[-1, 1]
      .map((s2) => `<g><circle cx="${C + s2 * 400}" cy="${C + 280}" r="50" ${stroke(18)}/><path d="M ${C + s2 * 400 - 110} ${C + 400} A 110 110 0 0 1 ${C + s2 * 400 + 110} ${C + 400} Z" fill="url(#metal)" stroke="url(#metal)" stroke-width="8"/>${gem(C + s2 * 400, C + 350, 44)}</g>`)
      .join('')}`,

}

/** Lifestyle: same motif, softer, on a maroon-washed ground with an editorial frame. */
function lifestyle(motif, tone) {
  return wrap(tone, `<g transform="translate(${C} ${C}) scale(0.74) translate(${-C} ${-C})" opacity="0.96">${MOTIFS[motif]()}</g>`, {
    vignette: true,
    frame: true,
  })
}

/** Scale reference: motif beside a 20 mm coin outline and a centimetre rule. */
function scale(motif, tone) {
  const rule = Array.from({ length: 9 }, (_, i) => {
    const x = 300 + i * 125
    return `<line x1="${x}" y1="1330" x2="${x}" y2="${i % 5 === 0 ? 1250 : 1290}" stroke="${P.muted}" stroke-width="4"/>`
  }).join('')
  return wrap(
    tone,
    `<g transform="translate(${C} ${C - 90}) scale(0.66) translate(${-C} ${-C})">${MOTIFS[motif]()}</g>
     <circle cx="240" cy="1290" r="70" fill="none" stroke="${P.muted}" stroke-width="5" stroke-dasharray="12 9"/>
     <text x="240" y="1420" font-family="Inter, sans-serif" font-size="42" fill="${P.muted}" text-anchor="middle">20 mm</text>
     <line x1="300" y1="1330" x2="1300" y2="1330" stroke="${P.muted}" stroke-width="5"/>
     ${rule}
     <text x="800" y="1420" font-family="Inter, sans-serif" font-size="42" fill="${P.muted}" text-anchor="middle">8 cm</text>`,
  )
}

/**
 * Wide editorial plate for the hero. 2400x1000, dark ground so cream type reads
 * at AA on every slide, jali lattice for texture, motif weighted to the right so
 * the headline column stays clear.
 */
function heroWide(motif, tone) {
  const W = 2400
  const H = 1000
  // The jali lattice is a tiled <pattern> rather than a few hundred repeated
  // paths: same result, a twelfth of the bytes, and far less to parse on a
  // phone — this is the LCP image.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
${defs(tone)}
<defs>
  <linearGradient id="heroGround" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="${H}">
    <stop offset="0%" stop-color="${P.ink}"/>
    <stop offset="55%" stop-color="#241A18"/>
    <stop offset="100%" stop-color="${P.maroon}"/>
  </linearGradient>
  <radialGradient id="heroGlow" cx="72%" cy="48%" r="42%">
    <stop offset="0%" stop-color="${P.light}" stop-opacity="0.34"/>
    <stop offset="100%" stop-color="${P.light}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="heroScrim" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="0">
    <stop offset="0%" stop-color="${P.ink}" stop-opacity="0.86"/>
    <stop offset="46%" stop-color="${P.ink}" stop-opacity="0.5"/>
    <stop offset="100%" stop-color="${P.ink}" stop-opacity="0.06"/>
  </linearGradient>
  <pattern id="jali" width="120" height="120" patternUnits="userSpaceOnUse">
    <path d="M 60 26 L 94 60 L 60 94 L 26 60 Z" fill="none" stroke="${P.gold}" stroke-opacity="0.14" stroke-width="1.5"/>
    <path d="M 0 -34 L 34 0 L 0 34 L -34 0 Z" fill="none" stroke="${P.gold}" stroke-opacity="0.14" stroke-width="1.5"/>
    <path d="M 120 -34 L 154 0 L 120 34 L 86 0 Z" fill="none" stroke="${P.gold}" stroke-opacity="0.14" stroke-width="1.5"/>
    <path d="M 0 86 L 34 120 L 0 154 L -34 120 Z" fill="none" stroke="${P.gold}" stroke-opacity="0.14" stroke-width="1.5"/>
    <path d="M 120 86 L 154 120 L 120 154 L 86 120 Z" fill="none" stroke="${P.gold}" stroke-opacity="0.14" stroke-width="1.5"/>
  </pattern>
</defs>
<rect width="${W}" height="${H}" fill="url(#heroGround)"/>
<rect width="${W}" height="${H}" fill="url(#jali)"/>
<rect width="${W}" height="${H}" fill="url(#heroGlow)"/>
<g transform="translate(1720 500) scale(0.56) translate(-800 -800)">${MOTIFS[motif] ? MOTIFS[motif]() : MOTIFS.ring()}</g>
<rect width="${W}" height="${H}" fill="url(#heroScrim)"/>
<rect x="40" y="40" width="${W - 80}" height="${H - 80}" fill="none" stroke="${P.gold}" stroke-opacity="0.22" stroke-width="2"/>
</svg>`
}

/** Certificate card for diamond and polki pieces. */
function certificate(tone, lab) {
  return wrap(
    tone,
    `<rect x="220" y="300" width="1160" height="1000" rx="26" fill="${P.white}" stroke="${P.gold}" stroke-opacity="0.4" stroke-width="6"/>
     <text x="${C}" y="470" font-family="Georgia, serif" font-size="76" fill="${P.ink}" text-anchor="middle">${lab} Certificate</text>
     <line x1="330" y1="530" x2="1270" y2="530" stroke="${P.light}" stroke-width="4"/>
     ${['Stone', 'Shape', 'Carat', 'Colour', 'Clarity', 'Report no.']
       .map(
         (label, i) =>
           `<text x="360" y="${640 + i * 96}" font-family="Inter, sans-serif" font-size="44" fill="${P.muted}">${label}</text><line x1="720" y1="${655 + i * 96}" x2="1240" y2="${655 + i * 96}" stroke="${P.pale}" stroke-width="4"/>`,
       )
       .join('')}
     <circle cx="1160" cy="1180" r="90" fill="none" stroke="${P.maroon}" stroke-width="6"/>
     <text x="1160" y="1198" font-family="Georgia, serif" font-size="46" fill="${P.maroon}" text-anchor="middle">${lab}</text>`,
  )
}

const PLAN = JSON.parse(process.argv[2] ?? '[]')
let count = 0
for (const item of PLAN) {
  const tone = TONES[item.tone] ?? TONES.yellow
  const motif = MOTIFS[item.motif] ? item.motif : 'ring'
  writeFileSync(join(OUT, `${item.slug}-1.svg`), wrap(tone, MOTIFS[motif]()))
  writeFileSync(join(OUT, `${item.slug}-2.svg`), lifestyle(motif, tone))
  writeFileSync(join(OUT, `${item.slug}-3.svg`), scale(motif, tone))
  count += 3
  if (item.cert) {
    writeFileSync(join(OUT, `${item.slug}-cert.svg`), certificate(tone, item.cert))
    count += 1
  }
}

// Category tiles reuse the pack-shot treatment at tile scale.
for (const cat of JSON.parse(process.argv[3] ?? '[]')) {
  const tone = TONES[cat.tone] ?? TONES.yellow
  writeFileSync(join(OUT, `category-${cat.slug}.svg`), wrap(tone, MOTIFS[cat.motif] ? MOTIFS[cat.motif]() : MOTIFS.ring()))
  count += 1
}

for (const h of JSON.parse(process.argv[4] ?? '[]')) {
  writeFileSync(join(OUT, `hero-${h.slug}.svg`), heroWide(h.motif, TONES[h.tone] ?? TONES.yellow))
  count += 1
}

console.log(`wrote ${count} plates to public/catalog`)
