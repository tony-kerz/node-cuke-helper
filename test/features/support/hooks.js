import debug from 'debug'
import {initState} from 'test-helpr'

/* eslint-disable new-cap */

const dbg = debug('test:support:hooks')
dbg('loaded hooks')

// eslint-disable-next-line import/no-mutable-exports
export let state = {}

export default function () {
  // this === World
  this.BeforeFeatures(function () {
    dbg('before-features...')
    // eslint-disable-next-line no-unused-expressions
    require('../../server').default
  })

  this.Before(async function (scenario) {
    try {
      dbg('before: scenario=%o', scenario.getName())
      initState()
      // initState(this)
      state = this.state
    } catch (err) {
      dbg('before: caught=%o', err)
      throw err
    }
  })
}
