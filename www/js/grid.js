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
      var canvas = document.getElementById("CursorLayer");
      var ctx = canvas.getContext("2d");
      highlightLine(p.data.line1, ctx, 3000);
      highlightLine(p.data.line2, ctx, 3000);
      highlightLine(p.data.line3, ctx, 3000);
      highlightLine(p.data.line4, ctx, 3000);
    }
  },
  onGridReady: (params) => {
    gridApi = params.api;
    console.log("my grid is ready", params);
  },
  getRowId: (params) => params.data.id,
};

const myGridElement = document.querySelector("#caltable");
agGrid.createGrid(myGridElement, agGridOptions);
// Use this to update/ interact.
let gridApi = null;

function highlightLine(line, ctx, time) {
  ctx.fillStyle = "red";
  ctx.strokeStyle = "red";
  doDrawLine(line, ctx);
  ctx.fillStyle = "black";
  ctx.strokeStyle = "#999";
  setTimeout(() => {
    doDrawLine(line, ctx);
  }, time);
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
