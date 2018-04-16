const request = require('request');
const hbs = require('hbs');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

var app = express();
hbs.registerPartials(__dirname + '/partials');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use((request, response, next) => {
	var time = new Date().toString();
	var log = `${time}: ${request.method} $request.url}`;
	fs.appendFile('server.log', log + '\n', (error) => {
		if (error) {
			console.log('Unable to log message');
		}
	});
	next();
})

hbs.registerHelper('getCurrentYear', () => {
	return new Date().getFullYear();
});

hbs.registerHelper('message', (text) => {
	return text.toUpperCase();
});

app.get('/', (request, response) => {
	response.render('index.hbs', {
		myvar: '',
		myvar2: '',
		welcome: 'This is the main page'
	})
});

app.post('/', (request, response) => {
	var input_1 = request.body.username
	var input_2 = request.body.password
	response.render('index.hbs', {
		myvar: input_1,
		myvar2: input_2,
		welcome: 'This shows the text input'
	})
})

app.get('/info', (request, response) => {
	response.send('My info page');
});

app.get('/404', (request, response) => {
	response.send({
		error: 'Page not found'
	})
});

// app.listen(8080, () => {
//     console.log(`Server is up on the port 8080`);
// });

app.listen(port, () => {
    console.log(`Server is up on the port ${port}`);
});