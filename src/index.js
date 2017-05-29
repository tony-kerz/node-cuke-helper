import assert from 'assert'
import queryString from 'querystring'
import debug from 'debug'
import config from 'config'
import _ from 'lodash'
import axios from 'axios'
import {defineSupportCode} from 'cucumber'
import {diffConsole, isLike, isLikeHooks} from 'helpr'
import {evalInContext, setState, getState, getUrl} from 'test-helpr'

/* eslint-disable new-cap */

const port = config.get('listener.port')

const dbg = debug('app:http:steps')

export default function(context) {
  defineSupportCode(({Given, When, Then}) => {
    Given('the following initial state:', function(stateString) {
      try {
        const state = evalInContext({js: stateString, context})
        dbg('given-state: state=%o', state)
        setState(state)
      } catch (err) {
        dbg('given-state: caught error=%o', err)
        throw err
      }
    })

    Given('we set the following HTTP headers:', function(headerString) {
      try {
        const headers = evalInContext({js: headerString, context})
        dbg('given-headers: headers=%o', headers)
        setState({headers})
      } catch (err) {
        dbg('given-headers: caught error=%o', err)
        throw err
      }
    })

    When('we HTTP GET "{path}"', async function(path) {
      await httpGet({path, context})
    })

    When('we HTTP GET "{path}" with query "{query}"', async function(path, query) {
      await httpGet({path, query, context})
    })

    When(/^we HTTP (POST|PUT) "([^"]+)" with body:$/, async function(action, path, bodyString) {
      const body = evalInContext({js: bodyString, context})
      await httpUpdate({action, path, body, context})
    })

    When('we HTTP DELETE "{path}"', async function(path) {
      await httpDelete({path, context})
    })

    Then('our HTTP response should be "{response}"', function(expectedString, callback) {
      const expected = evalInContext({js: expectedString, context})
      dbg('then-http-response-should-be: expected=%o', expected)
      const {data: actual} = getState('response')
      if (!_.isEqual(expected, actual)) {
        diffConsole({actual, expected})
        throw new Error('actual != expected')
      }
      callback()
    })

    Then('our HTTP response should be like:', function(expectedString, callback) {
      const expected = evalInContext({js: expectedString, context})
      dbg('then-http-response-should-be-like: expected=%o', expected)
      const {data: actual} = getState('response')
      if (!isLike({expected, actual, hooks: [isLikeHooks.assert]})) {
        diffConsole({actual, expected})
        throw new Error('actual != expected')
      }
      callback()
    })

    Then('our HTTP response should have status code {status}', function(status, callback) {
      const error = getState('response')
      assert.equal(error.status, status)
      callback()
    })

    Then('our HTTP headers should include "{header}"', function(header, callback) {
      const response = getState('response')
      assert(_.has(response.headers, header))
      callback()
    })

    Then('our resultant state should be like:', function(expectedString, callback) {
      const expected = evalInContext({js: expectedString, context})
      dbg('our-state-should-be-like: expected=%o, actual=%o', expected, getState())
      const actual = getState()
      if (!isLike({expected, actual})) {
        diffConsole({actual, expected})
        throw new Error('actual != expected')
      }
      callback()
    })
  })
}

async function httpGet({path, query, context}) {
  try {
    const url = getUrl(path, {context, port})
    // http://stackoverflow.com/a/17829480/2371903
    // const params = JSON.parse(JSON.stringify(queryString.parse(query)))
    // https://github.com/mzabriskie/axios/issues/436
    // https://github.com/mzabriskie/axios/pull/445
    //
    const params = queryString.parse(query)
    const headers = getState('headers')
    dbg('http-get: url=%o, params=%o, headers=%o', url, params, headers)
    const response = await axios.get(url, {params, headers})
    setResponseState(response)
  } catch (err) {
    dbg('caught error=%o', err)
    const {response} = err // coerse to response object
    setResponseState(response)
  }
}

async function httpUpdate({action, path, body, context}) {
  try {
    const url = getUrl(path, {context, port})
    const headers = getState('headers')
    dbg('http-post: action=%o, url=%o, body=%o, headers=%o', action, url, body, headers)
    const response = action === 'POST' ? await axios.post(url, body, {headers}) : await axios.put(url, body, {headers})
    setResponseState(response)
  } catch (err) {
    dbg('caught error=%o', err)
    const {response} = err // coerse to response object
    setResponseState(response)
  }
}

async function httpDelete({path, context}) {
  try {
    const url = getUrl(path, {context, port})
    const headers = getState('headers')
    dbg('http-delete: url=%o, headers=%o', url, headers)
    const response = await axios.delete(url, {headers})
    setResponseState(response)
  } catch (err) {
    dbg('caught error=%o', err)
    const {response} = err // coerse to response object
    setResponseState(response)
  }
}

function setResponseState(response) {
  setState({response: _.pick(response, ['status', 'headers', 'data'])})
}
