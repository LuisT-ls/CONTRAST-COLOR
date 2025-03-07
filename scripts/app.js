/**
 * Contrast.Pro - Aplicativo de análise de contraste de cores
 *
 * Este script implementa a funcionalidade principal do aplicativo,
 * incluindo validação de cores, cálculos de contraste e atualizações
 * de UI em tempo real.
 */

import * as ColorUtils from './modules/color-utils.js'

// Elementos DOM
const form = document.getElementById('contrast-form')
const backgroundInput = document.getElementById('background-color')
const backgroundFormatSelector = document.getElementById(
  'background-color-type'
)
const backgroundColorPicker = document.getElementById('background-color-picker')

const textInput = document.getElementById('text-color')
const textFormatSelector = document.getElementById('text-color-type')
const textColorPicker = document.getElementById('text-color-picker')

const colorPreview = document.getElementById('color-preview')
const contrastRatio = document.getElementById('contrast-ratio')
const accessibilityLevel = document.getElementById('accessibility-level')
const recommendationList = document.getElementById('recommendation-list')

// Valores padrão
let backgroundColor = { r: 255, g: 255, b: 255 }
let textColor = { r: 0, g: 0, b: 0 }

// Inicialização
function init() {
  // Configurar os valores iniciais
  backgroundInput.value = '#FFFFFF'
  textInput.value = '#000000'
  backgroundColorPicker.value = '#FFFFFF'
  textColorPicker.value = '#000000'

  // Adicionar botão de alternância de tema
  createThemeToggle()

  // Configurar os eventos
  setupEventListeners()

  // Atualizar a visualização inicial
  updatePreview()
}

// Configurar listeners de eventos
function setupEventListeners() {
  // Inputs de texto
  backgroundInput.addEventListener('input', handleBackgroundChange)
  textInput.addEventListener('input', handleTextChange)

  // Color pickers
  backgroundColorPicker.addEventListener('input', handleBackgroundPickerChange)
  textColorPicker.addEventListener('input', handleTextPickerChange)

  // Seletores de formato
  backgroundFormatSelector.addEventListener('change', handleFormatChange)
  textFormatSelector.addEventListener('change', handleFormatChange)

  // Formulário (para prevenir submissão)
  form.addEventListener('submit', e => e.preventDefault())
}

// Lidar com alteração no input de cor de fundo
function handleBackgroundChange(e) {
  try {
    const color = ColorUtils.parseColor(
      e.target.value,
      backgroundFormatSelector.value
    )
    backgroundColor = color
    backgroundColorPicker.value = ColorUtils.formatColor(color, 'hex')
    updatePreview()
  } catch (error) {
    console.error('Erro ao analisar cor de fundo:', error)
  }
}

// Lidar com alteração no input de cor do texto
function handleTextChange(e) {
  try {
    const color = ColorUtils.parseColor(
      e.target.value,
      textFormatSelector.value
    )
    textColor = color
    textColorPicker.value = ColorUtils.formatColor(color, 'hex')
    updatePreview()
  } catch (error) {
    console.error('Erro ao analisar cor do texto:', error)
  }
}

// Lidar com alteração no color picker de fundo
function handleBackgroundPickerChange(e) {
  const hexColor = e.target.value
  backgroundColor = ColorUtils.hexToRgb(hexColor)

  // Atualizar o valor no input de texto de acordo com o formato selecionado
  backgroundInput.value = ColorUtils.formatColor(
    backgroundColor,
    backgroundFormatSelector.value
  )

  updatePreview()
}

// Lidar com alteração no color picker de texto
function handleTextPickerChange(e) {
  const hexColor = e.target.value
  textColor = ColorUtils.hexToRgb(hexColor)

  // Atualizar o valor no input de texto de acordo com o formato selecionado
  textInput.value = ColorUtils.formatColor(textColor, textFormatSelector.value)

  updatePreview()
}

// Lidar com alterações nos seletores de formato
function handleFormatChange() {
  // Atualizar o formato exibido nos inputs
  backgroundInput.value = ColorUtils.formatColor(
    backgroundColor,
    backgroundFormatSelector.value
  )

  textInput.value = ColorUtils.formatColor(textColor, textFormatSelector.value)
}

// Atualizar a pré-visualização e os resultados
function updatePreview() {
  // Atualizar cores na pré-visualização
  const bgColorHex = ColorUtils.formatColor(backgroundColor, 'hex')
  const textColorHex = ColorUtils.formatColor(textColor, 'hex')

  colorPreview.style.backgroundColor = bgColorHex
  colorPreview.style.color = textColorHex

  // Calcular contraste
  const contrast = ColorUtils.calculateContrast(backgroundColor, textColor)
  const formattedContrast = contrast.toFixed(2)

  // Verificar conformidade com WCAG
  const compliance = ColorUtils.checkWcagCompliance(contrast)

  // Atualizar informações de contraste
  contrastRatio.querySelector('.value').textContent = `${formattedContrast}:1`

  // Atualizar nível de acessibilidade
  const accessibilityValue = accessibilityLevel.querySelector('.value')
  accessibilityValue.textContent = ''

  const statusElement = document.createElement('span')
  statusElement.textContent = compliance.level

  if (compliance.level === 'AAA') {
    statusElement.className = 'status-aaa'
  } else if (compliance.level === 'AA') {
    statusElement.className = 'status-aa'
  } else {
    statusElement.className = 'status-fail'
  }

  accessibilityValue.appendChild(statusElement)

  // Ativar efeito fade-in
  contrastRatio.classList.add('fade-in')
  accessibilityLevel.classList.add('fade-in')

  // Remover a classe após a animação para permitir reutilização
  setTimeout(() => {
    contrastRatio.classList.remove('fade-in')
    accessibilityLevel.classList.remove('fade-in')
  }, 300)

  // Gerar recomendações
  updateRecommendations(compliance)
}

