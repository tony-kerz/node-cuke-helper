// eslint-disable-next-line import/no-unassigned-import
import 'babel-polyfill'
import express from 'express'
import bodyParser from 'body-parser'
import debug from 'debug'
import config from 'config'
import _ from 'lodash'
import {getState} from 'test-helpr'

const dbg = debug('test:server')
const app = express()
app.use(bodyParser.json())

process.on('unhandledRejection', err => {
  dbg('unhandled-rejection: %o', err)
  process.exit(1)
})

app.get('/', (req, res) => {
  dbg('index: state=%o', getState())
  res.send(getState('data'))
})

app.get('/:id', (req, res) => {
  dbg('get: params=%o, state=%o', req.params, getState())
  const result = _.find(getState('data'), {_id: req.params.id})
  result ? res.send(result) : res.status(404).send('not found')
})

app.post('/', (req, res) => {
  dbg('post: body=%o', req.body)
  getState('data').push(req.body)
  dbg('post: state=%o', getState())
  res.status(201).send('created')
})

app.put('/:id', (req, res) => {
  dbg('put: id=%o, body=%o', req.params.id, req.body)
  const data = getState('data')
  const idx = _.findIndex(data, {_id: req.params.id})
  if (idx < 0) {
    res.status(404).send('not found')
  } else {
    data[idx] = req.body
    dbg('put: state=%o', getState())
    res.status(204).send('updated')
  }
})

app.delete('/:id', (req, res) => {
  dbg('delete: id=%o', req.params.id)
  const data = getState('data')
  const idx = _.findIndex(data, {_id: req.params.id})
  if (idx < 0) {
    res.status(404).send('not found')
  } else {
    data.splice(idx, 1)
    dbg('delete: state=%o', getState())
    res.status(204).send('updated')
  }
})

// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next) {
  dbg(err.stack)
  res.status(500).send(`error: ${err}`)
})

const port = config.get('listener.port')
app.listen(port, () => {
  dbg('listening on port=%o', port)
})
