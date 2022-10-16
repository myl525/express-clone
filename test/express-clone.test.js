// imports
const clone = require('../src/express-clone');
const getExtension = clone.getExtension;
const getMIMEType = clone.getMIMEType;
const Request = clone.Request;
const App = clone.App;
// getExtension
test('foo.jpg to be jpg', () => {
    expect(getExtension('foo.jpg')).toBe('jpg');
});
test('FOO.JPG to be jpg', () => {
    expect(getExtension('FOO.JPG')).toBe('jpg');
});
test('foo.bar.jpg to be jpg', () => {
    expect(getExtension('foo.bar.jpg')).toBe('jpg');
});
test("foo to be ''", () => {
    expect(getExtension('foo')).toBe('');
});

// getMIMEType
test('foo.jpg to be image/jpeg', () => {
    expect(getMIMEType('foo.jpg')).toBe('image/jpeg');
})
test('foo.jpeg to be image/jpeg', () => {
    expect(getMIMEType('foo.jpeg')).toBe('image/jpeg');
})
test('foo.png to be image/png', () => {
    expect(getMIMEType('foo.png')).toBe('image/png');
})
test('foo.html to be text/html', () => {
    expect(getMIMEType('foo.html')).toBe('text/html');
})
test('foo.css to be text/css', () => {
    expect(getMIMEType('foo.css')).toBe('text/css');
})
test('foo.txt to be text/plain', () => {
    expect(getMIMEType('foo.txt')).toBe('text/plain');
})
test('FOO.JPG to img/jpeg', () => {
    expect(getMIMEType('FOO.JPG')).toBe('image/jpeg');
})
test("foo to ''", () => {
    expect(getMIMEType('foo')).toBe('');
})
test("foo.xyz to ''", () => {
    expect(getMIMEType('foo.xyz')).toBe('');
})
// Request class
test('Request parse', () => {
    const s = "GET /foo.html HTTP/1.1\r\nHost: localhost:3000\r\n\r\n\r\n";
    expect(new Request(s).path).toBe('/foo.html');
})
test('Request parse', () => {
    const s = "GET /foo.html HTTP/1.1\r\nHost: localhost:3000\r\n\r\n\r\n";
    expect(new Request(s).method).toBe('GET');
})

// Response class

// App class
// normalizePath
test('App class normalizePath', () => {
    const path = '/FOO';
    expect(new App().normalizePath(path)).toBe('/foo');
})
test('App class normalizePath', () => {
    const path = '/foo#bar';
    expect(new App().normalizePath(path)).toBe('/foo');
})
test('App class normalizePath', () => {
    const path = '/foo?bar=baz';
    expect(new App().normalizePath(path)).toBe('/foo');
})
test('App class normalizePath', () => {
    const path = '/foo/';
    expect(new App().normalizePath(path)).toBe('/foo');
})
test('App class normalizePath', () => {
    const path = '/foo/?bar=baz';
    expect(new App().normalizePath(path)).toBe('/foo');
})
test('App class normalizePath', () => {
    const path = '/foo/#bar';
    expect(new App().normalizePath(path)).toBe('/foo');
})
// createRouteKey
test('App class createRouteKey', () => {
    expect(new App().createRouteKey('GET', '/FOO/?bar=baz')).toBe('GET /foo');
})