// color-utils.js
export function convertColor(color, fromType, toType) {
  // Normalizar cor HEX removendo # se existir
  if (fromType === 'hex') {
    color = color.replace(/^#/, '')
  }

  switch (fromType) {
    case 'hex':
      return convertFromHex(color, toType)
    case 'rgb':
      return convertFromRGB(color, toType)
    case 'hsl':
      return convertFromHSL(color, toType)
    default:
      throw new Error('Tipo de cor não suportado')
  }
}

function convertFromHex(hex, toType) {
  // Validar e normalizar hex (3 ou 6 caracteres)
  if (!/^([0-9A-Fa-f]{3}){1,2}$/.test(hex)) {
    throw new Error('Formato HEX inválido')
  }

  // Expandir shorthand hex (ex: #FFF para #FFFFFF)
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(char => char + char)
      .join('')
  }

  const rgb = hexToRGB(hex)
  switch (toType) {
    case 'hex':
      return '#' + hex.toUpperCase()
    case 'rgb':
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    case 'hsl':
      return rgbToHSL(rgb.r, rgb.g, rgb.b)
  }
}

function convertFromRGB(rgb, toType) {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!match) throw new Error('Formato RGB inválido')

  const [, r, g, b] = match.map(Number)

  switch (toType) {
    case 'hex':
      return rgbToHex(r, g, b)
    case 'rgb':
      return rgb
    case 'hsl':
      return rgbToHSL(r, g, b)
  }
}

function convertFromHSL(hsl, toType) {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
  if (!match) throw new Error('Formato HSL inválido')

  const [, h, s, l] = match.map(Number)
  const rgb = hslToRGB(h, s, l)

  switch (toType) {
    case 'hex':
      return rgbToHex(rgb.r, rgb.g, rgb.b)
    case 'rgb':
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    case 'hsl':
      return hsl
  }
}

export function calculateContrastRatio(color1, color2) {
  // Garantir que cores HEX tenham #
  color1 = ensureHexPrefix(color1)
  color2 = ensureHexPrefix(color2)

  const rgb1 = hexToRGB(color1)
  const rgb2 = hexToRGB(color2)

  const luminance1 = calculateRelativeLuminance(rgb1.r, rgb1.g, rgb1.b)
  const luminance2 = calculateRelativeLuminance(rgb2.r, rgb2.g, rgb2.b)

  const lighter = Math.max(luminance1, luminance2)
  const darker = Math.min(luminance1, luminance2)

  return (lighter + 0.05) / (darker + 0.05)
}

function ensureHexPrefix(hex) {
  return hex.startsWith('#') ? hex : '#' + hex
}

function calculateRelativeLuminance(r, g, b) {
  const sRGB = [r / 255, g / 255, b / 255].map(c =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  )

  return sRGB[0] * 0.2126 + sRGB[1] * 0.7152 + sRGB[2] * 0.0722
}

function hexToRGB(hex) {
  hex = hex.replace(/^#/, '')
  const bigint = parseInt(hex, 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  }
}

function rgbToHex(r, g, b) {
  return (
    '#' +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  )
}

function rgbToHSL(r, g, b) {
  ;(r /= 255), (g /= 255), (b /= 255)
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h,
    s,
    l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(
    l * 100
  )}%)`
}

function hslToRGB(h, s, l) {
  h /= 360
  s /= 100
  l /= 100

  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

export function suggestHoverColor(baseColor) {
  // Garantir que a cor base tenha #
  baseColor = ensureHexPrefix(baseColor)

  const rgb = hexToRGB(baseColor)
  const hsl = rgbToHSL(rgb.r, rgb.g, rgb.b)
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)

  if (!match) return baseColor

  const [, h, s, l] = match.map(Number)

  // Escurecer ou clarear a cor dependendo do brilho original
  const newLightness = l > 50 ? l - 10 : l + 10
  const hoverHSL = `hsl(${h}, ${s}%, ${newLightness}%)`

  const hoverRGB = hslToRGB(h, s, newLightness)
  return rgbToHex(hoverRGB.r, hoverRGB.g, hoverRGB.b)
}
