let elementType = 'line'
let lockApplicationState = false

const lineElement = document.getElementById('line')
const rectangleElement = document.getElementById('rectangle')
const diamondElement = document.getElementById('diamond')
const pencilElement = document.getElementById('pencil')
const eraserElement = document.getElementById('eraser')
const circleElement = document.getElementById('circle')


lineElement.addEventListener('click', function () {
  elementType = 'line'
})

rectangleElement.addEventListener('click', function () {
  elementType = 'rectangle'
})

diamondElement.addEventListener('click', function () {
  elementType = 'diamond'
})

pencilElement.addEventListener('click', function () {
  elementType = 'pencil'
})

circleElement.addEventListener('click', function () {
  elementType = 'circle'
})

eraserElement.addEventListener('click', function () {
  elementType = 'eraser'
})

let drawing = false
const elements = []

const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const roughCanvas = rough.canvas(canvas)
const generator = roughCanvas.generator

function createElement(x1, y1, x2, y2) {
  if (elementType === 'line') {
    const roughElement = generator.line(x1, y1, x2, y2)
    return { x1, y1, x2, y2, roughElement, elementType }
  }
  else if (elementType === 'rectangle') {
    const roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1)
    return { x1, y1, x2, y2, roughElement, elementType }
  }
}

function render() {
  context.clearRect(0, 0, canvas.width, canvas.height)
  elements.forEach(({ roughElement }) => {
    roughCanvas.draw(roughElement)
  })
}

function mouseDown(e) {
  if (lockApplicationState) return
  drawing = true
  console.log(elementType)
  const { clientX, clientY } = e
  const element = createElement(clientX, clientY, clientX, clientY)
  elements.push(element)
  render()
}

function mouseMove(e) {
  if (!drawing) return
  if (lockApplicationState) return

  const { clientX, clientY } = e
  const last = elements.length - 1
  const { x1, y1 } = elements[last]

  const updatedElement = createElement(x1, y1, clientX, clientY)
  elements[last] = updatedElement
  render()
}

function mouseUp() {
  drawing = false
}

canvas.addEventListener('pointerdown', mouseDown)
canvas.addEventListener('pointermove', mouseMove)
canvas.addEventListener('pointerup', mouseUp)

const lockState = document.getElementById('lock-state-container')

const unlock = document.getElementById('unlock')
const lock = document.getElementById('lock')

lockState.addEventListener('click', function () {
  lockState.classList.toggle('bg-black')
  lockState.classList.toggle('bg-violet-200')
  lockState.classList.toggle('text-violet-200')
  lockState.classList.toggle('text-black')

  unlock.classList.toggle('hidden')
  unlock.classList.toggle('flex')

  lock.classList.toggle('flex')
  lock.classList.toggle('hidden')
  lockApplicationState = !lockApplicationState
})
