import debug from 'debug'
import assert from 'assert'
import _ from 'lodash'
import axios from 'axios'
import queryString from 'querystring'
import {diffConsole} from 'helpr'
import {evalInContext, isLike, setState, getState, getUrl} from 'test-helpr'

const dbg = debug('app:http:steps')

export default function(context){
  return function(){
    this.Given(/^the following initial state:$/, function (stateString) {
      try {
        const state = evalInContext({js: stateString, context})
        dbg('given-state: state=%o', state)
        setState(state)
      } catch (error) {
        dbg('given-state: caught error=%o', error)
        throw error
      }
    })

    this.When(/^we HTTP GET '([^']+)'$/, async function (path) {
      await httpGet({path, context})
    })

    this.When(/^we HTTP GET '([^']+)' with query '([^']+)'$/, async function (path, query) {
      await httpGet({path, query, context})
    })

    this.When(/^we HTTP (POST|PUT) '([^']+)' with body:$/, async function (action, path, bodyString) {
      const body = evalInContext({js: bodyString, context})
      await httpUpdate({action, path, body, context})
    })

    this.When(/^we HTTP DELETE '([^']+)'$/, async function (path) {
      await httpDelete({path, context})
    })

    this.Then(/^our HTTP response should be '([^']+)'$/, function (expectedString, callback) {
      const expected = evalInContext({js: expectedString, context})
      dbg('then-http-response-should-be: expected=%o', expected)
      const {data: actual} = getState('response')
      if (!_.isEqual(expected, actual)) {
        diffConsole({actual, expected})
        throw new Error('actual != expected')
      }
      callback()
    })

    this.Then(/^our HTTP response should be like:$/, function (expectedString, callback) {
      const expected = evalInContext({js: expectedString, context})
      dbg('then-http-response-should-be-like: expected=%o', expected)
      const {data: actual} = getState('response')
      if (!isLike({expected, actual})) {
        diffConsole({actual, expected})
        throw new Error('actual != expected')
      }
      callback()
    })

    this.Then(/^our HTTP response should have status code (\d+)$/, function (status, callback) {
      const error = getState('response')
      assert.equal(error.status, status)
      callback()
    })

    this.Then(/^our HTTP headers should include '([^']+)'$/, function (header, callback) {
      const response = getState('response')
      assert(_.has(response.headers, header))
      callback()
    })

    this.Then(/^our resultant state should be like:$/, function (expectedString, callback) {
      const expected = evalInContext({js: expectedString, context})
      dbg('our-state-should-be-like: expected=%o, actual=%o', expected, getState())
      const actual= getState()
      if (!isLike({expected, actual})) {
        diffConsole({actual, expected})
        throw new Error('actual != expected')
      }
      callback()
    })
  }
}

async function httpGet({path, query, context}) {
  try {
    const url = getUrl(path, {context})
    // http://stackoverflow.com/a/17829480/2371903
    // const params = JSON.parse(JSON.stringify(queryString.parse(query)))
    // https://github.com/mzabriskie/axios/issues/436
    // https://github.com/mzabriskie/axios/pull/445
    //
    const params = queryString.parse(query)
    dbg('http-get: url=%o, params=%o', url, params)
    const response = await axios.get(url, {params})
    setResponseState(response)
  } catch (error) {
    dbg('caught error=%o', error)
    const {response} =  error  // coerse to response object
    setResponseState(response)
  }
}

async function httpUpdate({action, path, body, context}) {
  try {
    const url = getUrl(path, {context})
    dbg('http-post: action=%o, url=%o, body=%o', action, url, body)
    const response = (action == 'POST') ? await axios.post(url, body) : await axios.put(url, body)
    setResponseState(response)
  } catch (error) {
    dbg('caught error=%o', error)
    const {response} =  error  // coerse to response object
    setResponseState(response)
  }
}

async function httpDelete({path, context}) {
  try {
    const url = getUrl(path, {context})
    dbg('http-delete: url=%o', url)
    const response = await axios.delete(url)
    setResponseState(response)
  } catch (error) {
    dbg('caught error=%o', error)
    const {response} =  error  // coerse to response object
    setResponseState(response)
  }
}

function setResponseState(response){
  setState({response: _.pick(response, ['status', 'headers', 'data'])})
}
