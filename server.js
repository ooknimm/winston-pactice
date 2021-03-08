const http = require('http')
const express = require('express')
const morgan = require('morgan')
const winston = require('winston')
const fs = require('fs')
const datetime = require('node-datetime')
const { ConsoleTransportOptions } = require('winston/lib/winston/transports')

const logDir = './logs'

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir)
}

const nowDatetime = () => {
  let now = datetime.create();
  return now.format('Y-m-d H:M:S.N');
};


const errorFilter = winston.format( (info, opts) => {
  return info.level === 'error' ? false : info;
})

const infoTransport = new winston.transports.File({
  filename: 'info.log',
  dirname: logDir,
  level: 'info',
  format: winston.format.combine(
    errorFilter(),
    winston.format.printf((i) =>{ return `${nowDatetime()} - ${i.level.toUpperCase()} - ${i.message} `}),

  )
});

const errorTransport = new winston.transports.File({
  filename: 'error.log',
  dirname: logDir,
  level: 'error',
  format: winston.format.printf(i => `${nowDatetime()} - ${i.level.toUpperCase()} - ${i.message} `),
});

const consoleTransport = new winston.transports.Console({
  format: winston.format.printf(i => `${nowDatetime()} - ${i.level.toUpperCase()} - ${i.message} `)
});


const logger =
  winston.createLogger({
    transports: [infoTransport, errorTransport, consoleTransport]
  })
  

const stream = {
  write: message => {
      logger.info(message)
  }
};


const app = express()

app.use(express.json())
app.use(morgan('combined', { stream }))



const server = http.createServer(app)



app.get('/', async (req, res) => {
  try {
    const { key } = req.body
    if (!key) {
      const err = new Error('bad request..................')
      err.status = 400
      throw err
    }
    res.status(200).json({message:'good!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'})
  } catch(err) {
    logger.error(err)
    res.status(err.status).json({message: err.message})
  }
})



const startServer = () => {
  server.listen(8000, console.log('server start!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'))
}


startServer()