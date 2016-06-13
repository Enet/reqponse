# reqponse
This module provides the class to combine request and response objects into a single entity - reqponse. On the one hand it parses request and makes the access to form data, url components, cookie and headers really easy. On the other hand reqponse contains some methods to make the most often actions with response.

## How to install
Just type `npm install reqponse` and start using the module:
```javascript
'use strict';
let http = require('http'),
    reqponse = require('reqponse');

http.createServer((request, response) => {
    let $ = new reqponse.Reqponse(request, response);
    $.parse(error => {
        if (error) {
            $.status = 500;
            $.error(error).send();
        } else {
            /* Now you can use the instance of Reqponse class */
            let headerName = $.get.headerName || 'cookie',
                headerValue = $.header.get(headerName);

            $.echo('name: ' + headerName + '\n');
            $.echo('value: ' + headerValue);

            $.header.set('Content-Type', 'text/plain');
            $.send();
        }
    });
}).listen(80);
```

## Reqponse
### $ = new Reqponse(request, response)
Constructor of Reqponse class returns a request-response object, so-called reqponse.

**returns $**

### $.request and $.response
These properties just store original request and response objects, passed in constructor.

### $.method
This property is a string, containing the method's name of the request in upper case.

### $.status
This property is a number, a status of the further response (by default is equal 200).

### $.url
This property is an object, including parsed URL of the request:
+ **original** - it is the same as `$.request.url`;
+ **parsed** - it is the same as `require('url').parse($.request.url)`;
+ **pathname** - it is the same as `$.url.parsed.pathname`;
+ **splitted** - it is the pathname, splitted by `/`.

### $.get or $.post and $.files
To get access to form data you need to call `$.parse` method. It stores all fields in the property, named according with `$.method`. All files are saved to `$.files` variable.

### $.header
This property is an instance of Header class (read below).

### $.cookie
This property is an instance of Cookie class (read below).

### $.parse(callback, config)
Parses form data and stores it in the reqponse object. Formidable module is used under the hood, `config` (optional) is passed into one. Callback gets only one parameter - occurred error or null.

**returns $**

### $.echo(text)
This method adds text to the buffer.

**returns $**

### $.clear()
This method clears the buffer.

**returns $**

### $.debug(anything1, anything2, ...)
This method adds to the buffer debugging information about each argument (`util.inspect` uses). It is useful to debug your application in the browser.

**returns $**

### $.error(error)
This method adds to the buffer callstack of occurred error. It is userful to catch errors in the browser.

**returns $**

### $.send()
This method does following:
+ sets header `Set-Cookie`, containing cookie from `$.Cookie`;
+ sets status for the response as `$.status`;
+ sets headers for the response from `$.Header`;
+ writes buffer in the response;
+ ends the response.

**returns $**

## Header
### $.header = new Header(headers)
The constructor of the Header class gets `$.request.headers`, parses and stores ones.

**returns $.header**

### $.header.get(name)
This method returns the value of a request-header with `name`. Remember, that name is lower case. If required header doesn't exist in the request, `undefined` is returned.

**returns string**

### $.header.set(name, value)
This method sets the response-header `name` to `value`. Case doesn't matter. Note that you don't need specify `Set-Cookie` header (it is done automatically).

**returns $.header**

### $.header.toHeader()
Returns an object, containing all headers specified for the response.

**returns object**

## Cookie
### $.cookie = new Cookie(cookies)
The constructor of the Cookie class gets `Utils.splitIntoPairs($.request.headers.cookie, '; ')` and stores ones.

**returns $.cookie**

### $.cookie.get(name)
This method returns the value of a request-cookie with `name`. If required cookie doesn't exist in the request, `undefined` is returned.

**returns string**

### $.cookie.set(name, value, timeout, path, domain, secure, httponly)
This method sets the response-cookie:
+ `name` (required) is a cookie's name.
+ `value` (required) is a cookie's value.
+ `timeout` (optional) is a cookie's lifetime. Cookie expires after `timeout` seconds (by default cookie lives only within a current session).
+ `path` (optional) is a cookie's path. By default it is equal `/`.
+ `domain` (optional) is a cookie's domain.
+ `secure` (optional) is a boolean flag, which says to set cookie only if HTTPS uses. It is `false` by default.
+ `httponly` (optional) is a boolean flag, which denies use cookie from javascript. It is `false` by default.

**returns $.cookie**

### $.cookie.toString(name)
Returns cookie with `name` as a string.

**returns string**

### $.cookie.toHeader()
Returns an object with a single property `Set-Cookie`, whose value contains all cookies for the response.

**returns object**

## Utils
### splitIntoPairs(string, delim)
This method splits the `string` by `delim`, then splits each substring by `=`. Left part is a key, right part is a value of a resulting object.

**returns object**

### wrapDebugInfo(string)
This method wraps the `string` for a beautiful display of debugging information.

**returns string**

## Colors
It is an array, containing colors of debugging messages. By default the value is:
`['#DD0011', '#F17217', '#DAA520', '#5BA51E', '#009C9F', '#1453FF', '#8A2BE2']`
