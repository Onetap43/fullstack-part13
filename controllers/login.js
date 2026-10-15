const jwt = require('jsonwebtoken')
const { randomUUID } = require('node:crypto')
const router = require('express').Router()
const { User, Session } = require('../models')
const { SECRET } = require('../util/config')

router.post('/', async (req, res, next) => {
  try {
    const { username } = req.body || {}
    if (!username) return res.status(401).json({ error: 'invalid username' })
    const user = await User.findOne({ where: { username } })
    if (!user) return res.status(401).json({ error: 'invalid username' })
    if (user.disabled) return res.status(401).json({ error: 'account disabled' })

    // This course project has no password field in its user model.
    // Upgrade to hashed password verification before any real deployment.
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, {
      jwtid: randomUUID(), expiresIn: '7d'
    })
    await Session.create({ userId: user.id, token })
    res.json({ token, username: user.username, name: user.name })
  } catch (error) { next(error) }
})

module.exports = router
