import document from "document";
import { geolocation, Position, PositionError } from "geolocation";
import {outbox} from "file-transfer";

setTimeout(currentLoc, 2000); // fire up two seconds after starting clock face
setInterval(currentLoc, 14400000); // update daily

function currentLoc() {
  console.log('trying to find me');
  
  function locationSuccess(position) {
    var lat = position.coords.latitude.toFixed(4);
    var long = position.coords.longitude.toFixed(4);
    var apiCall = "https://api.weather.gov/points/" + lat + "," + long + "/forecast"
    console.log(apiCall);
    fetch(apiCall).then(function(response) {
    console.log('fetched');
    return response.json();
  }).then(function(json) {
    console.log(json.properties.periods[0].startTime);
    console.log(json.properties.periods[0].shortForecast);
    let data = JSON.stringify(json.properties.periods[0]);
    // console.log("data: " +  data.length);
    let uint=new Uint8Array(data.length);
    for(var i=0,j=data.length;i<j;++i){
      uint[i]=data.charCodeAt(i);
    };
      console.log('now gonna send: ' + uint);
    outbox.enqueue("forecast.txt", uint).then((ft) => {
      console.log("Transfer of " + ft.name + " successfully queued.");
    }).catch((error) => {
      console.log("Failed to queue: "  +  ". Error: " + error);
    })
  });
    // displayData0.text = `lat: ${position.coords.latitude.toFixed(5)}`;
    // displayData1.text = `long: ${position.coords.longitude.toFixed(5)}`;
    // displayData2.text = `Alt: ${position.coords.altitude.toFixed(1)} feet`;
  };
  
  function locationError(error) {
    console.log("Error: " + error.code,
              "Message: " + error.message);
  };
  
  var geo_options = {
    timeout: 119000
  };

  geolocation.getCurrentPosition(locationSuccess, locationError);
  
};

// fetch(url).then(function(response) {
//     console.log('fetched');
//     return response.json();
//   }).then(function(json) {
//     var data = json.predictions;
//     var single = JSON.stringify(data);
//     let uint=new Uint8Array(single.length);
//     for(var i=0,j=single.length;i<j;++i){
//       uint[i]=single.charCodeAt(i);
//     }
//     outbox.enqueue("noaaTides.txt", uint);
//   });