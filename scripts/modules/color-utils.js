// scripts/modules/color-utils.js

/**
 * Normaliza a entrada de cor garantindo que as cores HEX tenham um prefixo #
 * @param {string} color - String de entrada de cor
 * @param {string} format - Formato da cor (hex, rgb, hsl)
 * @returns {string} String de cor normalizada
 */
export function normalizeColor(color, format) {
  if (format === 'hex') {
    // Remove espaços em branco e converte para maiúsculas
    color = color.trim().toUpperCase()

    // Adiciona # se não estiver presente
    if (!color.startsWith('#')) {
      color = '#' + color
    }

    // Valida formato de cor HEX
    const hexRegex = /^#([0-9A-F]{3}){1,2}$/
    if (!hexRegex.test(color)) {
      throw new Error('Formato de cor HEX inválido')
    }

    // Expande HEX abreviado (ex: #FFF para #FFFFFF)
    if (color.length === 4) {
      color = '#' + color[1].repeat(2) + color[2].repeat(2) + color[3].repeat(2)
    }

    return color
  }

  if (format === 'rgb') {
    // Normaliza entrada RGB
    const rgbRegex =
      /^RGB\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i
    const match = color.match(rgbRegex)

    if (!match) {
      throw new Error('Formato de cor RGB inválido')
    }

    const [, r, g, b] = match

    // Valida valores RGB
    if (r > 255 || g > 255 || b > 255) {
      throw new Error('Os valores RGB devem estar entre 0 e 255')
    }

    return `rgb(${r},${g},${b})`
  }

  if (format === 'hsl') {
    // Normaliza entrada HSL
    const hslRegex =
      /^HSL\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/i
    const match = color.match(hslRegex)

    if (!match) {
      throw new Error('Formato de cor HSL inválido')
    }

    const [, h, s, l] = match

    // Valida valores HSL
    if (h > 360 || s > 100 || l > 100) {
      throw new Error('Valores de HSL fora do intervalo permitido')
    }

    return `hsl(${h},${s}%,${l}%)`
  }

  throw new Error('Formato de cor não suportado')
}

/**
 * Converte HEX para RGB
 * @param {string} hex - Cor HEX
 * @returns {Object} Objeto de cor RGB
 */
export function hexToRgb(hex) {
  // Remove # se presente
  hex = hex.replace('#', '')

  // Converte abreviado para HEX completo, se necessário
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(char => char + char)
      .join('')
  }

  const bigint = parseInt(hex, 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  }
}

/**
 * Calcula a luminância relativa
 * @param {Object} rgb - Objeto de cor RGB
 * @returns {number} Valor de luminância relativa
 */
export function getLuminance(rgb) {
  const a = [rgb.r, rgb.g, rgb.b].map(v => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })

  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

/**
 * Calcula a taxa de contraste
 * @param {Object} rgb1 - Primeira cor RGB
 * @param {Object} rgb2 - Segunda cor RGB
 * @returns {number} Taxa de contraste
 */
export function getContrastRatio(rgb1, rgb2) {
  const l1 = getLuminance(rgb1)
  const l2 = getLuminance(rgb2)

  const maisClaro = Math.max(l1, l2)
  const maisEscuro = Math.min(l1, l2)

  return (maisClaro + 0.05) / (maisEscuro + 0.05)
}

/**
 * Obtém o nível de acessibilidade com base na taxa de contraste
 * @param {number} ratio - Taxa de contraste
 * @returns {string} Nível de acessibilidade
 */
export function getAccessibilityLevel(ratio) {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return 'AA (Texto Grande)'
  return 'Reprovado'
}

/**
 * Gera recomendações com base na taxa de contraste
 * @param {number} ratio - Taxa de contraste
 * @returns {string[]} Recomendações
 */
export function getRecommendations(ratio) {
  const recommendations = []

  if (ratio < 4.5) {
    recommendations.push('O contraste está muito baixo para texto normal')
    recommendations.push('Tente clarear o fundo ou escurecer o texto')
  }

  if (ratio < 3) {
    recommendations.push(
      'O contraste está muito baixo, inadequado para qualquer texto'
    )
    recommendations.push('São necessárias ajustes significativos de cor')
  }

  if (ratio >= 4.5 && ratio < 7) {
    recommendations.push('Atende ao nível AA do WCAG 2.0 para texto normal')
    recommendations.push('Considere melhorar para uma melhor legibilidade')
  }

  if (ratio >= 7) {
    recommendations.push('Ótimo contraste! Atende ao nível AAA do WCAG 2.0')
    recommendations.push('Adequado para todos os tamanhos de texto')
  }

  return recommendations
}
