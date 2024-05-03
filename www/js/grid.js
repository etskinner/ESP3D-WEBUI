// Grid Options: Contains all of the grid configurations
const agGridOptions = {
  rowData: [],
  columnDefs: [
    {
      field: "id",
      headerName: "ID",
      width: 80,
    },
    {
      field: "tl",
      headerName: "Top Left",
      width: 100,
    },
    {
      field: "tr",
      headerName: "Top Right",
      width: 100,
    },
    {
      field: "bl",
      headerName: "Bottom Left",
      width: 120,
    },
    {
      field: "br",
      headerName: "Bottom Right",
      width: 120,
    },
  ],
  onRowDoubleClicked: (p) => {
    console.log(p);
    if (p.data.line1) {
    }
  },
  onGridReady: (params) => {
    gridApi = params.api;
    console.log("my grid is ready", params);
    highlightLines();
  },
  getRowId: (params) => params.data.id,
  rowSelection: "multiple",
};

const myGridElement = document.querySelector("#caltable");
agGrid.createGrid(myGridElement, agGridOptions);
// Use this to update/ interact.
let gridApi = null;

// grid animation is running:
let gridAnimation = false;

const highlightTiming = 500;

function highlightLines() {
  if (gridAnimation) {
    return;
  }
  gridAnimation = true;
  function lineAnimationLoop() {
    if (gridApi?.getSelectedRows()) {
      var canvas = document.getElementById("CursorLayer");
      var ctx = canvas.getContext("2d");
      gridApi.getSelectedRows().forEach((row) => {
        if (row.line1) {
          highlightLine(row.line1, ctx);
          highlightLine(row.line2, ctx);
          highlightLine(row.line3, ctx);
          highlightLine(row.line4, ctx);
        }
      });
    }
    // reset in a sec
    setTimeout(() => {
      // redraw
      // clearCalCanvas();
      // computeLinesFitness(SavedMeasurements, BestGuess); // redraw
      // call me back in a second
      setTimeout(
        lineAnimationLoop,
        highlightTiming / 2
      );
    }, highlightTiming);
  }
  lineAnimationLoop();
}

function highlightLine(line, ctx) {
  ctx.fillStyle = "red";
  ctx.strokeStyle = "red";
  doDrawLine(line, ctx);
  ctx.fillStyle = "black";
  ctx.strokeStyle = "#999";
}

function doDrawLine(line, ctx) {
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(line.xBegin / 4, flipY(line.yBegin / 4));
  ctx.lineTo(line.xEnd / 4, flipY(line.yEnd / 4));
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(line.xEnd / 4, flipY(line.yEnd / 4), 2, 0, 2 * Math.PI);
  ctx.fill();
}

function runSimWithoutSelected() {
  // make an array with just the unselected rows
  const unselectedRows =
    gridApi.getSelectedRows().length > 0
      ? SavedMeasurements.filter(
          (row) => !gridApi.getSelectedRows().map(r=>r.id).includes(row.id)
        )
      : SavedMeasurements;
  computeSim(unselectedRows);
}

function runSimWithSelected() {
  // make an array with just the selected rows
  const selectedRows = gridApi.getSelectedRows();
  computeSim(selectedRows);
}

function resetButtonsDisabled(state) {
  document.querySelectorAll('button.compute-sim-button').forEach(
    node => {
      node.disabled = state;
    }
  )
}