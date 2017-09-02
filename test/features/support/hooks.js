import debug from 'debug'
import {initState} from 'test-helpr'
import {defineSupportCode} from 'cucumber'
/* eslint-disable new-cap */

const dbg = debug('test:support:hooks')
dbg('loaded hooks')

// eslint-disable-next-line no-unused-expressions
require('../../server').default

defineSupportCode(function({Before}) {
  Before(function() {
    try {
      dbg('before: this=%j', this)
      initState()
    } catch (err) {
      dbg('before: caught=%o', err)
      throw err
    }
  })
})
