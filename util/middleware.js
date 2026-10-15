const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'SequelizeValidationError') {
    return response.status(400).json({
      error: error.errors.map(item => item.message)
    })
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    return response.status(400).json({
      error: ['username must be unique']
    })
  }

  if (error.name === 'SequelizeDatabaseError') {
    return response.status(400).json({
      error: [error.message]
    })
  }

  return response.status(500).json({
    error: 'internal server error'
  })
}

module.exports = {
  errorHandler
}