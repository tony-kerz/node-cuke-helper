import debug from 'debug'
import {initState} from 'test-helpr'
import {defineSupportCode} from 'cucumber'

/* eslint-disable new-cap */

const dbg = debug('test:support:hooks')
dbg('loaded hooks')

// eslint-disable-next-line import/no-mutable-exports,import/prefer-default-export
// export let state = {}

defineSupportCode(({registerHandler}) => {
  registerHandler('BeforeFeatures', () => {
    dbg('before-features...')
    // eslint-disable-next-line no-unused-expressions
    require('../../server').default
  })

  registerHandler('BeforeScenario', scenario => {
    try {
      dbg('before: scenario=%o', scenario.name)
      initState()
      // state = this.state
    } catch (err) {
      dbg('before: caught=%o', err)
      throw err
    }
  })
})
