const axios = require('axios')
const url = 'https://opentdb.com/api.php?amount=1&difficulty=easy&type=multiple'


const fetchedApi = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await axios.get(url)
      resolve(res)
      res.data.results
    } catch (err) {
      return reject(err.message)
    }
  })
}

module.exports = {
  fetchedApi
}
