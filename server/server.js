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

    io.in('viewerRoom').emit(
      'sendOnlyQuestion',
      `Question${index + 1}: ${questionAndAnswers.question}`
    )
    io.in('playerRoom').emit('sendQuestion', questionAndAnswers)
  } catch (err) {
    console.log(err)
  }
}

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
    index++
    sendNextQuestion()
    if (ans === correctAnswer) {
      io.in('viewerRoom').emit('correctAnswer', `${ans}(correct) `)
    } else {
      io.in('viewerRoom').emit(
        'correctAnswer',
        `${ans}(wrong) The correct answer is ${correctAnswer}`
      )

    }
    if (index === 5) {
      io.in('playerRoom').emit('end', 'Finished!')
      changePlayer(socket)
    }
  })
  socket.on('disconnect', () => {
    console.log(`client ${socket.id} disconnected`)
    if (socket.id === player) {
      disconnectPlayer(socket)
    }
  })
})

function changePlayer(socket) {
  socket.to('viewerRoom').emit('playerLeaves', 'Player is disconnected')
  socket.leave('playerRoom')
  index = 0
}
function disconnectPlayer(socket) {
  player = undefined
  socket.leave('playerRoom')
  io.in('viewerRoom').emit('playerLeft', 'Player left the room!')
}
server.listen(process.env.PORT || 3000, () =>
  console.log(`Server has started on port 3000.`)
)
