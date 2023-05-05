import { AjaxConfig } from './types/index'

/* eslint-disable indent */
const ajaxConfig: AjaxConfig = {
  baseUrl: '',
  timeout: 15000
}

const requestInterceptors = []

const responseInterceptors = []

const setAjaxConfig = function ({ baseUrl, timeout }: AjaxConfig = {}): void {
  try {
    Object.assign(ajaxConfig, { baseUrl, timeout })
  } catch (e) {
    console.error(e)
  }
}

const getAjaxConfig = function () {
  return ajaxConfig
}

const parseResponse = function (request) {
  let responseData = null
  try {
    responseData = JSON.parse(request.responseText)
  } catch (e) {
    responseData = request.responseText
  }
  request.responseData = responseData
}

const addInterceptorsRequest = function (name: string, action: (e: any) => any) {
  const i = requestInterceptors.findIndex(item => item.name === name)
  if (~i) requestInterceptors.push({ name, action })
  else requestInterceptors.splice(i, 1, { name, action })
}

const addInterceptorsResponse = function (name: string, action: (e: any) => any) {
  const i = responseInterceptors.findIndex(item => item.name === name)
  if (~i) responseInterceptors.push({ name, action })
  else responseInterceptors.splice(i, 1, { name, action })
}

const ajax = function (
  method: string,
  url: string,
  params: any,
  {
    timeout,
    async = true,
    ignoreRequestInterceptors = false,
    ignoreResponseInterceptors = false
  }: {
    timeout: number
    async: boolean
    ignoreRequestInterceptors: boolean
    ignoreResponseInterceptors: boolean
  }
) {
  let result

  const responseInterceptor = (response, reject) => {
    return ignoreResponseInterceptors
      ? response
      : responseInterceptors.reduceRight((prev, next) => {
          if (next && next.action instanceof Function) {
            try {
              const result = next.action(prev)
              return result
            } catch (e) {
              reject(e)
            }
          } else {
            return prev
          }
        }, response)
  }

  const syncSolveResponse = response => {
    parseResponse(response)
    return responseInterceptor(response, e => {
      throw new Error(e)
    })
  }

  const request = new XMLHttpRequest()
  if (url.startsWith('/')) {
    url = ajaxConfig.baseUrl + url
  }
  request.open(method, url, async)
  if (params && params.headers) {
    try {
      Object.keys(params.headers).forEach(key => {
        request.setRequestHeader(key, params.headers[key])
      })
      delete params.headers
    } catch (e) {
      // do nothing
    }
  }
  if (async) {
    request.timeout = timeout || ajaxConfig.timeout
    result = new Promise((resolve, reject) => {
      const errorOccurred = e => {
        console.error({ e, request })
        reject(new Error('Error Occurred While Requesting'))
      }
      request.onerror = errorOccurred
      request.ontimeout = errorOccurred
      request.onload = e => {
        parseResponse(request)
        if (request.status !== 200) {
          console.error({ e, request })
          reject(new Error('Error Occurred Due to Non-200 Status'))
        } else {
          const solved = responseInterceptor(request, reject)
          resolve(solved)
        }
      }
    })
  }
  const solved = ignoreRequestInterceptors
    ? request
    : requestInterceptors.reduce((prev, next) => {
        try {
          const result = next.action(prev)
          return result
        } catch (e) {
          return prev
        }
      }, request)
  if (solved instanceof Error) return async ? Promise.reject(solved) : solved
  try {
    request.send(params)
  } catch (e) {
    return e
  }
  return async ? result : syncSolveResponse(request)
}

export default {
  ajax,
  addInterceptorsRequest,
  addInterceptorsResponse,
  setAjaxConfig,
  getAjaxConfig
}
