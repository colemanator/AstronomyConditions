/**
 * Created by Peter on 9/09/15.
 */

//function starts AJAX and sends lat and lng
function ajaxSendLatLng(lat, lng) {
        //new xmlhttp object
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            //if successful
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                //get the response text and parse it as JSON
                var astronomyConditionsString = xmlhttp.responseText;
                var astronomyConditionsJSON = JSON.parse(astronomyConditionsString);

                //Get the JSON values and assign set the text on the html page
                document.getElementsByClassName('index')[0].innerHTML = astronomyConditionsJSON.astronomyConditionsIndex + '%';
                document.getElementsByClassName('percentIlluminated')[0].innerHTML = astronomyConditionsJSON.percentIlluminated + '%';
                document.getElementsByClassName('sunrise')[0].innerHTML = astronomyConditionsJSON.sunrise.hour + ':' + astronomyConditionsJSON.sunrise.minute;
                document.getElementsByClassName('sunset')[0].innerHTML = astronomyConditionsJSON.sunset.hour + ':' + astronomyConditionsJSON.sunset.minute;
                document.getElementsByClassName('elevation')[0].innerHTML = astronomyConditionsJSON.elevation + 'ft';
                document.getElementsByClassName('weather')[0].innerHTML = astronomyConditionsJSON.weather;
                document.getElementsByClassName('humidity')[0].innerHTML = astronomyConditionsJSON.humidity + '%';
                document.getElementsByClassName('wind')[0].innerHTML = astronomyConditionsJSON.wind + 'Kph';
                document.getElementsByClassName('visibility')[0].innerHTML = astronomyConditionsJSON.visibility + 'Km';


            }
        }
        //open with variables and send
        xmlhttp.open("GET", "returnAstronomyConditions?lat=" + lat + "&lng=" +lng, true);
        xmlhttp.send();
}