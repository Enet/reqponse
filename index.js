'use strict';

let url = require('url'),
    qs = require('querystring'),
    util = require('util'),
    formidable = require('formidable');

class Reqponse {
    constructor (request, response) {
        this.request = request;
        this.response = response;

        this.method = request.method.toUpperCase();
        this.status = 200;

        this.url = {};
        this.url.original = request.url;
        this.url.parsed = url.parse(this.url.original);
        this.url.pathname = this.url.parsed.pathname;
        this.url.splitted = this.url.pathname.substr(1).split('/');
        this.url.params = qs.parse(this.url.parsed.query);

        this.header = new Header(request.headers);
        this.cookie = new Cookie(Utils.splitIntoPairs(request.headers.cookie, '; '));

        this._buffer = '';
    }

    parse (callback, config) {
        let form = new formidable.IncomingForm(),
            cb = (error, fields, files) => {
                if (this.method === 'GET') {
                    Object.assign(this.get, fields);
                } else {
                    this[this.method.toLowerCase()] = fields;
                }
                this.files = files;
                callback(error);
            };

        form.encoding = 'utf-8';
        Object.assign(form, config);

        try {
            this.get = Utils.splitIntoPairs(this.url.parsed.query, '&');
            form.parse(this.request, cb);
        } catch(error) {
            callback(error);
        }
        return this;
    }

    clear () {
        this._buffer = '';
        return this;
    }

    echo (string) {
        this._buffer += string;
        return this;
    }

    error (error) {
        let outer = '▒'.repeat(100),
            inner = '░'.repeat(100),
            string = error ? (error.stack || error + '') : 'Unknown error!';
        return this.echo(Utils.wrapDebugInfo(`${outer}\n${inner}\n${string}\n${inner}\n${outer}`));
    }

    debug () {
        let buffer = '';
        for (let a = 0, al = arguments.length; a < al; a++) {
            buffer += util.inspect(arguments[a]) + '\n' + '░'.repeat(100);
        }
        return this.echo(Utils.wrapDebugInfo(buffer.slice(0, -101)));
    }

    send () {
        let cookie = this.cookie.toHeader()['Set-Cookie'];
        if (cookie.length) this.header.set('Set-Cookie', cookie);
        this.response.writeHead(+this.status || 500, this.header.toHeader());
        this.response.write(this._buffer);
        this.response.end();
        return this;
    }
};

class Header {
    constructor (headers) {
        this._request = headers;
        this._response = {};
    }

    get (name) {
        return this._request[(name + '').toLowerCase()];
    }

    set (name, value) {
        this._response[name + ''] = value + '';
        return this;
    }

    toHeader () {
        return this._response;
    }
};

class Cookie {
    constructor (cookies) {
        cookies = cookies || {};
        this._request = cookies;
        this._response = {};
    }

    get (key) {
        return this._request[key + ''];
    }

    set (key, value, timeout, path, domain, secure, httponly) {
        this._response[key + ''] = {
            value: value,
            timeout: timeout >= 0 && timeout !== null ? timeout : null,
            path: typeof path === 'string' ? path : '/',
            domain: domain,
            Secure: !!secure,
            HttpOnly: !!httponly
        };
        return this;
    }

    toHeader () {
        let cookies = [];
        for (let r in this._response) {
            cookies.push(this.toString(r));
        }
        return {'Set-Cookie': cookies};
    }

    toString (key) {
        let cookie = this._response[key];
        if (!cookie) return '';

        let timeout = cookie.timeout,
            result = key + '=' + cookie.value;

        if (timeout !== null && timeout >= 0) cookie.expires = new Date(Date.now() + timeout * 1000).toGMTString();
        for (let p of ['expires', 'path', 'domain']) {
            let property = cookie[p];
            if (property) result += '; ' + p + '=' + property;
        }
        for (let p of ['Secure', 'HttpOnly']) {
            if (cookie[p]) result += '; ' + p;
        }

        return result;
    }
};

class Utils {
    static splitIntoPairs (string, delim) {
        let result = {};
        if (string) {
            string = string.split(delim);
            for (let h in string) {
                let pair = string[h].split('=');
                result[pair[0]] = pair[1];
            }
        }
        return result;
    }

    static wrapDebugInfo (string) {
        let colorIndex = Math.min(Colors.length - 1, Math.floor(Math.random() * Colors.length)),
            color = Colors[colorIndex],
            filler = '▓'.repeat(100);

        return `<pre style="margin:0;font-family:monospace;font-size:12px;line-height:16px;color:${color}">\n${filler}\n${string}\n${filler}\n</pre>`;
    }
};

const Colors = ['#DD0011', '#F17217', '#DAA520', '#5BA51E', '#009C9F', '#1453FF', '#8A2BE2'];

module.exports = {
    Colors: Colors,
    Reqponse: Reqponse,
    Cookie: Cookie,
    Header: Header,
    Utils: Utils
};
