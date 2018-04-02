import clock from "clock";
import document from "document";
import {inbox} from "file-transfer";
import * as fs from "fs";

import {zeroPad} from "../common/utils";
import {hourMe} from "../common/utils";
import {altFlash} from "../common/utils";
import {altGraph} from "../common/utils";

import {Barometer} from "barometer";
import { geolocation, Position, PositionError } from "geolocation";

///////////////////////DISPLAY ITEMS////////////////////////////
let smallClock = document.getElementById("smallClock");
let mainClock = document.getElementById("mainClock");
let displayData0 = document.getElementById("display-data-0");
let displayData1 = document.getElementById("display-data-1");
let displayData2 = document.getElementById("display-data-2");
let label = document.getElementById("data-label");
let dots = document.getElementsByClassName("dot");
let displays = document.getElementsByClassName("sensor-data");

/////////////////////CLOCK//////////////////////////////
clock.granularity = "minutes";
function updateClock() {
  let today = new Date();
  let date = zeroPad(today.getDate());
  let hours = hourMe(today.getHours())[1];
  // side.text = `${hourMe(today.getHours())[0]}`
  let mins = zeroPad(today.getMinutes());
  let seconds = zeroPad(today.getSeconds());
  // let days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  // let day = days[today.getDay()];
  smallClock.text = `${hours}:${mins}:${seconds}`;
  // mainClock.text = `${hours}:${mins}:${seconds}`;
  mainClock.text = `${hours}:${mins}`;
  // dayed.text = `${day}`;
  // dated.text = `${date}`;
  // console.log(alt + 'became' + alts);
};
clock.ontick = () => updateClock();

///////////////////////FIRST STAB MAKE ALTITUDE///////////////////////////////
function backgroundAlt() {
  let altitude = Math.round((1-((bar.pressure/100)/1013.25)**0.190284)*145366.45);
  // label.text = `est. ${Math.round(altitude)} feet`;
  try {
    let altitudeLog = JSON.parse(fs.readFileSync('altitude.txt', 'utf-8'));
    if (altitudeLog.length == 0){
        altitudeLog = [altitude]
    } else if (altitudeLog.length < 51) {
      altitudeLog.push(altitude);
    } else {
      altitudeLog.shift();
      altitudeLog.push(altitude);
    }
    fs.writeFileSync("altitude.txt", JSON.stringify(altitudeLog), "utf-8");
    console.log(altitudeLog.length)
  } catch (e) {
    let altitudeLog = [altitude];
    fs.writeFileSync("altitude.txt", JSON.stringify(altitudeLog), "utf-8");
  }
  // let altitudeOut = lineArt(altitudeLog)
  // // console.log(altitudeOut.length)
  // for (let i = 0; i < altitudeLog.length; i++) {
  //   // console.log(altitudeOut[i])
  //   dots[i].cy = altitudeOut[i]
  // }
};

let backgroundTimer = setInterval(backgroundAlt, 60000)

////////////////////////BUTTONS//////////////////////////////
var myTimer;
var forecast;
let bar = new Barometer();
bar.start();

let btnLoc = document.getElementById("btn-tl");
btnLoc.onactivate = function(evt) {
  clearDisplay();
  label.text = `location`;
  refreshLoc();
};

let btnWeather = document.getElementById("btn-tr");
btnWeather.onactivate = function(evt) {
  clearDisplay();
  label.text = `weather`;
  refreshWeather();
};

let btnAlt = document.getElementById("btn-br");
btnAlt.onactivate = function(evt) {
  btnAlt.style.stroke = 'none'
  clearDisplay();
  easyAlt();
  fsAlt();
  myTimer = setInterval(fsAlt, 60000);
};

let btnTime = document.getElementById("btn-bl");
btnTime.onactivate = function(evt) {
  clearForClock();
};
/////////////////////ALTITUDE//////////////////////////////
function easyAlt() {
  dots.forEach(function(dot) {
    dot.style.visibility = "visible";
  });
  var altitude = (1-((bar.pressure/100)/1013.25)**0.190284)*145366.45;
  displayData0.text = ``;
  displayData1.text = ``;
  displayData2.text = ``;
  label.text = `est. ${Math.round(altitude)} feet`;
}

function fsAlt() {
  let altitude = Math.round((1-((bar.pressure/100)/1013.25)**0.190284)*145366.45);
  label.text = `est. ${Math.round(altitude)} feet`;
  try {
    let altitudeLog = JSON.parse(fs.readFileSync('altitude.txt', 'utf-8'));
    // if (altitudeLog.length == 0){
    //     altitudeLog = [altitude]
    // } else if (altitudeLog.length < 51) {
    //   altitudeLog.push(altitude);
    // } else {
    //   altitudeLog.shift();
    //   altitudeLog.push(altitude);
    // }
    // fs.writeFileSync("altitude.txt", JSON.stringify(altitudeLog), "utf-8");
    console.log(altitudeLog.length)
  } catch (e) {
    let altitudeLog = [altitude];
    fs.writeFileSync("altitude.txt", JSON.stringify(altitudeLog), "utf-8");
  }
  let altitudeOut = lineArt(altitudeLog)
  // console.log(altitudeOut.length)
  for (let i = 0; i < altitudeLog.length; i++) {
    // console.log(altitudeOut[i])
    dots[i].cy = altitudeOut[i]
  }
};


