const http = require('http')
const express = require('express')
const router = require('./router')
const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server)
const path = require('path')
const shuffle = require('shuffle-obj-arrays')
app.use(router)
app.use(express.static(path.join(__dirname, '../client/public')))
const { fetchedApi } = require('./api')
let index = 0
let player = undefined
let correctAnswer = undefined

const sendNextQuestion = async function () {
  let data = await fetchedApi()
  let results = data.data.results
  try {
    questionAndAnswers = {
      index: index + 1,
      question: results[0].question,
      allAnswers: results[0].incorrect_answers.concat([
        results[0].correct_answer,
      ]),
    }
    correctAnswer = results[0].correct_answer
    questionAndAnswers.all_answers = shuffle(questionAndAnswers.all_answers)

    io.in('playerRoom').emit('sendQuestion', questionAndAnswers)
    if (index <= 4) {
      io.in('viewerRoom').emit(
        'sendOnlyQuestion',
        `Question${index + 1}: ${questionAndAnswers.question}`
      )
    } else {
      finishGame()
      countAnswers()
    }
  } catch (err) {
    console.log(err)
  }
}
let correct = 0
let wrong = 0
io.on('connect', (socket) => {
  sendNextQuestion()
  if (player === undefined) {
    socket.join('playerRoom')
    socket.emit('player', 'You are the player!')
    player = socket.id
  } else {
    socket.join('viewerRoom')
    socket.emit('player', 'player is connected')
  }
  console.log(`client with id ${socket.id} connected`)
  socket.on('checkAnswers', (ans) => {
    sendNextQuestion()
    index++

    if (ans === correctAnswer) {
      io.in('viewerRoom').emit('correctAnswer', `${ans}(correct) `)
      correct++
    } else {
      io.in('viewerRoom').emit(
        'correctAnswer',
        `${ans}(wrong) The correct answer is ${correctAnswer}`
      )
      wrong++
    }
  })
  socket.on('disconnect', () => {
    console.log(`client with ${socket.id} disconnected`)
    if (socket.id === player) {
      disconnectPlayer()
    }
  })
})
function finishGame() {
  if (index === 5) {
    player = undefined
    index = 0
    io.emit('playerEnds', 'Quiz Finished!')
  }
}
function countAnswers() {
  io.emit('count', { correct, wrong })
  correct = 0
  wrong = 0
}

function disconnectPlayer() {
  player = undefined
  index = 0
  io.in('viewerRoom').emit('playerdisconnected', `Player left the room!`)
}
server.listen(process.env.PORT || 3000, () =>
  console.log(`Server has started on port 3000.`)
)