// Atualizar recomendações com base na conformidade
function updateRecommendations(compliance) {
  // Limpar lista existente
  recommendationList.innerHTML = ''

  const targetContrast = compliance.level === 'fail' ? 4.5 : 7
  const suggestions = ColorUtils.suggestAlternativeColors(
    backgroundColor,
    textColor,
    targetContrast
  )

  // Se já estiver em conformidade com AAA, não precisamos de sugestões
  if (compliance.level === 'AAA') {
    const item = document.createElement('li')
    item.className = 'recommendation-item'
    item.innerHTML = `
      <div class="color-swatch" style="background: linear-gradient(45deg, #4CAF50, #8BC34A);"></div>
      <p>Excelente! Esta combinação de cores atende aos mais altos padrões de acessibilidade (AAA).</p>`
    recommendationList.appendChild(item)
    return
  }

  // Se estiver em conformidade com AA, mas não com AAA
  if (compliance.level === 'AA') {
    const item = document.createElement('li')
    item.className = 'recommendation-item'
    item.innerHTML = `
      <div class="color-swatch" style="background: linear-gradient(45deg, #FFC107, #FF9800);"></div>
      <p>Bom! Esta combinação atende ao nível AA. Abaixo estão sugestões para atingir o nível AAA:</p>`
    recommendationList.appendChild(item)
  } else {
    // Se falhar completamente
    const item = document.createElement('li')
    item.className = 'recommendation-item'
    item.innerHTML = `
      <div class="color-swatch" style="background: linear-gradient(45deg, #F44336, #E91E63);"></div>
      <p>Esta combinação não atende aos padrões mínimos de contraste. Veja as sugestões:</p>`
    recommendationList.appendChild(item)
  }

  // Adicionar sugestões
  suggestions.slice(0, 3).forEach(suggestion => {
    const item = document.createElement('li')
    item.className = 'recommendation-item'

    const swatch = document.createElement('div')
    swatch.className = 'color-swatch'
    swatch.style.backgroundColor = suggestion.color

    const description = document.createElement('p')
    if (suggestion.type === 'text') {
      description.textContent = `Altere a cor do texto para ${suggestion.color} (contraste: ${suggestion.contrast}:1)`
    } else {
      description.textContent = `Altere a cor de fundo para ${suggestion.color} (contraste: ${suggestion.contrast}:1)`
    }

    // Adicionar funcionalidade de clique para aplicar a sugestão
    item.addEventListener('click', () => {
      if (suggestion.type === 'text') {
        textColor = ColorUtils.parseColor(suggestion.color, 'hex')
        textInput.value = ColorUtils.formatColor(
          textColor,
          textFormatSelector.value
        )
        textColorPicker.value = ColorUtils.formatColor(textColor, 'hex')
      } else {
        backgroundColor = ColorUtils.parseColor(suggestion.color, 'hex')
        backgroundInput.value = ColorUtils.formatColor(
          backgroundColor,
          backgroundFormatSelector.value
        )
        backgroundColorPicker.value = ColorUtils.formatColor(
          backgroundColor,
          'hex'
        )
      }
      updatePreview()
    })

    item.appendChild(swatch)
    item.appendChild(description)
    recommendationList.appendChild(item)
  })
}

// Criar botão de alternância de tema claro/escuro
function createThemeToggle() {
  const button = document.createElement('button')
  button.className = 'theme-toggle'
  button.setAttribute('aria-label', 'Alternar tema claro/escuro')
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/>
      <path d="M12 6a6 6 0 1 0 0 12a6 6 0 0 0 0-12z"/>
    </svg>`

  button.addEventListener('click', toggleTheme)
  document.body.appendChild(button)
}

// Alternar entre tema claro e escuro
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-theme')

  // Atualizar ícone do botão
  const toggleButton = document.querySelector('.theme-toggle')
  if (isDark) {
    toggleButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16a8 8 0 0 1 0 16z"/>
        <circle cx="12" cy="12" r="5"/>
      </svg>`
  } else {
    toggleButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16a8 8 0 0 1 0 16z"/>
        <path d="M12 6a6 6 0 1 0 0 12a6 6 0 0 0 0-12z"/>
      </svg>`
  }

  // Salvar preferência do usuário
  localStorage.setItem('darkMode', isDark)
}

// Verificar preferência de tema salva
function checkSavedTheme() {
  const darkMode = localStorage.getItem('darkMode')
  if (darkMode === 'true') {
    document.body.classList.add('dark-theme')

    // Atualizar ícone
    const toggleButton = document.querySelector('.theme-toggle')
    if (toggleButton) {
      toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16a8 8 0 0 1 0 16z"/>
          <circle cx="12" cy="12" r="5"/>
        </svg>`
    }
  }
}

// Inicializar o aplicativo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  init()
  checkSavedTheme()
})
