const express = require('express')
const { PORT, SECRET } = require('./util/config')
const { connectToDatabase } = require('./util/db')
require('./models')
const { errorHandler } = require('./util/middleware')

const app = express()
app.use(express.json())
app.get('/', (req, res) => res.status(200).send('ok'))
app.use('/api/blogs', require('./controllers/blogs'))
app.use('/api/users', require('./controllers/users'))
app.use('/api/login', require('./controllers/login'))
app.use('/api/logout', require('./controllers/logout'))
app.use('/api/authors', require('./controllers/authors'))
app.use('/api/readinglists', require('./controllers/readinglists'))
app.use('/api/reset', require('./controllers/reset'))
app.use(errorHandler)

const start = async () => {
  if (!SECRET) throw new Error('SECRET missing in environment')
  await connectToDatabase()
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

start().catch(error => {
  console.error('Server startup failed:', error.message)
  process.exit(1)
})
