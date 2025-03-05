// app.js
import {
  convertColor,
  calculateContrastRatio,
  suggestHoverColor
} from './modules/color-utils.js'

class ContrastAnalyzer {
  constructor() {
    this.initializeElements()
    this.bindEvents()
  }

  initializeElements() {
    this.backgroundColorType = document.getElementById('background-color-type')
    this.textColorType = document.getElementById('text-color-type')
    this.backgroundColorInput = document.getElementById('background-color')
    this.textColorInput = document.getElementById('text-color')
    this.backgroundColorPicker = document.getElementById(
      'background-color-picker'
    )
    this.textColorPicker = document.getElementById('text-color-picker')

    this.colorPreview = document.getElementById('color-preview')
    this.contrastRatioElement = document
      .getElementById('contrast-ratio')
      .querySelector('.value')
    this.accessibilityLevelElement = document
      .getElementById('accessibility-level')
      .querySelector('.value')
    this.recommendationList = document.getElementById('recommendation-list')

    this.setupColorPickerSync()
    this.setupRealTimeUpdate()
  }

  setupColorPickerSync() {
    if (this.backgroundColorPicker && this.backgroundColorInput) {
      this.backgroundColorPicker.addEventListener('input', e => {
        this.backgroundColorInput.value = e.target.value
        this.analyzeColors()
      })

      this.backgroundColorInput.addEventListener('input', e => {
        this.backgroundColorPicker.value = e.target.value
        this.analyzeColors()
      })
    }

    if (this.textColorPicker && this.textColorInput) {
      this.textColorPicker.addEventListener('input', e => {
        this.textColorInput.value = e.target.value
        this.analyzeColors()
      })

      this.textColorInput.addEventListener('input', e => {
        this.textColorPicker.value = e.target.value
        this.analyzeColors()
      })
    }
  }

  setupRealTimeUpdate() {
    const inputs = [
      this.backgroundColorInput,
      this.backgroundColorType,
      this.textColorInput,
      this.textColorType
    ]

    inputs.forEach(input => {
      if (input) {
        input.addEventListener('input', () => this.analyzeColors())
        input.addEventListener('change', () => this.analyzeColors())
      }
    })
  }

  bindEvents() {
    // Remover evento de submit do formulário
    const form = document.getElementById('contrast-form')
    if (form) {
      form.addEventListener('submit', e => e.preventDefault())
    }
  }

  analyzeColors() {
    try {
      const backgroundColorType = this.backgroundColorType.value
      const textColorType = this.textColorType.value
      const backgroundColorInput = this.backgroundColorInput.value
      const textColorInput = this.textColorInput.value

      // Validar se as entradas não estão vazias
      if (!backgroundColorInput || !textColorInput) return

      const backgroundColorHex = convertColor(
        backgroundColorInput,
        backgroundColorType,
        'hex'
      )
      const textColorHex = convertColor(textColorInput, textColorType, 'hex')

      const contrastRatio = calculateContrastRatio(
        backgroundColorHex,
        textColorHex
      )
      const hoverColor = suggestHoverColor(textColorHex)

      this.updateUI(backgroundColorHex, textColorHex, contrastRatio, hoverColor)
    } catch (error) {
      this.showError(error.message)
    }
  }

  updateUI(bgColor, textColor, contrastRatio, hoverColor) {
    // Atualizar preview de cor
    if (this.colorPreview) {
      this.colorPreview.style.backgroundColor = bgColor
      this.colorPreview.style.color = textColor
      this.colorPreview.textContent = 'Exemplo de Texto'
    }

    // Atualizar razão de contraste
    if (this.contrastRatioElement) {
      this.contrastRatioElement.textContent = contrastRatio.toFixed(2)
    }

    // Determinar nível de acessibilidade
    const accessibilityLevel = this.getAccessibilityLevel(contrastRatio)
    if (this.accessibilityLevelElement) {
      this.accessibilityLevelElement.textContent = accessibilityLevel.text
      this.accessibilityLevelElement.className = `value ${accessibilityLevel.class}`
    }

    // Atualizar recomendações
    this.updateRecommendations(contrastRatio, bgColor, textColor, hoverColor)
  }

  getAccessibilityLevel(contrastRatio) {
    if (contrastRatio >= 7) {
      return { text: 'AAA', class: 'success' }
    } else if (contrastRatio >= 4.5) {
      return { text: 'AA', class: 'warning' }
    } else {
      return { text: 'Falha', class: 'error' }
    }
  }

  updateRecommendations(contrastRatio, bgColor, textColor, hoverColor) {
    if (!this.recommendationList) return

    this.recommendationList.innerHTML = '' // Limpar recomendações anteriores

    const recommendations = []

    if (contrastRatio >= 7) {
      recommendations.push('Excelente contraste! Atende aos padrões WCAG AAA.')
    } else if (contrastRatio >= 4.5) {
      recommendations.push(
        'Contraste adequado para textos normais (Padrão WCAG AA).'
      )
      recommendations.push(
        `Considere ajustar a cor de fundo (${bgColor}) ou texto (${textColor}) para melhorar o contraste.`
      )
    } else {
      recommendations.push(
        'Contraste insuficiente! Acessibilidade comprometida.'
      )
      recommendations.push(
        `Recomendamos alterar significativamente a cor de fundo (${bgColor}) ou texto (${textColor}).`
      )
    }

    recommendations.push(`Cor de hover sugerida: ${hoverColor}`)

    recommendations.forEach(rec => {
      const li = document.createElement('li')
      li.textContent = rec
      this.recommendationList.appendChild(li)
    })
  }

  showError(message) {
    if (this.recommendationList) {
      this.recommendationList.innerHTML = `<li class="error">${message}</li>`
    }
    console.error(message)
  }
}

// Inicializar o analisador quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  new ContrastAnalyzer()
})
