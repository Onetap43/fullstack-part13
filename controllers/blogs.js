const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')
const router = require('express').Router()

const { Blog, User } = require('../models')
const { SECRET } = require('../util/config')

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')

  if (
    authorization &&
    authorization.toLowerCase().startsWith('bearer ')
  ) {
    try {
      request.decodedToken = jwt.verify(
        authorization.substring(7),
        SECRET
      )
    } catch (error) {
      return response.status(401).json({
        error: 'token invalid'
      })
    }
  } else {
    return response.status(401).json({
      error: 'token missing'
    })
  }

  next()
}

const blogFinder = async (request, response, next) => {
  try {
    request.blog = await Blog.findByPk(request.params.id)

    if (!request.blog) {
      return response.status(404).end()
    }

    next()
  } catch (error) {
    next(error)
  }
}

router.get('/', async (request, response, next) => {
  try {
    const where = {}

    if (request.query.search) {
      where[Op.or] = [
        {
          title: {
            [Op.iLike]: `%${request.query.search}%`
          }
        },
        {
          author: {
            [Op.iLike]: `%${request.query.search}%`
          }
        }
      ]
    }

    const blogs = await Blog.findAll({
      where,
      include: {
        model: User,
        attributes: ['id', 'username', 'name']
      },
      order: [['likes', 'DESC']]
    })

    response.json(blogs)
  } catch (error) {
    next(error)
  }
})

router.post('/', tokenExtractor, async (request, response, next) => {
  try {
    const user = await User.findByPk(request.decodedToken.id)

    if (!user) {
      return response.status(401).json({
        error: 'user not found'
      })
    }

    const blog = await Blog.create({
      ...request.body,
      userId: user.id
    })

    response.json(blog)
  } catch (error) {
    next(error)
  }
})

router.put('/:id', blogFinder, async (request, response, next) => {
  try {
    request.blog.likes = request.body.likes
    await request.blog.save()

    response.json(request.blog)
  } catch (error) {
    next(error)
  }
})

router.delete(
  '/:id',
  tokenExtractor,
  blogFinder,
  async (request, response, next) => {
    try {
      if (request.blog.userId !== request.decodedToken.id) {
        return response.status(403).json({
          error: 'only the creator can delete this blog'
        })
      }

      await request.blog.destroy()
      response.status(204).end()
    } catch (error) {
      next(error)
    }
  }
)

module.exports = router