/**
 * Utilitários para conversão, manipulação e análise de cores
 */

/**
 * Converte uma cor hexadecimal para RGB
 * @param {string} hex - Cor em formato hexadecimal (#RRGGBB ou #RGB)
 * @returns {Object} Objeto com valores r, g, b
 */
export function hexToRgb(hex) {
  // Remover o #
  hex = hex.replace(/^#/, '')

  // Expandir formato curto (#RGB para #RRGGBB)
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }

  // Converter para valores decimais
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return { r, g, b }
}

/**
 * Converte RGB para hexadecimal
 * @param {number} r - Valor de vermelho (0-255)
 * @param {number} g - Valor de verde (0-255)
 * @param {number} b - Valor de azul (0-255)
 * @returns {string} Cor no formato hexadecimal (#RRGGBB)
 */
export function rgbToHex(r, g, b) {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`
}

/**
 * Converte RGB para HSL
 * @param {number} r - Valor de vermelho (0-255)
 * @param {number} g - Valor de verde (0-255)
 * @param {number} b - Valor de azul (0-255)
 * @returns {Object} Objeto com valores h (0-360), s (0-100), l (0-100)
 */
export function rgbToHsl(r, g, b) {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h,
    s,
    l = (max + min) / 2

  if (max === min) {
    h = s = 0 // acromático
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

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

/**
 * Converte HSL para RGB
 * @param {number} h - Matiz (0-360)
 * @param {number} s - Saturação (0-100)
 * @param {number} l - Luminosidade (0-100)
 * @returns {Object} Objeto com valores r, g, b (0-255)
 */
export function hslToRgb(h, s, l) {
  h /= 360
  s /= 100
  l /= 100

  let r, g, b

  if (s === 0) {
    r = g = b = l // acromático
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

/**
 * Analisa e converte string de cores em vários formatos para RGB
 * @param {string} color - String de cor (hex, rgb, hsl)
 * @param {string} type - Tipo de cor ('hex', 'rgb', 'hsl')
 * @returns {Object} Objeto com valores r, g, b (0-255)
 */
export function parseColor(color, type = 'hex') {
  color = color.trim()

  // Tratar tipos explícitos
  switch (type) {
    case 'hex':
      return hexToRgb(color)

    case 'rgb':
      // Extrair valores de rgb(r, g, b) ou rgb r g b
      const rgbMatch = color.match(
        /rgb\(?\s*(\d+)\s*,?\s*(\d+)\s*,?\s*(\d+)\s*\)?/i
      )
      if (rgbMatch) {
        return {
          r: parseInt(rgbMatch[1], 10),
          g: parseInt(rgbMatch[2], 10),
          b: parseInt(rgbMatch[3], 10)
        }
      }

      // Tentar parsar como três números
      const rgbParts = color.split(/\s+/)
      if (rgbParts.length === 3) {
        return {
          r: parseInt(rgbParts[0], 10),
          g: parseInt(rgbParts[1], 10),
          b: parseInt(rgbParts[2], 10)
        }
      }
      break

    case 'hsl':
      // Extrair valores de hsl(h, s%, l%) ou hsl h s% l%
      const hslMatch = color.match(
        /hsl\(?\s*(\d+)\s*,?\s*(\d+)%?\s*,?\s*(\d+)%?\s*\)?/i
      )
      if (hslMatch) {
        const h = parseInt(hslMatch[1], 10)
        const s = parseInt(hslMatch[2], 10)
        const l = parseInt(hslMatch[3], 10)
        return hslToRgb(h, s, l)
      }

      // Tentar parsar como três números (assumindo h s% l%)
      const hslParts = color.split(/\s+/)
      if (hslParts.length === 3) {
        const h = parseInt(hslParts[0], 10)
        const s = parseInt(hslParts[1].replace('%', ''), 10)
        const l = parseInt(hslParts[2].replace('%', ''), 10)
        return hslToRgb(h, s, l)
      }
      break
  }

  // Auto-detecção em caso de falha no tipo específico

  // Tentar hex
  if (
    color.startsWith('#') ||
    /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(color)
  ) {
    if (!color.startsWith('#')) color = `#${color}`
    return hexToRgb(color)
  }

  // Tentar RGB
  if (color.startsWith('rgb(') || color.startsWith('rgb ')) {
    const rgbMatch = color.match(/(\d+)\s*,?\s*(\d+)\s*,?\s*(\d+)/)
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1], 10),
        g: parseInt(rgbMatch[2], 10),
        b: parseInt(rgbMatch[3], 10)
      }
    }
  }

  // Tentar HSL
  if (color.startsWith('hsl(') || color.startsWith('hsl ')) {
    const hslMatch = color.match(/(\d+)\s*,?\s*(\d+)%?\s*,?\s*(\d+)%?/)
    if (hslMatch) {
      const h = parseInt(hslMatch[1], 10)
      const s = parseInt(hslMatch[2], 10)
      const l = parseInt(hslMatch[3], 10)
      return hslToRgb(h, s, l)
    }
  }

  // Cor padrão se nenhuma correspondência for encontrada
  console.warn(`Formato de cor não reconhecido: ${color}`)
  return { r: 0, g: 0, b: 0 }
}

