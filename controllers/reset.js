const router = require('express').Router()
const { sequelize } = require('../util/db')

router.post('/', async (req, res, next) => {
  if (process.env.TESTING !== 'true') {
    return res.status(403).json({ error: 'reset is only available in test mode' })
  }
  try {
    await sequelize.query('TRUNCATE TABLE sessions, reading_lists, blogs, users RESTART IDENTITY CASCADE')
    res.status(204).end()
  } catch (error) { next(error) }
})

module.exports = router
