import pino from 'pino'

const streams = [
  {level: 'info', stream: process.stdout},
  {level: 'warn', stream: pino.destination('src/logs/warn.log')},
  {level: 'error', stream: pino.destination('src/logs/error.log')}
]

const logger = pino({}, pino.multistream(streams))

/*
Pino log levels:
fatal
error
warn
info
debug
trace
*/

export function reqLogger(req, res, next) {
  logger.info(`${new Date()} ${req.method} ${req.url}`)
  next()
}

export function noRouteLogger(req, res, next) {
  logger.warn(`${new Date()} ${req.method} ${req.url}`)
  next()
}

export function apiErrorLogger(req, res, next) {
  logger.error(`${new Date()} ${req.method} ${req.url} ${req.apiError}`)
  next()
}