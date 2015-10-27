var express = require('express');
var router = express.Router();
var https = require('https');
var astronomyFinished = false;
var conditionsFinished = false;
var astronomyConditionsString;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'AstronomyConditions' });
});


router.get('/returnAstronomyConditions', function(request, res) {

    //Get the parameters passed though the URL and assign them to their respective variables
    var lat = parseFloat(request.query.lat);
    var lng = parseFloat(request.query.lng);

    //initialize two JSON arrays which will be needed
    var astronomyJSON = {"item1": '', "item2": ''};
    var conditionsJSON = {"item1": '', "item2": ''};

    //this function gets the Data from the api and parse it to JSON
    function getAstronomy(callback) {
      //https options
      var options = {
        host: 'api.wunderground.com',
        port: 443,
        path: '/api/f4e0a912f365f2ad/astronomy/q/' + lat + ',' + lng + '.json',
        method: 'GET'
      };

      //get request to API
      https.get(options).on('response', function (response) {
        var data = '';
        //store chunk by chunk
        response.on("data", function (chunk) {
          data += chunk;
        });

        //Data as JSON
        response.on('end', function () {
          callback(JSON.parse(data));
        });
      });
    }
    //this function gets the data from the api and parse it to JSON
    function getConditions(callback) {
      //https options
      var options = {
        host: 'api.wunderground.com',
        port: 443,
        path: '/api/f4e0a912f365f2ad/conditions/q/' + lat + ',' + lng + '.json',
        method: 'GET'
      };

      //https get request
      https.get(options).on('response', function (response) {
        var data = '';
        //Get data chunk by chunk
        response.on("data", function (chunk) {
          data += chunk;
        });
        //Store Data as JSON
        response.on('end', function () {
          callback(JSON.parse(data));
        });
      });
    }

  /*function calls the getconditions with call back before storing the JSON Data and calling the next function
   *the next function has a call back that once complete will call the res.send which will send the data to the client
   */
    getConditions(function (conditionsData) {
      conditionsJSON = conditionsData;
      console.log(conditionsJSON);
      conditionsFinished = true;
      calculateAstronomyConditions(function(){
        res.send(astronomyConditionsString);
      });
    });

  /*function calls the getconditions with call back before storing the JSON Data and calling the next function
   *the next function has a call back that once complete will call the res.send which will send the data to the client
   */
    getAstronomy(function (astronomyData) {
      astronomyJSON = astronomyData;
      console.log(astronomyJSON);
      astronomyFinished = true;
      calculateAstronomyConditions(function(){
        res.send(astronomyConditionsString);
      });
    });

    /*
     * This is the final function, which extracts the JSON values and computes the AstronoyCondition Index
     * it also adds this and other values into a JSON string ready to be sent back to the client
     * this function also handles to a degree incomplete API calls and errors such as N/A values
     */
    function calculateAstronomyConditions(next) {
      //this if statement is used to ensure that both Get functions above have finished
      if (astronomyFinished && conditionsFinished) {
        //returns them to false for next call
        astronomyFinished = false;
        conditionsFinished = false;

        //Get the values from JSON and parse the accordingly
        var percentIlluminated = parseFloat(astronomyJSON['moon_phase']['percentIlluminated']);
        var sunrise = astronomyJSON['sun_phase']['sunrise'];
        var sunset = astronomyJSON['sun_phase']['sunset'];
        var elevation = parseFloat(conditionsJSON['current_observation']['display_location']['elevation']);
        var weather = conditionsJSON['current_observation']['weather'];
        var humidity = parseFloat(conditionsJSON['current_observation']['relative_humidity']);
        var wind = parseFloat(conditionsJSON['current_observation']['wind_kph']);
        var visibility = parseFloat(conditionsJSON['current_observation']['visibility_km']);

        //number of properties that will be used in the final calculation
        var propertyCounter = 5;

        /*
         *The following lines of code take each condition value and give it a number between 1-100
         * this is call that conditions index and is used in the final index, also if a number is
         * not a number some error as occurred and the value is set to 0 and the property counter is reduced
         * to ensure the end index is not effected.
         */
        var percentIlluminatedIndex = 100 - percentIlluminated;
        if(isNaN(percentIlluminatedIndex)){
          percentIlluminatedIndex = 0;
          propertyCounter --;
        }
        var bestAbove = 5000.00;
        var elevationIndex = Math.min(Math.max(((100 / bestAbove) * elevation), 0), 100);
        if(isNaN(elevationIndex)){
          elevationIndex = 0;
          propertyCounter --;
        }
        var humidityIndex = 100 - humidity;
        if(isNaN(humidityIndex)){
          humidityIndex = 0;
          propertyCounter --;
        }
        var windIndex = 100 - (Math.min(Math.max(wind, 0), 100));
        if(isNaN(windIndex)){
          windIndex = 0;
          propertyCounter --;
        }
        var visibilityIndex = Math.min(Math.max((visibility * 10), 0), 100);
        if(isNaN(visibilityIndex)){
          visibilityIndex = 0;
          propertyCounter --;
        }

        /*
         *The weather index is different in that these effects have a much more substantial effect on viewing conditions
         *for example if it's over cast you not going to see anything regardless of how good the rest of the conditions are
         * So the weather index is given a value between 1-0 this number is used in the final calculation.
         */
        var weatherIndex = 1.0;
        switch (weather) {
          case 'Heavy_spray':
            weatherIndex = 0.5;
            break;
          case 'Spray':
            weatherIndex = 0.6;
            break;
          case 'Light Spray':
            weatherIndex = 0.7;
            break;
          case 'Heavy Dust Whirls':
            weatherIndex = 0.7;
            break;
          case 'Dust Whirls':
            weatherIndex = 0.8;
            break;
          case 'Light Dust Whirls':
            weatherIndex = 0.9;
            break;
          case 'Light Mist':
            weatherIndex = 0.3;
            break;
          case 'Light fog':
            weatherIndex = 0.3;
            break;
          case 'Heavy Fog Patches':
            weatherIndex = 0.3;
            break;
          case 'Fog Patches':
            weatherIndex = 0.4;
            break;
          case 'Light Fog Patches':
            weatherIndex = 0.5;
            break;
          case 'Smoke':
            weatherIndex = 0.3;
            break;
          case 'Light Smoke':
            weatherIndex = 0.5;
            break;
          case 'Heavy Haze':
            weatherIndex = 0.2;
            break;
          case 'Haze':
            weatherIndex = 0.3;
            break;
          case 'Light Haze':
            weatherIndex = 0.4;
            break;
          case 'Patches of Fog':
            weatherIndex = 0.4;
            break;
          case 'Shallow Fog':
            weatherIndex = 0.4;
            break;
          case 'Partial Fog':
            weatherIndex = 0.4;
            break;
          case 'Clear':
            weatherIndex = 1.0;
            break;
          case 'Partly Cloudy':
            weatherIndex = 0.5;
            break;
          case 'Mostly Cloudy':
            weatherIndex = 0.3;
            break;
          case 'Scattered Clouds':
            weatherIndex = 0.9;
            break;
          case 'Squalls':
            weatherIndex = 0.7;
            break;
          case 'Undefined':
            weatherIndex = 1.0;
            break;
          default:
            weatherIndex = 0.1;
            break;
        }

        //final calculation for Astronomy index
        var astronomyConditionsIndex = Math.round(weatherIndex * ((percentIlluminatedIndex + elevationIndex + humidityIndex + windIndex + visibilityIndex) / propertyCounter));
        console.log(astronomyConditionsIndex);

        //JSON object with properties
        var astronomyConditions = {
          astronomyConditionsIndex: astronomyConditionsIndex,
          percentIlluminated: percentIlluminated,
          sunrise: sunrise,
          sunset: sunset,
          elevation: elevation,
          weather: weather,
          humidity: humidity,
          wind: wind,
          visibility: visibility
        };

        //object is parsed to string and read to be sent to client
        astronomyConditionsString = JSON.stringify(astronomyConditions);

        //callback
        next();
      }
    }
});

module.exports = router;


