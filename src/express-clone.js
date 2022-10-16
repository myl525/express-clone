// import modules
const net = require('net');
const fs = require('fs');
const path = require('path');

//HTTP_STATUS_CODE Object
const HTTP_STATUS_CODES = {
    200: 'OK',
    404: 'Not Found',
    500: 'Internal Server Error',
    301: 'Moved Permanently',
    308: 'Permanent Redirect'
};

//MIME_TYPES Object
const MIME_TYPES = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    html: 'text/html',
    css: 'text/css',
    txt: 'text/plain'
};

// functions
const getExtension = function(fileName) {
    const arr = fileName.split('.');
    if(arr.length > 1) {
        return arr[arr.length-1].toLowerCase();
    }else {
        return '';
    }
}

const getMIMEType = function(fileName) {
    const extension = getExtension(fileName);
    if(Object.prototype.hasOwnProperty.call(MIME_TYPES, extension)) {
        return MIME_TYPES[extension];
    }else {
        return '';
    }
}

// Request Class
class Request {
    constructor(httpRequest) {
        const reqParts = httpRequest.split(' ');
        const [method, path, ...other] = reqParts;
        this.method = method;
        this.path = path;
    }
}

// App
class App {
    constructor() {
        this.server = net.createServer((sock) => {this.handleConnection(sock)});
        this.routes = {};
        this.middleware = null;
    }

    normalizePath(path) {
        let normalized = '';
        path = path.toLowerCase();
        for(const i in path){
            if(path[i].toLowerCase() !== path[i].toUpperCase() || path[i] === '/'){
                normalized += path[i];
            }else{
                break;
            }
        }

        if(normalized[normalized.length-1] === '/') {
            normalized = normalized.slice(0, normalized.length-1);
        }

        return normalized;
    }

    createRouteKey(method, path) {
        return method.toUpperCase() + ' ' + this.normalizePath(path);
    }

    get(path, cb) {
        const routeKey = this.createRouteKey('GET', path);
        this.routes[routeKey] = cb;
    }

    use(cb) {
        this.middleware = cb;
    }

    listen(port, host) {
        this.server.listen(port, host);
    }

    handleConnection(sock) {
        sock.on('data', (data) => this.handleRequest(sock, data));
    }

    handleRequest(sock, binaryData) {
        const req = new Request(binaryData+'');
        const res = new Response(sock);

        if(this.middleware !== null){
            this.middleware(req, res, this.processRoutes.bind(this));
        }else{
            this.processRoutes(req, res);
        }
    }

    processRoutes(req, res) {
        const routeKey = this.createRouteKey(req.method, req.path);

        if(Object.prototype.hasOwnProperty.call(this.routes, routeKey)){
            const fn = this.routes[routeKey];
            fn(req, res);
        }else{
            res.statusCode = 404;
            res.set('Content-Type', 'text/plain');
            const msg = 'Page not found';
            res.send(msg);
        }
    }
}


// Response Class
class Response {
    constructor(socket, statusCode, version) {
        this.socket = socket;
        this.statusCode = statusCode || 200;
        this.version = version || 'HTTP/1.1';
        this.headers = {};
        this.body = null;
    }

    set(name, value) {
        this.headers[name] = value;
    }

    end() {
        this.socket.end();
    }

    statusLineToString() {
        return `${this.version} ${this.statusCode} ${HTTP_STATUS_CODES[this.statusCode]}\r\n`;
    }

    headersToString() {
        let res = '';
        for(const key in this.headers) {
            res += `${key}: ${this.headers[key]}\r\n`;
        }
        return res;
    }

    send(body) {
        this.body = body;
        let res = '';
        if(!Object.prototype.hasOwnProperty.call(this.headers, 'Content-Type')) {
            this.headers['Content-Type'] = 'text/html';
        }
        res = this.statusLineToString() + this.headersToString() + '\r\n';
        this.socket.write(res);
        this.socket.write(body);
        this.end();
    }

    status(statusCode) {
        this.statusCode = statusCode;
        return this;
    }
}

const serveStatic = function(basePath) {
    return (req, res, next) => {
        fs.readFile(path.join(basePath, req.path), (err, data) => {
            if(err){
                next(req, res);
            }else{
                const contentType = getMIMEType(req.path);
                res.set('Content-Type', contentType);
                res.send(data);
            }
        });
    };
}

module.exports = {
    HTTP_STATUS_CODES: HTTP_STATUS_CODES,
    MIME_TYPES: MIME_TYPES,
    getExtension: getExtension,
    getMIMEType: getMIMEType,
    Request: Request,
    App: App,
    Response: Response,
    static: serveStatic
};