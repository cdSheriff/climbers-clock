import clock from "clock";
import document from "document";

// add zero in front of numbers. Needed for minutes and for API
export function zeroPad(i) {
  if (i < 10) {
    i = "0" + i;
  };
  return i;
};

export function altFlash(alt) {
  var alts = []
  while (alt > 0) {
    alts.push(alt);
    alt -= 7;
  };
  return alts;
};

export function hourMe(hours) {
  let houring = ['AM',hours];
  if (houring[1] == 0) {
    houring[1] = 12;
  } else if (houring == 12) {
    houring[0] = 'PM';
  } else if (houring[1] >= 13) {
    houring = ['PM', houring[1] - 12];
  };
  return houring;
}

export function altGraph(altitudeLog) {
  // this will me sonething cool
  // ideally I will make a graph log of altitude
  // let's target 200 pixels wide and 112 tall, to fit inside my imaginary button box  
  // if we do 5/10/15/20 feet per pixels, we get scales of 560/1120/1680/2240
  // why does the scale change? well if the max-min reaches (NUMBER HERE) of scale, move to next one
  // start at 50% line for now. makes it easy
  // if the delta to start point reaches 50%, move it up/down to make room for it
  // if the up/down opposite is over 25%, then a shift is needed
  
  
  // let firstAlt = [125];
  // let altOut = [];
  if (altitudeLog.length == 1) {
    let altOut = [125];
    console.log('just one!');
  } else {
    let firstVal = altitudeLog[0];
    // step 0: set the scale
    let scale = Math.ceil(firstVal/560);
    console.log('scale: ' + scale)
    // step 0.5: scale up if it violates 50% rule
    if (Math.max(Math.max(altitudeLog) - firstVal,firstVal - Math.min(altitudeLog)) > scale*560/2) {
      scale++
    }
    // step 1: normalize array, and scale to graph at the same time (step 2), and add 125 to middle pixel it (step 3)
    altOut = altitudeLog.map(x => Math.floor((x - firstVal)*(scale/560)) + 125);
  }
  return altOut
}