/**
 * Formata um objeto RGB para uma string
 * @param {Object} rgb - Objeto com valores r, g, b
 * @param {string} format - Formato de saída ('hex', 'rgb', 'hsl')
 * @returns {string} String de cor formatada
 */
export function formatColor(rgb, format = 'hex') {
  const { r, g, b } = rgb

  switch (format) {
    case 'hex':
      return rgbToHex(r, g, b)

    case 'rgb':
      return `rgb(${r}, ${g}, ${b})`

    case 'hsl':
      const hsl = rgbToHsl(r, g, b)
      return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`

    default:
      return rgbToHex(r, g, b)
  }
}

/**
 * Calcula a luminância relativa de uma cor RGB
 * Fórmula: https://www.w3.org/TR/WCAG20-TECHS/G17.html
 * @param {Object} rgb - Objeto com valores r, g, b
 * @returns {number} Luminância relativa (0-1)
 */
export function calculateLuminance(rgb) {
  const { r, g, b } = rgb

  // Normalizar valores para [0, 1]
  const sR = r / 255
  const sG = g / 255
  const sB = b / 255

  // Aplicar transformação
  const R = sR <= 0.03928 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4)
  const G = sG <= 0.03928 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4)
  const B = sB <= 0.03928 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4)

  // Calcular luminância
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

/**
 * Calcula o contraste entre duas cores
 * Fórmula: https://www.w3.org/TR/WCAG20-TECHS/G17.html
 * @param {Object} rgb1 - Primeira cor em RGB
 * @param {Object} rgb2 - Segunda cor em RGB
 * @returns {number} Razão de contraste (1-21)
 */
export function calculateContrast(rgb1, rgb2) {
  const luminance1 = calculateLuminance(rgb1)
  const luminance2 = calculateLuminance(rgb2)

  // Determinar qual é mais claro para garantir que o contraste seja >= 1
  const lighter = Math.max(luminance1, luminance2)
  const darker = Math.min(luminance1, luminance2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Verifica se o contraste atende aos critérios WCAG
 * @param {number} contrast - Razão de contraste
 * @param {string} size - Tamanho do texto ('large' ou 'normal')
 * @returns {Object} Objeto com informações de conformidade
 */
export function checkWcagCompliance(contrast, size = 'normal') {
  // Níveis de conformidade para:
  // - AA: 4.5:1 para texto normal, 3:1 para texto grande
  // - AAA: 7:1 para texto normal, 4.5:1 para texto grande

  const isLarge = size === 'large'
  const aaThreshold = isLarge ? 3 : 4.5
  const aaaThreshold = isLarge ? 4.5 : 7

  const aaPass = contrast >= aaThreshold
  const aaaPass = contrast >= aaaThreshold

  let level = 'fail'
  if (aaaPass) level = 'AAA'
  else if (aaPass) level = 'AA'

  return {
    level,
    aaPass,
    aaaPass,
    normalText: !isLarge && aaPass,
    largeText: aaPass,
    enhancedNormalText: !isLarge && aaaPass,
    enhancedLargeText: aaaPass
  }
}

/**
 * Gera cores alternativas para melhorar o contraste
 * @param {Object} background - Cor de fundo em RGB
 * @param {Object} text - Cor do texto em RGB
 * @param {number} targetContrast - Contraste alvo (4.5 para AA, 7 para AAA)
 * @returns {Array} Array de cores alternativas sugeridas
 */
export function suggestAlternativeColors(
  background,
  text,
  targetContrast = 4.5
) {
  const suggestions = []
  const currentContrast = calculateContrast(background, text)

  // Se já está dentro dos parâmetros, não precisamos sugerir
  if (currentContrast >= targetContrast) {
    return suggestions
  }

  // Converter para HSL para fazer ajustes mais intuitivos
  const bgHsl = rgbToHsl(background.r, background.g, background.b)
  const textHsl = rgbToHsl(text.r, text.g, text.b)

  // Estratégia: ajustar a luminosidade mantendo a cor

  // 1. Tornar o texto mais escuro ou mais claro
  const darkText = { ...textHsl, l: Math.max(0, textHsl.l - 40) }
  const lightText = { ...textHsl, l: Math.min(100, textHsl.l + 40) }

  // 2. Tornar o fundo mais claro ou mais escuro
  const lightBg = { ...bgHsl, l: Math.min(100, bgHsl.l + 40) }
  const darkBg = { ...bgHsl, l: Math.max(0, bgHsl.l - 40) }

  // Verificar contrastes das combinações
  const combinations = [
    { background: bgHsl, text: darkText, type: 'text' },
    { background: bgHsl, text: lightText, type: 'text' },
    { background: lightBg, text: textHsl, type: 'background' },
    { background: darkBg, text: textHsl, type: 'background' }
  ]

  for (const combo of combinations) {
    // Converter de volta para RGB
    const bgRgb = hslToRgb(
      combo.background.h,
      combo.background.s,
      combo.background.l
    )
    const textRgb = hslToRgb(combo.text.h, combo.text.s, combo.text.l)

    // Calcular o novo contraste
    const newContrast = calculateContrast(bgRgb, textRgb)

    // Se o contraste melhorou e atende ao alvo, adicionar à lista
    if (newContrast > currentContrast && newContrast >= targetContrast) {
      if (combo.type === 'text') {
        suggestions.push({
          type: 'text',
          color: rgbToHex(textRgb.r, textRgb.g, textRgb.b),
          contrast: newContrast.toFixed(2)
        })
      } else if (combo.type === 'background') {
        suggestions.push({
          type: 'background',
          color: rgbToHex(bgRgb.r, bgRgb.g, bgRgb.b),
          contrast: newContrast.toFixed(2)
        })
      }
    }
  }

  // 3. Adicionar uma sugestão de alto contraste (preto e branco)
  const blackText = { r: 0, g: 0, b: 0 }
  const whiteText = { r: 255, g: 255, b: 255 }

  // Verificar qual combinação tem melhor contraste
  const blackOnBgContrast = calculateContrast(background, blackText)
  const whiteOnBgContrast = calculateContrast(background, whiteText)

  if (
    blackOnBgContrast >= targetContrast &&
    blackOnBgContrast > currentContrast
  ) {
    suggestions.push({
      type: 'text',
      color: '#000000',
      contrast: blackOnBgContrast.toFixed(2)
    })
  }

  if (
    whiteOnBgContrast >= targetContrast &&
    whiteOnBgContrast > currentContrast
  ) {
    suggestions.push({
      type: 'text',
      color: '#FFFFFF',
      contrast: whiteOnBgContrast.toFixed(2)
    })
  }

  // Ordenar sugestões pelo contraste (maior primeiro)
  return suggestions.sort(
    (a, b) => parseFloat(b.contrast) - parseFloat(a.contrast)
  )
}
