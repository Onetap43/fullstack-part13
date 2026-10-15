const { Op } = require('sequelize')
const router = require('express').Router()
const { Blog, User } = require('../models')
const { tokenExtractor } = require('../util/middleware')

const blogFinder = async (req, res, next) => {
  try {
    req.blog = await Blog.findByPk(req.params.id)
    if (!req.blog) return res.status(404).end()
    next()
  } catch (error) { next(error) }
}

router.get('/', async (req, res, next) => {
  try {
    const where = {}
    if (req.query.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${req.query.search}%` } },
        { author: { [Op.iLike]: `%${req.query.search}%` } }
      ]
    }
    const blogs = await Blog.findAll({
      where,
      include: { model: User, attributes: ['id', 'username', 'name'] },
      order: [['likes', 'DESC']]
    })
    res.json(blogs)
  } catch (error) { next(error) }
})

router.post('/', tokenExtractor, async (req, res, next) => {
  try {
    const { title, author, url, likes, year } = req.body || {}
    const blog = await Blog.create({
      title, author, url, likes, year, userId: req.authenticatedUser.id
    })
    res.status(201).json(blog)
  } catch (error) { next(error) }
})

router.put('/:id', blogFinder, async (req, res, next) => {
  try {
    const updates = {}
    if (Object.prototype.hasOwnProperty.call(req.body, 'likes')) updates.likes = req.body.likes
    if (Object.prototype.hasOwnProperty.call(req.body, 'year')) updates.year = req.body.year
    await req.blog.update(updates)
    res.json(req.blog)
  } catch (error) { next(error) }
})

router.delete('/:id', tokenExtractor, blogFinder, async (req, res, next) => {
  try {
    if (req.blog.userId !== req.authenticatedUser.id) {
      return res.status(403).json({ error: 'only the creator can delete this blog' })
    }
    await req.blog.destroy()
    res.status(204).end()
  } catch (error) { next(error) }
})

module.exports = router
