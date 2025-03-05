// scripts/app.js
import * as ColorUtils from './modules/color-utils.js'

class ContrastAnalyzer {
  constructor() {
    this.initElements()
    this.addEventListeners()
    this.initPlaceholders()
  }

  initElements() {
    // Color inputs and pickers
    this.backgroundColorInput = document.getElementById('background-color')
    this.backgroundColorType = document.getElementById('background-color-type')
    this.backgroundColorPicker = document.getElementById(
      'background-color-picker'
    )

    this.textColorInput = document.getElementById('text-color')
    this.textColorType = document.getElementById('text-color-type')
    this.textColorPicker = document.getElementById('text-color-picker')

    // Results elements
    this.colorPreview = document.getElementById('color-preview')
    this.contrastRatioElement = document.querySelector('#contrast-ratio .value')
    this.accessibilityLevelElement = document.querySelector(
      '#accessibility-level .value'
    )
    this.recommendationList = document.getElementById('recommendation-list')

    // Form
    this.contrastForm = document.getElementById('contrast-form')
  }

  initPlaceholders() {
    // Set initial placeholders based on selected format
    this.updatePlaceholder(this.backgroundColorType, this.backgroundColorInput)
    this.updatePlaceholder(this.textColorType, this.textColorInput)
  }

  addEventListeners() {
    // Live preview on input
    this.backgroundColorInput.addEventListener('input', () =>
      this.updatePreview()
    )
    this.textColorInput.addEventListener('input', () => this.updatePreview())

    // Update placeholders when format changes
    this.backgroundColorType.addEventListener('change', () => {
      this.updatePlaceholder(
        this.backgroundColorType,
        this.backgroundColorInput
      )
      this.updatePreview()
    })

    this.textColorType.addEventListener('change', () => {
      this.updatePlaceholder(this.textColorType, this.textColorInput)
      this.updatePreview()
    })

    // Color picker synchronization
    this.backgroundColorPicker.addEventListener('input', e => {
      this.backgroundColorInput.value = e.target.value
      this.updatePreview()
    })

    this.textColorPicker.addEventListener('input', e => {
      this.textColorInput.value = e.target.value
      this.updatePreview()
    })
  }

  updatePlaceholder(formatSelect, colorInput) {
    const format = formatSelect.value

    switch (format) {
      case 'hex':
        colorInput.placeholder = '#FFFFFF'
        break
      case 'rgb':
        colorInput.placeholder = 'RGB(255, 255, 255)'
        break
      case 'hsl':
        colorInput.placeholder = 'HSL(0, 0%, 100%)'
        break
    }
  }

  updatePreview() {
    try {
      // Normalize colors
      const backgroundFormat = this.backgroundColorType.value
      const textFormat = this.textColorType.value

      const normalizedBackground = ColorUtils.normalizeColor(
        this.backgroundColorInput.value,
        backgroundFormat
      )
      const normalizedText = ColorUtils.normalizeColor(
        this.textColorInput.value,
        textFormat
      )

      // Update color pickers
      this.backgroundColorPicker.value =
        backgroundFormat === 'hex'
          ? normalizedBackground
          : this.convertToHex(normalizedBackground)
      this.textColorPicker.value =
        textFormat === 'hex'
          ? normalizedText
          : this.convertToHex(normalizedText)

      // Update preview
      this.colorPreview.style.backgroundColor = normalizedBackground
      this.colorPreview.style.color = normalizedText
      this.colorPreview.textContent = 'Pré-visualização'

      // Calculate contrast
      const backgroundRgb = this.convertToRgb(normalizedBackground)
      const textRgb = this.convertToRgb(normalizedText)

      const contrastRatio = ColorUtils.getContrastRatio(backgroundRgb, textRgb)
      const accessibilityLevel = ColorUtils.getAccessibilityLevel(contrastRatio)
      const recommendations = ColorUtils.getRecommendations(contrastRatio)

      // Update results
      this.contrastRatioElement.textContent = contrastRatio.toFixed(2)
      this.accessibilityLevelElement.textContent = accessibilityLevel

      // Update recommendations
      this.updateRecommendations(recommendations)
    } catch (error) {
      console.error('Color analysis error:', error)
      this.resetResults(error.message)
    }
  }

  convertToRgb(color) {
    if (color.startsWith('#')) {
      return ColorUtils.hexToRgb(color)
    }

    if (color.startsWith('rgb')) {
      const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
      }
    }

    if (color.startsWith('hsl')) {
      const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
      return this.hslToRgb(
        parseInt(match[1]),
        parseInt(match[2]),
        parseInt(match[3])
      )
    }

    throw new Error('Unsupported color format')
  }

  convertToHex(color) {
    if (color.startsWith('#')) return color

    if (color.startsWith('rgb')) {
      const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
      return this.rgbToHex(
        parseInt(match[1]),
        parseInt(match[2]),
        parseInt(match[3])
      )
    }

    if (color.startsWith('hsl')) {
      const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
      const rgb = this.hslToRgb(
        parseInt(match[1]),
        parseInt(match[2]),
        parseInt(match[3])
      )
      return this.rgbToHex(rgb.r, rgb.g, rgb.b)
    }

    throw new Error('Unsupported color format')
  }

  rgbToHex(r, g, b) {
    return (
      '#' +
      [r, g, b]
        .map(x => {
          const hex = x.toString(16)
          return hex.length === 1 ? '0' + hex : hex
        })
        .join('')
        .toUpperCase()
    )
  }

  hslToRgb(h, s, l) {
    s /= 100
    l /= 100
    const k = n => (n + h / 30) % 12
    const a = s * Math.min(l, 1 - l)
    const f = n =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
    return {
      r: Math.round(255 * f(0)),
      g: Math.round(255 * f(8)),
      b: Math.round(255 * f(4))
    }
  }

  updateRecommendations(recommendations) {
    // Clear previous recommendations
    this.recommendationList.innerHTML = ''

    // Add new recommendations
    recommendations.forEach(rec => {
      const li = document.createElement('li')
      li.textContent = rec
      this.recommendationList.appendChild(li)
    })
  }

  resetResults(errorMessage = 'Erro na análise de cores') {
    this.contrastRatioElement.textContent = '-'
    this.accessibilityLevelElement.textContent = '-'
    this.recommendationList.innerHTML = ''

    const li = document.createElement('li')
    li.textContent = errorMessage
    this.recommendationList.appendChild(li)
  }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  new ContrastAnalyzer()
})
