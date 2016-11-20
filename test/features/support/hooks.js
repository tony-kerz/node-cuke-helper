import '../../server'
import debug from 'debug'
//import {initState} from '../../../src/state-helper'
import {initState} from 'test-helpr'
const dbg = debug('test:support:hooks')
dbg('loaded hooks')

export let state = {}

export default function () {
  // this === World
  this.Before(async function(scenario){
    try {
      dbg('before: scenario=%o', scenario.getName())
      initState()
      //initState(this)
      state = this.state
    } catch (error) {
      dbg('before: caught=%o', error)
      throw error
    }
  })
}
