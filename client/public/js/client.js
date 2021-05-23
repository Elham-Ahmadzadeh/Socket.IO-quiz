const socket = io()

const container = document.querySelector('#container')
const question = document.createElement('h3')
const titleTag = document.createElement('h1')
const btnContainer = document.createElement('div')
const finishTag = document.createElement('h1')

socket.on('player', (msg) => {
  container.appendChild(titleTag).textContent = msg
})
socket.on('sendQuestion', (q) => {
  container.appendChild(question).innerHTML = q.question
  btnContainer.innerHTML = ''
  q.allAnswers.forEach((answer) => {
    container.appendChild(btnContainer)
    const button = document.createElement('button')
    btnContainer.appendChild(button).innerHTML = answer
    button.onclick = function checkAnswers() {
      //send msg to backend
      socket.emit('checkAnswers', button.innerHTML)
      button.type = 'submit'
    }
  })
})
socket.on('correctAnswer', (ans) => {
  const pTag = document.createElement('p')
  container.appendChild(pTag).textContent = `Player answered: ${ans}`
})
socket.on('sendOnlyQuestion', (res) => {
  const divTag = document.createElement('div')
  container.appendChild(divTag)
  const onlyQuestion = document.createElement('h2')
  divTag.appendChild(onlyQuestion).innerHTML = res
})
socket.on('playerEnds', (finish) => {
  container.innerHTML = ''
  container.appendChild(finishTag).innerHTML = finish
})

socket.on('count', (answer) => {
  const countAnsTag = document.createElement('div')
  countAnsTag.className = 'CountGame'
  container.appendChild(countAnsTag)
  const correctPTag = document.createElement('p')
  const wrongPTag = document.createElement('p')
  countAnsTag.appendChild(
    correctPTag
  ).innerHTML = `Correct answers: ${answer.correct}`
  countAnsTag.appendChild(
    wrongPTag
  ).innerHTML = `Wrong answers: ${answer.wrong}`
})
socket.on('playerdisconnected', (msg) => {
  const pTag = document.createElement('p')
  countAnsTag.appendChild(pTag).innerHTML = msg
})
socket.on('playerLeft', (end) => {
  container.innerHTML = ''
  container.appendChild(finishTag).innerHTML = end
})