function lineArt(altitudeIn) {
  console.log(altitudeIn)
  // console.log(Math.max(...altitudeIn))
  // console.log(Math.min(...altitudeIn))
  let scale = Math.ceil((Math.max(...altitudeIn) - Math.min(...altitudeIn))/100)
  console.log(scale)
  if (scale == 0) {scale++}
  let delt = []
  for (let i = 0; i < altitudeIn.length; i++) {
    // if (altitudeIn[i] == 125) {
    //   delt[i] = 125
    //   console.log('found it' + delt[i])
    // } else {
    delt[i] = 125 + Math.round((altitudeIn[0] - altitudeIn[i])/scale)
      console.log(delt[i])
    // }
  }
  console.log(delt)
  return delt
}
/////////////////WEATHER///////////////////////////////////////////
function refreshWeather(forecast) {
  label.text = `weather`;
  if (forecast) {
    console.log('forecast exists, gonna put words on screen now')
    printForecast(forecast);
  } else {
    console.log('forecast undefined. going to try things')
    try {
      console.log('try to read it...')
      let ascii_read = fs.readFileSync("sevenDay.txt", "utf-8");
      if (ascii_read) {
        console.log('ok local file to forecast');
        forecast = JSON.parse(ascii_read);
        console.log('ok parsed it and globaled it, now lets screen it')
        printForecast(forecast);
      } else {
        console.log('nothing was read, didnt make it global');
        displayData0.text = `no NWS connection`;
      };
    }
    catch (e) {
      console.log('there was nothing in the file system! ugh (or maybe screening it failed)')
      displayData0.text = `no NWS connection`;
    }
  }
};

function printForecast(forecast) {
  displayData0.text = `${forecast.name}`;
  displayData1.text = `${forecast.shortForecast}`;
  let temp = forecast.shortForecast.split('then');
  if (temp[1]){
    displayData2.text = `${temp[1]}`;
  }
}

inbox.onnewfile = () => {
  console.log("New file!");
  let fileName;
  do {
    fileName = inbox.nextFile();
    console.log("found filename: " + fileName)
    if (fileName) {
      let data = fs.readFileSync(fileName, "utf-8");
      fs.writeFileSync("sevenDay.txt", data, "utf-8");
      console.log('ok stored it locally');
    }
  } while (fileName);
};
/////////////////GPS///////////////////////////////////////////
function refreshLoc() {
  console.log('trying to find me');
  
  function locationSuccess(position) {
    displayData0.text = `lat: ${position.coords.latitude.toFixed(5)}`;
    displayData1.text = `long: ${position.coords.longitude.toFixed(5)}`;
    let temp = position.coords.altitude * 3.28084;
    displayData2.text = `GPS altitude: ${temp.toFixed(0)} feet`;
    label.text = `${position.coords.altitudeAccuracy}`;
  };
  
  function locationError(error) {
    console.log("Error: " + error.code,
              "Message: " + error.message);
    displayData0.text = `location error: ${error.message}`
    displayData1.text = `hint: GPS hates things overhead`;
    displayData2.text = `trees, roofs, etc can make it fail`;
    
  };
  
  var geo_options = {
    timeout: 59000
  };

  geolocation.getCurrentPosition(locationSuccess, locationError, geo_options);
  
};


///////////////////////////RESET/CLEAR//////////////////////////////////////////
function clearDisplay() {
  clock.granularity = "seconds";
  clearInterval(myTimer);
  // dot.style.visibility = "hidden";
  dots.forEach(function(dot) {
    dot.style.visibility = "hidden";
  });
  displays.forEach(function(display) {
    display.style.visibility = "visible";
  });
  mainClock.style.visibility = "hidden";
  smallClock.style.visibility = "visible";
  displayData0.text = `...`;
  displayData1.text = ``;
  displayData2.text = ``;
  label.text = ``;
}

function clearForClock() {
  clock.granularity = "minutes";
  clearInterval(myTimer);
  dots.forEach(function(dot) {
    dot.style.visibility = "hidden";
  });
  displays.forEach(function(display) {
    display.style.visibility = "hidden";
  });
  mainClock.style.visibility = "visible";
  smallClock.style.visibility = "hidden";
  // displayData0.text = ``;
  // displayData1.text = ``;
  // displayData2.text = ``;
  label.text = ``;
}

/////////////////////////////////////////////////////////////////////