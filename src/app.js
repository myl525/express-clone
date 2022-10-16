const expressClone = require('./express-clone');
const app = new expressClone.App();

app.use((req, res, next) => {
    console.log(req.method, req.path);
    next(req, res);
});

app.get('/helloworld', function(req, res) {
    // send back a response if route matches
    res.send('<h1>HELLO WORLD</h1>');
});

app.listen(3000, '127.0.0.1');