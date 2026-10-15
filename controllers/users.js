const router = require('express').Router()

const { User, Blog } = require('../models')

router.get('/', async (request, response, next) => {
  try {
    const users = await User.findAll({
      include: {
        model: Blog
      }
    })

    response.json(users)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (request, response, next) => {
  try {
    const { username, name } = request.body

    const user = await User.create({
      username,
      name
    })

    response.json(user)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (request, response, next) => {
  try {
    const user = await User.findByPk(request.params.id, {
      include: {
        model: Blog
      }
    })

    if (!user) {
      return response.status(404).end()
    }

    response.json(user)
  } catch (error) {
    next(error)
  }
})

router.put('/:username', async (request, response, next) => {
  try {
    const user = await User.findOne({
      where: {
        username: request.params.username
      }
    })

    if (!user) {
      return response.status(404).end()
    }

    user.name = request.body.name
    await user.save()

    response.json(user)
  } catch (error) {
    next(error)
  }
})

module.exports = router