let BestGuess = {...initialGuess};
let SavedMeasurements = [];
/**
 * Functions for drawing on the cal details tab
 */

function measurementsChanged() {
  try {
    const calTextElement = document.getElementById("caldata");
    let textValue = `${calTextElement.value}`;
    textValue = textValue.replace('CLBM:','');
    if (textValue.indexOf('bl:')>0) {
      textValue = JSON.stringify(eval(textValue));
    }
    let caldata = JSON.parse(textValue);
    updateCalibrationSave(caldata);
  } catch (err) {
    console.error(err);
  }
}

function updateCalibrationSave(caldata) {
  let id=0;
  SavedMeasurements = caldata.map(m=>({...m, id: id++}));
  calibrationTableUpdate();
  resetButtonsDisabled(false);
  // draw one...
  computeLinesFitness(SavedMeasurements, BestGuess);
}


function computeSim(measurements = null) {
  resetButtonsDisabled(true);
  clearCalCanvas();
  BestGuess = findMaxFitness(measurements || SavedMeasurements);
  results = document.querySelector("#messages").value
  console.log(results);
}

//Deletes everything from the canvas
function clearCalCanvas() {
  const canvas = document.getElementById('CursorLayer');
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Flips the y-coordinate of a point to account for the canvas having y at the top.
 * @param {number} y - The y-coordinate to flip.
 * @returns {number} - The flipped y-coordinate.
 */
function flipY(y) {
  var canvas = document.getElementById("CursorLayer");
  return canvas.height - y;
}

function changeStrokeStyle(inputValue) {
  const green = [0, 128, 0]; // RGB values for green
  const red = [255, 0, 0]; // RGB values for red
  const range = 60 - 20; // Range of input values
  const increment = (red.map((value, index) => value - green[index])).map(value => value / range); // Increment for each RGB value

  const color = green.map((value, index) => Math.round(value + increment[index] * (inputValue - 20))); // Calculate the color based on the input value

  const canvas = document.getElementById("CursorLayer");
  const ctx = canvas.getContext("2d");

  ctx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`; // Set the strokeStyle to the calculated color
}

/**
 * Draws four lines on a canvas element and adds a circle at the end of each line.
 * @param {Object} line1 - An object containing the x and y coordinates of the beginning and end of the first line.
 * @param {Object} line2 - An object containing the x and y coordinates of the beginning and end of the second line.
 * @param {Object} line3 - An object containing the x and y coordinates of the beginning and end of the third line.
 * @param {Object} line4 - An object containing the x and y coordinates of the beginning and end of the fourth line.
 * @returns {void}
 */
function drawLines(line1, line2, line3, line4, guess, measurement) {

  //Compute the tensions in the upper two belts
  //const { TL, TR } = calculateTensions(line1.xEnd, line1.yEnd, guess); //This assumes the ends are in the same place which they aren't at first

  var canvas = document.getElementById("CursorLayer");
  var ctx = canvas.getContext("2d");

  // Set the stroke color to a lighter grey
  ctx.strokeStyle = "#999";

  // Draw the four lines
  ctx.setLineDash([5, 5]);

  //Top left line
  ctx.beginPath();
  ctx.moveTo(line1.xBegin / 4, flipY(line1.yBegin / 4));
  ctx.lineTo(line1.xEnd / 4, flipY(line1.yEnd / 4));
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(line1.xEnd / 4, flipY(line1.yEnd / 4), 2, 0, 2 * Math.PI);
  ctx.fill();

  //Top right line
  ctx.beginPath();
  ctx.moveTo(line2.xBegin / 4, flipY(line2.yBegin / 4));
  ctx.lineTo(line2.xEnd / 4, flipY(line2.yEnd / 4));
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(line2.xEnd / 4, flipY(line2.yEnd / 4), 2, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(line3.xBegin / 4, flipY(line3.yBegin / 4));
  ctx.lineTo(line3.xEnd / 4, flipY(line3.yEnd / 4));
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(line3.xEnd / 4, flipY(line3.yEnd / 4), 2, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(line4.xBegin / 4, flipY(line4.yBegin / 4));
  ctx.lineTo(line4.xEnd / 4, flipY(line4.yEnd / 4));
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(line4.xEnd / 4, flipY(line4.yEnd / 4), 2, 0, 2 * Math.PI);
  ctx.fill();
  if (measurement.id != undefined) {
    // update grid
    gridApi.applyTransaction({
      update: [{ ...measurement, line1, line2, line3, line4 }],
    });
  } else{
    console.log('no id', measurement);
  }
}

function calibrationTableUpdate() {
  gridApi?.setGridOption('rowData', SavedMeasurements);
}