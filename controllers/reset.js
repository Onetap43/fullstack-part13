const router = require('express').Router()

const { sequelize } = require('../util/db')

router.post('/', async (request, response, next) => {
  try {
    await sequelize.query(
      'TRUNCATE TABLE blogs, users RESTART IDENTITY CASCADE'
    )

    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

module.exports = router