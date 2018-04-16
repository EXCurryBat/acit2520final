const request = require('request');
const hbs = require('hbs');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

var app = express();
var weather ='';
var picObj ='';
hbs.registerPartials(__dirname + '/partials');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
	extended: true
}));
// app.use((request, response, next) => {
// 	var time = new Date().toString();
// 	var log = `${time}: ${request.method} $request.url}`;
// 	fs.appendFile('server.log', log + '\n', (error) => {
// 		if (error) {
// 			console.log('Unable to log message');
// 		}
// 	});
// 	next();
// })

var getAddress = (address) => {
	return new Promise((resolve, reject) => {
		request({
			url: `http://maps.googleapis.com/maps/api/geocode/json?address=`+ 
			encodeURIComponent(address),
			json: true
		}, (error, response, body) => {
			if (error) {
				reject('Cannot connect to Google Maps');
			} else if (body.status === 'ZERO__RESULTS') {
				reject('Cannot find requested address');
			} else if (body.status === 'OK') {
				resolve(body.results[0].geometry.location.lat+','+body.results[0].geometry.location.lng);
			}
		});
	});
};

var getWeather = (address) => {
	return new Promise((resolve, reject) => {
		request({
			url: `https://api.darksky.net/forecast/f52a6f1873893dbde13523c135911c9f/`+ 
			encodeURIComponent(address),
			json: true
		}, (error, response, body) => {
			if (error) {
				reject('Cannot connect to darksky.net');
			} else if (body.code === 400) {
				reject(body.error);
			} else {
				resolve(body);
			}
		});
	});
};

var pixa = (keyword) => {
	return new Promise((resolve, reject) => {
		request({
			url: `https://pixabay.com/api/?key=7246674-b37ac3e55b379cef1f626bb09&q=${keyword}+flowers&image_type=photo`,
			json: true
		}, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
            	// console.log(body.hits)
               	
                resolve(body);
            }
        });
	});
}

hbs.registerHelper('getCurrentYear', () => {
	return new Date().getFullYear();
});

hbs.registerHelper('message', (text) => {
	return text.toUpperCase();
});

hbs.registerHelper('pics', (list) => {
    var out = '';
    for (var index in list.searchList) {
        out = out + `<img src="/fetchDetails?n=${list.searchList[index]}">${list.searchList[index]}</a><br>`;
    }
    return out;
});

hbs.registerHelper('searchResults', (list) => {
    var out = '';
    for (var index in list.searchList) {
        out = out + `<a href="/fetchDetails?n=${list.searchList[index]}">${list.searchList[index]}</a><br>`;
    }
    return out;
})

app.get('/', (request, response) => {
	response.render('home.hbs', {
		welcome: 'This is the home page, select a link to navigate to desired page',
		link1: 'pictures',
		link2: 'weather',
		page1: 'Search for pictures',
		page2: 'Search for weather details'
	})
});

app.get('/home', (request, response) => {
	response.render('home.hbs', {
		welcome: 'This is the home page, select a link to navigate to desired page',
		link1: 'pictures',
		link2: 'weather',
		page1: 'Search for pictures',
		page2: 'Search for weather details'
	})
});

app.get('/pictures', (request, response) => {
	response.render('pictures.hbs', {
		myvar: '',
		myvar2: '',
		welcome: 'This is the main page'
	})
});

// app.post('/', (request, response) => {
// 	var input_1 = request.body.username;
// 	var input_2 = request.body.password;
// 	response.send(pixa(input_1));
// 	// pixa(input_1).then(result) => {
// 	// 	console.log(result);
// 	// }
// 	// var out = '';
//  //        for(var item in picObj){
//  //        	out = out+ `<img src=${item.webformatURL}>`
//  //        }
//  //    console.log(out);

// 	// response.render('pictures.hbs', {
// 	// 	myvar: input_1,
// 	// 	myvar2: input_2,
// 	// 	welcome: 'This shows the text input'
// 	// });
// })

app.get('/weather', (request, response) => {
	response.render('weather.hbs', {
		welcome: 'This is weather page',
		myvar1: '',
		myvar2: ''
	});
});

app.post('/', (request, response) => {
	var input_1 = request.body.username;
	var input_2 = request.body.password;
	if (input_1!=''){

	getAddress(input_1).then((result) => {
		return getWeather(result);
	}).then((result) => {
		weather = `The temperature in ${input_1} is ${result.currently.temperature} and is ${result.currently.summary}`;
		console.log(weather);
			response.render('weather.hbs', {
			myvar: weather,
			myvar2: input_2,
			welcome: 'This shows the weather'
		});

	}).catch((error) => {
		console.log('Error:', error);
	});
	}

	if (input_2 != '') {

		pixa(input_2).then((result) => {
			for (var item in result.hits) {
				picObj = picObj + `<img src=${item.webformatURL}>`
			}
			return picObj;
			// response.send(result);
		}).then((result) => {
			response.send(result);
		})
		
	}

	// pixa(input_1).then(result) => {
	// 	console.log(result);
	// }
	// var out = '';
 //        for(var item in picObj){
 //        	out = out+ `<img src=${item.webformatURL}>`
 //        }
 //    console.log(out);
	// response.render('weather.hbs', {
	// 		myvar: weather,
	// 		myvar2: input_2,
	// 		welcome: 'This shows the weather'
	// });

	
})


// app.get('/info', (request, response) => {
// 	response.send('My info page');
// });

// app.get('/404', (request, response) => {
// 	response.send({
// 		error: 'Page not found'
// 	})
// });

// app.listen(8080, () => {
//     console.log(`Server is up on the port 8080`);
// });
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server is up on the port ${port}`);
});