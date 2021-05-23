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

socket.on('end', (finish) => {
  container.innerHTML = ''
  container.appendChild(finishTag).innerHTML = finish
})
socket.on('playerLeft', (end) => {
  container.appendChild(finishTag).innerHTML = end
})
/* socket.on('playerLeaves', (finish) => {
  titleTag.innerHTML = finish
}) */
