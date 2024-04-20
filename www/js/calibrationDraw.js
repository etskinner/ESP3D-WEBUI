let BestGuess = { ...initialGuess };
let SavedMeasurements = [];
/**
 * Functions for drawing on the cal details tab
 */

function measurementsChanged() {
  try {
    loadInitialData();
    const calTextElement = document.getElementById("caldata");
    let textValue = `${calTextElement.value}`;
    textValue = textValue.replace("CLBM:", "");
    if (textValue.indexOf("bl:") > 0) {
      textValue = JSON.stringify(eval(textValue));
    }
    let caldata = JSON.parse(textValue);
    updateCalibrationSave(caldata);
  } catch (err) {
    console.error(err);
  }
}

function initialDataChanged() {
  initialGuess.tl.x = parseFloat(document.getElementById("tlx").value);
  initialGuess.tl.y = parseFloat(document.getElementById("tly").value);
  initialGuess.tr.x = parseFloat(document.getElementById("trx").value);
  initialGuess.tr.y = parseFloat(document.getElementById("try").value);
  initialGuess.br.x = parseFloat(document.getElementById("brx").value);
  BestGuess = initialGuess;
}

function loadInitialData() {
  document.getElementById("tlx").value = initialGuess.tl.x;
  document.getElementById("tly").value = initialGuess.tl.y;
  document.getElementById("trx").value = initialGuess.tr.x;
  document.getElementById("try").value = initialGuess.tr.y;
  document.getElementById("brx").value = initialGuess.br.x;
}

function updateCalibrationSave(caldata) {
  let id = 0;
  SavedMeasurements = caldata.map((m) => ({ ...m, id: id++ }));
  calibrationTableUpdate();
  resetButtonsDisabled(false);
  // draw one...
  computeLinesFitness(SavedMeasurements, BestGuess);
}

  const calibrationCallback = (e) => {
    if (e.detail.started) {
      // todo: anything?
    } else if (e.detail.progress) {
      // update fields.
       document.getElementById("tlx").value = e.detail.currentGuess.tl.x;
       document.getElementById("tly").value = e.detail.currentGuess.tl.y;
       document.getElementById("trx").value = e.detail.currentGuess.tr.x;
       document.getElementById("try").value = e.detail.currentGuess.tr.y;
       document.getElementById("brx").value = e.detail.currentGuess.br.x;
    } else if (e.detail.complete) {
      // update initial stuff.
      initialGuess = {...BestGuess};
      initialDataChanged();
      loadInitialData();
    }
    console.log(e.detail);
  };

function computeSim(measurements = null) {

  resetButtonsDisabled(true);
  clearCalCanvas();
  findMaxFitness(measurements || SavedMeasurements);
  results = document.querySelector("#messages").value;
  console.log(results);
}

//Deletes everything from the canvas
function clearCalCanvas() {
  const canvas = document.getElementById("CursorLayer");
  const context = canvas.getContext("2d");
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
  const increment = red
    .map((value, index) => value - green[index])
    .map((value) => value / range); // Increment for each RGB value

  const color = green.map((value, index) =>
    Math.round(value + increment[index] * (inputValue - 20))
  ); // Calculate the color based on the input value

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
  } else {
    console.log("no id", measurement);
  }
}

function calibrationTableUpdate() {
  gridApi?.setGridOption("rowData", SavedMeasurements);
}

function stopCalculations() {
  resetButtonsDisabled(false);
  window.computing = false;
}

/* Functions to hook into calibration events */
function printGuess(messagesBox, bestGuess) {
        if (1 / bestGuess.fitness < 0.5) {
          messagesBox.value +=
            "\nWARNING FITNESS TOO LOW. DO NOT USE THESE CALIBRATION VALUES!";
        }

        messagesBox.value += "\nCalibration complete \nCalibration values:";
        messagesBox.value += "\nFitness: " + 1 / bestGuess.fitness.toFixed(7);
        messagesBox.value += "\nMaslow_tlX: " + bestGuess.tl.x.toFixed(1);
        messagesBox.value += "\nMaslow_tlY: " + bestGuess.tl.y.toFixed(1);
        messagesBox.value += "\nMaslow_trX: " + bestGuess.tr.x.toFixed(1);
        messagesBox.value += "\nMaslow_trY: " + bestGuess.tr.y.toFixed(1);
        messagesBox.value += "\nMaslow_blX: " + bestGuess.bl.x.toFixed(1);
        messagesBox.value += "\nMaslow_blY: " + bestGuess.bl.y.toFixed(1);
        messagesBox.value += "\nMaslow_brX: " + bestGuess.br.x.toFixed(1);
        messagesBox.value += "\nMaslow_brY: " + bestGuess.br.y.toFixed(1);
        messagesBox.scrollTop;
        messagesBox.scrollTop = messagesBox.scrollHeight;

}

const messagesBox = document.getElementById("messages");
const fitnessMessage = document.getElementById("fitnessMessage");

/**
 * This Listener will hook in the drawEvents, etc to the calibration as it runs
 * @param the custom calibration event
 */
function calibrationEventListener(event) {
  if (event.detail) {
    if (event.detail.initialGuess) {
      // start of calibration here.
      resetButtonsDisabled(true);
      clearCalCanvas();
    } else if (event.detail.final) {
      resetButtonsDisabled(false);
      printGuess(messagesBox, BestGuess);
      // end of calibration.
      if (event.detail.good) {
        // "good" calibration
      } else {
        // "bad" calibration
      }
    } else if (event.detail.final === false) {
      // progress event.
      const bestGuess = event.detail.bestGuess;
      const totalCounter = event.detail.bestGuess;
      if (totalCounter % 100 == 0) {
        const fitnessStatus = `Fitness: ${1 / bestGuess.fitness.toFixed(7)} in ${totalCounter}`;
        fitnessMessage.innerText = fitnessStatus;
        messagesBox.value += '\n' + fitnessStatus;
        messagesBox.scrollTop;
        messagesBox.scrollTop = messagesBox.scrollHeight;
      }
      BestGuess = bestGuess;
    } else if (event.detail.walkedLines) {
      // walkLines result
    } else if (event.detail.lines) {
      // drawLines here!
      const lines = event.detail.lines.lines;
      const individual = event.detail.individual;
      const measurement = event.detail.measurement;
      drawLines(lines.tlLine, lines.trLine, lines.blLine, lines.brLine, individual, measurement);
    }
  }
}

document.body.removeEventListener(CALIBRATION_EVENT_NAME, calibrationEventListener)
document.body.addEventListener(CALIBRATION_EVENT_NAME, calibrationEventListener)

// functions removed from this project

function clearCanvas() {
  clearCalCanvas();
}
