const express = require('express')
const app = express()

const port = 80;

app.use(express.static('www'))

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/www/index.htm');
});

app.listen(port, function () {
	console.log('Listening on port ' + port);
});	