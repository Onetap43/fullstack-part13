const router = require('express').Router()
const { User, Blog } = require('../models')

router.get('/', async (req, res, next) => {
  try {
    const users = await User.findAll({ include: { model: Blog } })
    res.json(users)
  } catch (error) { next(error) }
})

router.post('/', async (req, res, next) => {
  try {
    const { username, name } = req.body || {}
    const user = await User.create({ username, name })
    res.status(201).json(user)
  } catch (error) { next(error) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const through = { attributes: ['id', 'read'] }
    if (req.query.read === 'true') through.where = { read: true }
    else if (req.query.read === 'false') through.where = { read: false }
    else if (req.query.read !== undefined) {
      return res.status(400).json({ error: 'read must be true or false' })
    }

    const user = await User.findByPk(req.params.id, {
      include: [
        { model: Blog },
        { model: Blog, as: 'readings', through, required: false }
      ]
    })
    if (!user) return res.status(404).end()
    res.json(user)
  } catch (error) { next(error) }
})

router.put('/:username', async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { username: req.params.username } })
    if (!user) return res.status(404).end()
    if (req.body.name !== undefined) user.name = req.body.name
    await user.save()
    res.json(user)
  } catch (error) { next(error) }
})

module.exports = router
