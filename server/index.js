const path = require('path')
const express = require('express')
const app = express()

const PORT = 3000
const HOST = '127.0.0.1'

app.use('/assets', express.static(path.resolve(__dirname, '..', 'public')))

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'public', 'views', 'index.html'))
})

app.listen(PORT, function () {
  console.log(`Server is listening at http://${HOST}:${PORT}`)
})
