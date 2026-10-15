const jwt = require('jsonwebtoken')
const { SECRET } = require('./config')

const tokenExtractor = async (req, res, next) => {
  const authorization = req.get('authorization')
  if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'token missing' })
  }
  const token = authorization.substring(7)
  let decoded
  try {
    decoded = jwt.verify(token, SECRET)
  } catch (_error) {
    return res.status(401).json({ error: 'token invalid' })
  }
  try {
    const { User, Session } = require('../models')
    const user = await User.findByPk(decoded.id)
    if (!user || user.disabled) {
      return res.status(401).json({ error: 'account disabled or user not found' })
    }
    const session = await Session.findOne({ where: { token, userId: user.id } })
    if (!session) return res.status(401).json({ error: 'session expired' })
    req.decodedToken = decoded
    req.authenticatedUser = user
    next()
  } catch (error) {
    next(error)
  }
}

const errorHandler = (error, req, res, next) => {
  console.error(error.message)
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ error: error.errors?.map(e => e.message) || ['duplicate value'] })
  }
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: error.errors.map(e => e.message) })
  }
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ error: 'invalid reference' })
  }
  if (error.name === 'SequelizeDatabaseError') {
    return res.status(400).json({ error: 'invalid database value' })
  }
  res.status(500).json({ error: 'internal server error' })
}

module.exports = { tokenExtractor, errorHandler }
