//////////////////////////////////////////////////////////////////////////////
/// Pre-process
//////////////////////////////////////////////////////////////////////////////

class HourMET {
  constructor(hours, u, phi, pgcat) {
      this.Hours = hours;
      this.U = u;
      this.PHI = phi;
      this.PGCat = pgcat;
  }
}

function Round(x, places) {
  return Math.round(x*places) / places;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function GenMET(rsdm, hours) {
  // Create initial met hour based on browser values
  let wdirRad = rsdm.wdir * Math.PI / 180;
  
  let met = [];
  if (hours <= 1) {
      // If generating a single hour, use user values
      met.push(new HourMET(1, rsdm.wspd, wdirRad, rsdm.pgcat));
  } else {
      // Generate random hours
      for (let h=0; h<hours; h++) {
          // Generate random wind direction 0 - 350 degrees and convert to radians
          let wdir = getRandomInt(360);
          wdirRad = wdir * Math.PI / 180;

          // Generate a random windspeed (1-50 m/s) and PG class (A-F)
          const wspd = getRandomInt(50) + 1;
          const pgcat = "ABCDEF"[getRandomInt(6)];

          // Construct met hour
          met.push(new HourMET(hours, wspd, wdirRad, pgcat));
      }
  }
  return met;
}

//////////////////////////////////////////////////////////////////////////////
/// Disperse
//////////////////////////////////////////////////////////////////////////////

const g = 9.80616;           // Gravitational constant
const ambientTemp = 293.15;  // Fixed ambient temperature [K] (20 C)

function sigmaY(c, d) {
  return x => {
      const theta = 0.017453293 * (c - d*Math.log(x));
      return 465.11628 * x * Math.tan(theta);
  };
}

const SigmaY = {
  "A": sigmaY(24.1670, 2.5334),
  "B": sigmaY(18.3330, 1.8096),
  "C": sigmaY(12.5000, 1.0857),
  "D": sigmaY(8.3330, 0.72382),
  "E": sigmaY(6.2500, 0.54287),
  "F": sigmaY(4.1667, 0.36191),
};

function sigmaZ(a, b, x) {
  return a * Math.pow(x, b);
}

const SigmaZ = {
  "A": sigmaZA,
  "B": sigmaZB,
  "C": sigmaZC,
  "D": sigmaZD,
  "E": sigmaZE,
  "F": sigmaZF,
};

function sigmaZA(x) {
  let Sz = 0;
  if (x <= 0.10) {Sz = sigmaZ(122.800, 0.94470, x);} else
  if (x <= 0.15) {Sz = sigmaZ(158.080, 1.05420, x);} else
  if (x <= 0.20) {Sz = sigmaZ(170.220, 1.09320, x);} else
  if (x <= 0.25) {Sz = sigmaZ(179.520, 1.12620, x);} else
  if (x <= 0.30) {Sz = sigmaZ(217.410, 1.26440, x);} else
  if (x <= 0.40) {Sz = sigmaZ(258.890, 1.40940, x);} else
  if (x <= 0.50) {Sz = sigmaZ(346.750, 1.72830, x);} else
  if (x <= 3.11) {Sz = sigmaZ(453.850, 2.11660, x);} else
  {Sz = 5000;}
  
  if (Sz > 5000.0) {
      Sz = 5000.0;
  }
  return Sz;
}

function sigmaZB(x) {
  let Sz = 0;
  if (x <= 0.20) {Sz = sigmaZ(90.673, 0.93198, x);} else
  if (x <= 0.40) {Sz = sigmaZ(98.483, 0.98332, x);} else
  {Sz = sigmaZ(109.300, 1.09710, x);}

  if (Sz > 5000.0) {
      Sz = 5000.0;
  }
  return Sz;
}

function sigmaZC(x) {
  let Sz = sigmaZ(61.141, 0.91465, x);
  
  if (Sz > 5000.0) {
      Sz = 5000.0;
  }
  return Sz;
}

function sigmaZD(x) {
  let Sz = 0;
  if (x <= 0.30) {Sz = sigmaZ(34.459, 0.86974, x);} else
  if (x <= 1.00) {Sz = sigmaZ(32.093, 0.81066, x);} else
  if (x <= 3.00) {Sz = sigmaZ(32.093, 0.64403, x);} else
  if (x <= 10.00)	{Sz = sigmaZ(33.504, 0.60486, x);} else
  if (x <= 30.00) {Sz = sigmaZ(36.650, 0.56589, x);} else
  {Sz = sigmaZ(44.053, 0.51179, x);}

  return Sz;
}

function sigmaZE(x) {
  let Sz = 0;
  if (x <= 0.10) {Sz = sigmaZ(24.260, 0.83660, x);} else
  if (x <= 0.30) {Sz = sigmaZ(23.331, 0.81956, x);} else
  if (x <= 1.00) {Sz = sigmaZ(21.628, 0.75660, x);} else
  if (x <= 2.00) {Sz = sigmaZ(21.628, 0.63077, x);} else
  if (x <= 4.00) {Sz = sigmaZ(22.534, 0.57154, x);} else
  if (x <= 10.00)	{Sz = sigmaZ(24.703, 0.50527, x);} else
  if (x <= 20.00) {Sz = sigmaZ(26.970, 0.46713, x);} else
  if (x <= 40.00)	{Sz = sigmaZ(35.420, 0.37615, x);} else
  {Sz = sigmaZ(47.618, 0.29592, x);}
  
  return Sz;
}

function sigmaZF(x) {
  let Sz = 0;
  if (x <= 0.20) {Sz = sigmaZ(15.209, 0.81558, x);} else
  if (x <= 0.70) {Sz = sigmaZ(14.457, 0.78407, x);} else
  if (x <= 1.00) {Sz = sigmaZ(13.953, 0.68465, x);} else
  if (x <= 2.00) {Sz = sigmaZ(13.953, 0.63227, x);} else
  if (x <= 3.00) {Sz = sigmaZ(14.823, 0.54503, x);} else
  if (x <= 7.00) {Sz = sigmaZ(16.187, 0.46490, x);} else
  if (x <= 15.00) {Sz = sigmaZ(17.836, 0.41507, x);} else
  if (x <= 30.00) {Sz = sigmaZ(22.651, 0.32681, x);} else
  if (x <= 60.00) {Sz = sigmaZ(27.074, 0.27436, x);} else
  {Sz = sigmaZ(34.219, 0.21716, x);}

  return Sz;
}

const windProfile = {
  "urban": {
      "A": 0.15,
      "B": 0.15,
      "C": 0.20,
      "D": 0.25,
      "E": 0.30,
      "F": 0.30,
  },
  "rural": {
      "A": 0.07,
      "B": 0.07,
      "C": 0.10,
      "D": 0.15,
      "E": 0.35,
      "F": 0.55,
  },
};

/*
Calculate effective wind speed, using "power law" method

inputs:
uzref		[m/s]	wind speed of actual measurment
z			[m]		target elevation
zref		[m]		elevation of actual measurement
pgcat		[]		Pasquill-Gifford stability category
profileType	[]		"urban" or "rural"

returns:
Uz			[m/s] 	estimated wind speed at target elevation z
*/
function CalcUz(uzref, z, zref, pgcat, profileType) {
  // p is the wind profile exponent factor
  const p = windProfile[profileType][pgcat];
  const Uz = uzref * Math.pow(z/zref, p);
  return Uz;
}

/*
Calculate concentration at distance x along plume, at perpendicular offset y and height z

inputs:
x		[km]	receptor distance downwind along plume centreline
y		[m]		receptor perpendicular offset from plume centreline
z		[m]		receptor height
Uz		[m/s]	wind speed at stack exit
Q		[g/s]	pollutant mass emission rate
H		[m]		effective stack height (includes plume rise)
sigY	[f(m)]	y plume sigma formula (function of distance in m)
sigZ	[f(m)]	z plume sigma formula (function of distance in m)

returns:
conc	[g/m3]	calculated receptor concentration
*/
function C(x, y, z, Uz, Q, H, sigY, sigZ) {
  // Early return if coordinate upwind, as concentration always zero
  if (x <= 0) {
      return 0;
  }

  let Sz = sigZ(x);
  let Sy = sigY(x);

  let Sz2 = 2 * Sz * Sz;
  let Sy2 = 2 * Sy * Sy;

  let c1 = Q / (2 * Math.PI * Uz * Sy * Sz);
  let c2 = Math.exp(-1 * (z - H) * (z - H) / Sz2);
  let c3 = Math.exp(-1 * (z + H) * (z + H) / Sz2);
  let c4 = Math.exp(-1 * y * y / Sy2);

  let conc = c1 * (c2 + c3) * c4; // g/m3
  if (!isFinite(conc)) {
      conc = 0;
  }
  return conc;
}

/*
Calculates the plume rise (dH) and a downwind plume offset (Xf), using Briggs model.

inputs:
us		[m/s]	wind velocity at stack tip
vs		[m/s]	stack exit velocity
ds		[m]		stack tip diameter
Ts		[K]		stack tip temperature
Ta		[K]		ambient temperature
pgcat	[]		Pasquill-Gifford stability category

returns:
dH		[m]		plume rise
Xf		[m]		plume rise offset
*/
function plumeRise(us, vs, ds, Ts, Ta, pgcat) {
  // Compute buoyancy flux
  const Fb = g * vs * ds * ds * (Ts - Ta) / (4 * Ts);
  // Calculate momentum flux
  const Fm = vs * vs * ds * ds * Ta / (4 * Ts);

  let Xf = 0;
  let dH = 0;

  // Stable PG categories
  if (pgcat === "E" || pgcat === "F") {
      let eta = 0;
      if (pgcat === "E") {
          eta = 0.020;
      } else {
          eta = 0.035;
      }
      const s = g * eta / Ta;
      const dT = 0.019582 * Ts * vs * Math.sqrt(s);
      // Buoyancy dominated
      if ((Ts - Ta) >= dT) {
          Xf = 2.0715 * us / Math.sqrt(s);
          dH = 2.6 * Math.pow(Fb/(us*s), 0.333333333333);
          // Momentum dominated
      } else {
          Xf = 0;
          // Calculate unstable/neutral and stable plume rise and take min
          const prUN = 3.0 * ds * vs / us;
          const prS = 1.5 * Math.pow(Fm/(us*Math.sqrt(s)), 0.333333333333);
          dH = Math.min(prUN, prS);
      }
      // Unstable or neutral PG categories
  } else {
      // Unstable or neutral
      if (Fb < 55.0) {
          // Check for buoyancy dominated or momentum
          const dT = 0.0297 * Ts * Math.pow(vs, 0.333333333333) / Math.pow(ds, 0.666666666667);
          // Buoyancy dominated
          if ((Ts - Ta) >= dT) {
              Xf = 49.0 * Math.pow(Fb, 0.625);
              dH = 21.425 * Math.pow(Fb, 0.75) / us;
              // Momentum dominated
          } else {
              Xf = 0;
              dH = 3.0 * ds * vs / us;
          }
      } else {
          const dT = 0.00575 * Ts * Math.pow(vs, 0.666666666667) / Math.pow(ds, 0.333333333333);
          if ((Ts - Ta) >= dT) {
              Xf = 119.0 * Math.pow(Fb, 0.4);
              dH = 38.71 * Math.pow(Fb, 0.6) / us;
          } else {
              Xf = 0;
              dH = 3.0 * ds * vs / us;
          }
      }
  }
  return [dH, Xf];
}

/*
Iterate though each met hour and calculate concentrations across plan and slice grids.

Uses a single source located at the origin, at a user specified height.
*/
function iterDisp(rsdm, met) {
  // PNG array offsets
  const yc = rsdm.rGrid.length - 1;
  const zc = rsdm.hCoords.ymax / rsdm.hCoords.ygap;
  
  for (const metline of met) {
      // Calculate effective wind speed at stack tip (user specified wind speed is for 10 m)
      let Uz = CalcUz(metline.U, rsdm.source.elevation, 10, metline.PGCat, rsdm.roughness);
      
      // Calculate plume rise using Briggs equations
      let Ts = rsdm.source.temp + 273.15;
      let [dH, Xf] = plumeRise(Uz, rsdm.source.velocity, rsdm.source.diameter, Ts, ambientTemp, metline.PGCat);
      let H = rsdm.source.elevation + dH;
      let Q = rsdm.source.emission;
      
      let sinPHI = Math.sin(metline.PHI);
      let cosPHI = Math.cos(metline.PHI);
      let sigY = SigmaY[metline.PGCat];
      let sigZ = SigmaZ[metline.PGCat];
      
      // Calculate concentrations for plan view grid (fixed grid height of 0 m)
      let x = 0;
      let total = 0;
      for (let Xr=rsdm.rCoords.xmin; Xr<=rsdm.rCoords.xmax; Xr+=rsdm.rCoords.xgap) {
          let y = 0;
          for (let Yr=rsdm.rCoords.ymin; Yr<=rsdm.rCoords.ymax; Yr+=rsdm.rCoords.ygap) {
              if (Uz > 0.5) {
                  let [xx, yy] = rsdm.source.windComponents(Xr, Yr, sinPHI, cosPHI);
                  xx -= (Xf / 1000); // Plume rise correction
                  rsdm.rGrid[yc-y][x] += C(xx, yy, 0, Uz, Q, H, sigY, sigZ) / metline.Hours;
              }
              y++;
          }
          x++;
      }

      // Calculate concentrations for 2d slice showing height profile along plume
      let z = 0;
      let offset = (rsdm.hCoords.xmax - rsdm.hCoords.xmin) / 2 / rsdm.hCoords.xgap;
      for (let Zh=0; Zh<=rsdm.hCoords.ymax; Zh+=rsdm.hCoords.ygap) {
          x = 0;
          if (Uz > 0.5) {
              for (let Xh=0; Xh<=rsdm.hCoords.xmax; Xh+=rsdm.hCoords.xgap) {
                  let xx = (Xh - Xf) / 1000; // Includes plume rise correction
                  rsdm.hGrid[zc-z][offset+x] += C(xx, 0.0, Zh, Uz, Q, H, sigY, sigZ) / metline.Hours;
                  x++;
              }
          }
          z++;
      }
  }
}

//////////////////////////////////////////////////////////////////////////////
/// Visualise
//////////////////////////////////////////////////////////////////////////////

const bands = 10

// Extract max value from 2d grid
function gridMax(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  let max = -1.0;
  
  for (let y=0; y<rows; y++) {
      for (let x=0; x<cols; x++) {
          if (grid[y][x] > max) {
              max = grid[y][x];
          }
      }
  }
  return max;
}

function updatePNG(grid, disp, max, imgData) {
  const rows = grid.length;
  const cols = grid[0].length;
  
  // Calculate min based on max - use log to band
  const min = Math.trunc(Math.log10(max)) - bands;

  // Normalise 2d grid into bands by taking log
  for (let y=0; y<rows; y++) {
      for (let x=0; x<cols; x++) {
          if (grid[y][x] > 0.0) {
              disp[y][x] = Math.trunc(Math.log10(grid[y][x]));
          } else {
              disp[y][x] = min;
          }
      }
  }

  // Construct an image of the given width and height
  let i = 0;
  for (let y=0; y<rows; y++) {
      for (let x=0; x<cols; x++) {
          // Calculate offset as encoding in repeating blocks of RGBA
          i = (y * cols + x) * 4;
          
          // Default pixel set to white
          pixelR = 255;
          pixelG = 255;
          pixelB = 255;
          pixelA = 0; //255;
          
          // Set shade of red if concentration meets criteria
          if (disp[y][x] > min) {
              let conc = (disp[y][x] - min) / bands;
              pixelR = 255;
              pixelB = 255 - 255*conc;
              pixelG = 255 - 255*conc;
              conc>0&&(pixelA=255);
          }

          imgData.data[i] = pixelR;
          imgData.data[i+1] = pixelG;
          imgData.data[i+2] = pixelB;
          imgData.data[i+3] = pixelA;
      }
  }
}

function generatePNG(grid, disp, max) {
  // Cacuclate grid dimensions
  const rows = grid.length;
  const cols = grid[0].length;

  // Create temporary canvas
  let canvas = document.createElement('canvas');
  let context = canvas.getContext('2d');
  let imgData = context.createImageData(cols, rows);

  canvas.height = rows;
  canvas.width = cols;
  
  // Update imgData array inplace with rendered image
  updatePNG(grid, disp, max, imgData);

  // put data to context at (0, 0)
  context.putImageData(imgData, 0, 0);

  // Return base64 encoded PNG image
  return canvas.toDataURL('image/png');
}

function exportPNG(data, target) {
  document.getElementById(target).src = data;
}


//////////////////////////////////////////////////////////////////////////////
/// RSDM
//////////////////////////////////////////////////////////////////////////////

// Mapping of image quality selection to grid step (m)
const gridQuality = {
  "Low":    50,
  "Medium": 25,
  "High":   10,
  "Higher":  5,
  "Highest": 1,
};

// Grid is a class defining the output grid dimensions
class Grid {
  constructor(xmin, xmax, ymin, ymax, xgap, ygap) {
      this.xmin = xmin; // x extents (m)
      this.xmax = xmax;
      this.ymin = ymin; // y extents (m)
      this.ymax = ymax;
      this.xgap = xgap; // x step (m)
      this.ygap = ygap; // y step (m)
  }

  generateGrid() {
      const cols = (this.xmax - this.xmin) / this.xgap + 1;
      const rows = (this.ymax - this.ymin) / this.ygap + 1;
      
      let grid = Array(rows).fill().map(() => Array(cols).fill(0));
      return grid;
  }
}

// Source is a class defining the stack parameters (emission source)
class Source {
  constructor(x, y, elevation, diameter, velocity, temp, emission) {
      this.x = x;                 // Stack x location (m)
      this.y = y;                 // Stack y location (m)
      this.elevation = elevation; // Stack height (m)
      this.diameter = diameter;   // Stack diameter (m)
      this.velocity = velocity;   // Plume velocity at stack tip (m/s)
      this.temp = temp;           // Plume temperature (C)
      this.emission = emission;   // Stack emission rate (g/s)
  }
  
  /*
  Calculate the downwind (x) and crosswind (y) plume components from rectangular coordinates.
  inputs:
  Xr		[m]		easting relative to origin at stack
  Yr		[m]		northing relative to origin at stack
  sinPHI	[]	    sine of wind direction
  cosPHI	[]	    cosine of wind direction

  returns:
  x		[km]	downwind plume receptor distance
  y		[m]		crosswind plume receptor distance
  */
  windComponents(Xr, Yr, sinPHI, cosPHI) {
      const x = (-1*(Xr-this.x)*sinPHI - (Yr-this.y)*cosPHI) / 1000;
      const y = (Xr-this.x)*cosPHI - (Yr-this.y)*sinPHI;
      return [x, y];
  }
}

// RSDM is a class for maintaining the state of all key data variables
class RSDM {
  constructor() {
      let source = new Source(0.0, 0.0, 50.0, 0.5, 10.0, 60.0, 1.0);
      
      this.grid = gridQuality["High"];
      this.wspd = 5.0;
      this.wdir = 0;
      this.roughness = "urban";
      this.pgcat = 'C';
      this.source = source;

      this.setupGrids();
  }

  setupGrids() {
      // Initialises internal grids used for display buffers.
      // Should be called to reset simulation.

      // Setup x,y grid for plan view
      this.rCoords = new Grid(-5000, 5000, -5000, 5000, this.grid, this.grid);
      this.rGrid = this.rCoords.generateGrid();
      this.rDisp = this.rCoords.generateGrid();
      
      // Setup x,z plane height plume cross-section view
      this.hCoords = new Grid(-5000, 5000, 0, 2000, this.grid, this.grid/2);
      this.hGrid = this.hCoords.generateGrid();
      this.hDisp = this.hCoords.generateGrid();
  }

  clearGrid(grid) {
      const rows = grid.length;
      const cols = grid[0].length;
      
      for (let y=0; y<rows; y++) {
          for (let x=0; x<cols; x++) {
              grid[y][x] = 0;
          }
      }
  }

  updateImage() {
      // Extract maximum value from grids
      let gridsMax = Math.max(gridMax(this.rGrid), gridMax(this.hGrid));
      
      // Create PNG for plan and plume views
      let rImg = generatePNG(this.rGrid, this.rDisp, gridsMax);
      let hImg = generatePNG(this.hGrid, this.hDisp, gridsMax);
      
      // Create Array by kit119
      //this.rGrid.map(a=>a.map(b=>plume.push(b)))
      
      // Output to browser
      exportPNG(rImg, "rImg");
      exportPNG(hImg, "hImg");
  }

  log(message) {
      //document.getElementById("status").innerText = message;
  }

  runModel(hours) {
      this.clearGrid(this.rGrid);
      this.clearGrid(this.hGrid);

      // Generate random meteorological data for specified number of hours
      let met = GenMET(this, hours);

      // Run disperion model and update internal arrays
      iterDisp(this, met);
  }

  updateModel(parameter){
      //console.log(this),console.log(parameter)
      this.grid = parameter["grid"];
      this.setupGrids();
      this.source["emission"] = parameter["emission"]
      this.source["elevation"] = parameter["elevation"]
      this.source["diameter"] = parameter["diameter"]
      this.source["velocity"] = parameter["velocity"]
      this["pgcat"] = parameter["pgcat"]
      this["wdir"] = parameter["wdir"]
      this["wspd"] = parameter["wspd"]
      this["pgcat"] = parameter["pgcat"]
      this["roughness"] = parameter["roughness"]
      this.runModel(parameter["runhr"]);
      this.updateImage();
      this.log("Ready");
  }
  
  sourceAdj(parameter, value) {
      this.source[parameter] = Number(value);
      this.runModel(1);
      this.updateImage();
  }

  modelAdj(parameter, value) {
      this[parameter] = Number(value);
      this.runModel(1);
      this.updateImage();
  }

  modelAdjDesc(parameter, value) {
      this[parameter] = value;
      this.runModel(1);
      this.updateImage();
  }

  gridAdjDesc(parameter, value) {
      this.grid = gridQuality[value];
      this.setupGrids();
      this.runModel(1);
      this.updateImage();
  }

  simulate(hours) {
      this.runModel(hours);
      this.updateImage();
      this.log("Ready");
  }	
}
