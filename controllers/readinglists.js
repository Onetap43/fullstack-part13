const router = require('express').Router()
const { Blog, User, ReadingList } = require('../models')
const { tokenExtractor } = require('../util/middleware')

router.post('/', async (req, res, next) => {
  try {
    const { blogId, userId } = req.body || {}
    if (!Number.isInteger(blogId) || !Number.isInteger(userId) || blogId < 1 || userId < 1) {
      return res.status(400).json({ error: 'valid blogId and userId are required' })
    }
    const [blog, user] = await Promise.all([Blog.findByPk(blogId), User.findByPk(userId)])
    if (!blog) return res.status(404).json({ error: 'blog not found' })
    if (!user) return res.status(404).json({ error: 'user not found' })
    const existing = await ReadingList.findOne({ where: { blogId, userId } })
    if (existing) return res.status(400).json({ error: 'blog is already in reading list' })
    const entry = await ReadingList.create({ blogId, userId })
    res.status(201).json(entry)
  } catch (error) { next(error) }
})

router.put('/:id', tokenExtractor, async (req, res, next) => {
  try {
    const entry = await ReadingList.findByPk(req.params.id)
    if (!entry) return res.status(404).json({ error: 'reading list entry not found' })
    if (entry.userId !== req.authenticatedUser.id) {
      return res.status(401).json({ error: 'not your reading list entry' })
    }
    if (typeof req.body.read !== 'boolean') {
      return res.status(400).json({ error: 'read must be true or false' })
    }
    entry.read = req.body.read
    await entry.save()
    res.json(entry)
  } catch (error) { next(error) }
})

module.exports = router
