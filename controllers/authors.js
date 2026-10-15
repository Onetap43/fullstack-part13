const router = require('express').Router()
const { fn, col } = require('sequelize')

const { Blog } = require('../models')

router.get('/', async (request, response, next) => {
  try {
    const authors = await Blog.findAll({
      attributes: [
        'author',
        [fn('COUNT', col('id')), 'blogs'],
        [fn('SUM', col('likes')), 'likes']
      ],
      group: ['author'],
      order: [[fn('SUM', col('likes')), 'DESC']],
      raw: true
    })

    response.json(authors)
  } catch (error) {
    next(error)
  }
})

module.exports = router