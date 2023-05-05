# Tiny Ajax

A very simple ajax.

## Install

```shell
npm install --save @mosuzi/tiny-ajax
```

## Usage

```javascript
import TinyAjax from '@mosuzi/tiny-ajax'

const data = { id: 'fakeId' }

// async
const result = TinyAjax.ajax('get', '<api address>', data)
result.then((resp) => {
  // do business actions
})

// sync
const result = TinyAjax.ajax('get', '<api address>', data, { async: false })
// do business actions
```

**`resp.responseData` or `result.responseData` is parsed data**

## Api

### ajax()

```typescript
ajax: (method: string, url: string, params: any, { timeout, async, ignoreRequestInterceptors, ignoreResponseInterceptors }: {
  timeout: number;
  async: boolean;
  ignoreRequestInterceptors: boolean;
  ignoreResponseInterceptors: boolean;
}) => any;
```

- method: Request method, such as `get`
- url: Request url
- params: Request data
- options
  - timeout: Request timeout. Ignored when `async` sets __false__
  - async: Indicates if the request is asynchronous. Defaults to __true__. When set to __false__, `ajax()` return response, otherwise return a promise
  - ignoreRequestInterceptors: Indicates if ignore request interceptors
  - ignoreResponseInterceptors: Indicates if ignore response interceptors

### addInterceptorsRequest()

```typescript
addInterceptorsRequest: (name: string, action: (e: any) => any) => void;
```

- name: Interceptor name
- action: Interceptor

### addInterceptorsResponse()

```typescript
addInterceptorsResponse: (name: string, action: (e: any) => any) => void;
```

- name: Interceptor name
- action: Interceptor

### setAjaxConfig()

```typescript
setAjaxConfig: ({ baseUrl, timeout }?: AjaxConfig) => void;
```

- Params: See `Type/AjaxConfig`

### getAjaxConfig()

```typescript
getAjaxConfig: () => AjaxConfig;
```

- Return value: See `Type/AjaxConfig`

## Type

### AjaxConfig

```typescript
declare type AjaxConfig = {
  baseUrl?: string
  timeout?: number
}
```

- baseUrl: Prefix of request url. When sending request, final url equals to baseUrl splices url _which is specified by `ajax()`_
- timeout: Default value of request timeout
