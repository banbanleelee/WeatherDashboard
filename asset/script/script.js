//pass the latitude and longitude as parameter from the input of the city name to identify the UV index
function getUvIndex(lat, lon) {
    var requestUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&units=imperial&appid=a17d2b3e8a43fa6ba37d06306bbdcbaf';
    return fetch(requestUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            return data.current.uvi;
        })
}

//generate the 5-day weather forecast from the api based on the location parameters of the city input
function getForecast(lat, lon) {
    var requestUrl = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&units=imperial&appid=a17d2b3e8a43fa6ba37d06306bbdcbaf';
    fetch(requestUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            var forecastArr = [
                {date: moment().add(1, 'days').format('MMM Do'), weather: data.list[3].weather[0].main, temp: data.list[3].main.temp, wind: data.list[3].wind.speed, humidity: data.list[3].main.humidity},
                {date: moment().add(2, 'days').format('MMM Do'), weather: data.list[11].weather[0].main, temp: data.list[11].main.temp, wind: data.list[11].wind.speed, humidity: data.list[11].main.humidity},
                {date: moment().add(3, 'days').format('MMM Do'), weather: data.list[19].weather[0].main, temp: data.list[19].main.temp, wind: data.list[19].wind.speed, humidity: data.list[19].main.humidity},
                {date: moment().add(4, 'days').format('MMM Do'), weather: data.list[27].weather[0].main, temp: data.list[27].main.temp, wind: data.list[27].wind.speed, humidity: data.list[27].main.humidity},
                {date: moment().add(5, 'days').format('MMM Do'), weather: data.list[35].weather[0].main, temp: data.list[35].main.temp, wind: data.list[35].wind.speed, humidity: data.list[35].main.humidity}
            ];

            function createAllForecasts() {
                $('#forecast-container').empty();
                var title = $('<h3></h3>')
                    .text('5-Day Forecast: ')
                    .css({
                        'padding': '0',
                        'margin': '10px 0 20px 0'
                    });
                $('#forecast-container').append(title);
                forecastArr.forEach((day)=> {
                    var dayContainer = $('<div></div>')
                        .css({
                            "border": "1px solid grey",
                            'margin': '0',
                            'border-radius': '5px',
                            'padding': '15px',
                            'width': 'fit-content',
                            'background-color': 'grey',
                            'color': 'white'
                        })
                        .addClass("col-2 flex-column");
                    var date = $('<span></span>').text(day.date+ ' ').addClass('card-title h4').css('line-height','1.6');
                    var weather = $('<span><i></i></span>').addClass(getWeatherIcon(day.weather));
                    var temp = $('<p></p>').text('Temp: ' + day.temp + ' °F').addClass('card-text h5').css('line-height','1.6');
                    var wind = $('<p></p>').text('Wind: ' + day.wind + ' MPH').addClass('card-text h5').css('line-height','1.6');
                    var humidity = $('<p></p>').text('Humidity: '+ day.humidity + ' %').addClass('card-text h5').css('line-height','1.6');
                    dayContainer.append(date, weather, temp, wind, humidity);
                    $('#forecast-container').append(dayContainer);
                })
            }
            createAllForecasts();
        })
}

//print out the weather data
function getApi(city) {
    var requestUrl = 'https://api.openweathermap.org/data/2.5/weather?q='+city+'&units=imperial&appid=a17d2b3e8a43fa6ba37d06306bbdcbaf';
    fetch(requestUrl)
        .then(function (response) {
            if (response.status === 404) {
                return null;
            } else {
                return response.json();
            }
        })
        .then(function (data) {
            console.log(data);
            if (!data) {
                $('#current-weather').empty().css('border', '0');
                $('#forecast-container').empty();
                alert("Please double check the city name!");
                return;
            }
            $('#current-weather').empty().css({
                'border': '1px solid grey',
                'margin': '0 0 20px 0',
                'border-radius': '5px',
                'padding': '5px',
                'width' : '100%'
            });
            var title = $('<span></span>')
                .text(data.name + ' (' + moment().format('MMM Do, YYYY') + ') ')
                .addClass('h3').css('line-height', '2');
            var weather = $('<span><i></i></span>').addClass(getWeatherIcon(data.weather[0].main));
            var temp = $('<p></p>').text('Temp: ' + data.main.temp + ' °F').css('line-height','1.6').addClass('h4');
            var wind = $('<p></p>').text('Wind: ' + data.wind.speed + ' MPH').css('line-height','1.6').addClass('h4');
            var humidity = $('<p></p>').text('Humidity: ' + data.main.humidity + ' %').css('line-height','1.6').addClass('h4');
            $('#current-weather').append(title, weather, temp, wind, humidity);
            
            getUvIndex(data.coord.lat, data.coord.lon)
            .then(function (response) {
                var uv = $('<span></span>').text('UV Index: ').addClass('h4');
                var index = $('<span></span>')
                    .text(response)
                    .val(response)
                    .css({
                        'background-color': ColorUvIndex(response),
                        'padding': '0 10px',
                        'border-radius': '5px',
                        'line-height': '1.6'
                    })
                    .addClass('h4');
                $('#current-weather').append(uv, index);
            })

            getForecast(data.coord.lat, data.coord.lon);
            saveSearch();
            displaySearch();
        })
}

//determine which color should the UV Index be, green indicates good and purple indicates bad
function ColorUvIndex(index) {
    if(index<3) {
        return 'green';
    } else if (index>=3 && index<6) {
        return 'yellow';
    } else if (index>=6 && index<8) {
        return 'orange';
    } else if (index>=8 && index<11) {
        return 'red';
    } else if (index>=11) {
        return 'purple';
    }
};

//determine which weather icon should be shown based on the weather condition from the api
function getWeatherIcon(weather) {
    if (weather==='Clouds') {
        return 'fas fa-cloud-sun';
    }   else if (weather==='Clear') {
        return 'fas fa-sun';
    }   else if (weather==='Snow') {
        return 'far fa-snowflake';
    }   else if (weather==='Rain') {
        return 'fas fa-cloud-rain';
    }   else if (weather==='Mist') {
        return 'fas fa-smog';
    }
}

//save the search history to local storage and store to an array 
function saveSearch() {
    var searches = {
        city: $('#search-input:input').val()
    };
    localStorage.setItem('city', JSON.stringify(searches));
    var cityArr = [];
    cityArr.push(searches);
    cityArr = cityArr.concat(JSON.parse(localStorage.getItem('cityArr')||'[]'));
    localStorage.setItem('cityArr', JSON.stringify(cityArr));
}

//display the saved searches from the local storage by parsing
function displaySearch() {
    $('#history-container').empty();
    var search = JSON.parse(localStorage.getItem('cityArr'));
    if (search!==null) {
        for (var i=0; i<search.length; i++) {
            var city = $('<button></button>')
                .text(search[i].city)
                .attr('id', 'history'+i)
                .addClass('history-button btn btn-light').val(search[i].city)
                .css('font-size', '1.25em');
            $('#history-container').append(city);
        }
    }
}
            
//show searched cities based on locally stored data
displaySearch();

//call events when user clicks on the search button
$('#search').on('click', function(event) {
    event.preventDefault();
    console.log($('#search-input').val().length);
    if ($('#search-input').val().length!==0) {
        getApi($('#search-input').val().toLowerCase());
    } else {
        alert("Please double check your city name input!");  
    }
});

//call events when user clicks on the cities
$(document).on('click', '.history-button', function(event) {
    getApi(event.target.value);
});

