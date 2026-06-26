const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const dropSound = document.getElementById("drop");
const clearSound = document.getElementById("clear");

let x = 10;
let y = 0;

let yoffset = 0;
const objpos = Array.from({ length: 9 }, () => Array(16).fill(0));
const grid = Array.from({ length: 9 }, () => Array(16).fill(0));

const speed = 4;
let tick = 0;

let obj = 0;
let nextobj = parseInt(Math.floor(Math.random() * 7));
nextobj++;
let direction = 0;

let landed = true;
let tobottom = true;

let offsetL = 0;
let offsetR = 0;

let score = 0;
let highscore = 0;

const block = new Image();
block.src = "block.png";

const keys = {};
const prevkeys = {};

if (localStorage.getItem("highscore") === null) {
  localStorage.setItem("highscore",0);
}

document.addEventListener("keydown", (event) => {
  keys[event.key] = true;
});

document.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

// update----------------------------------------------------------------
function update() {
  yoffset += speed;

  if (yoffset > 32) {
    objDown();
    yoffset %= 32;
  }

  if (keys["a"] && !prevkeys["a"]) {
    for (let s = 0; s < 16; s++) {
      if (objpos[0][s] !== 0) {
        s = 16;
      } else if (s == 15) {
        if(canmove(objpos,9,16,1)) {
          objLeft(objpos,9,16);
          x--;
        }
      }
    }
  }
  if (keys["a"]) prevkeys["a"] = true;
  else prevkeys["a"] = false;

  if (keys["d"] && !prevkeys["d"] && x < 13 - offsetR) {
    for (let s = 0; s < 16; s++) {
      if (objpos[8][s] !== 0) {
        s = 16;
      } else if (s == 15) {
        if(canmove(objpos,9,16,2)) {
          objRight(objpos,9,16);
          x++;
        }
      }
    }
  }
  if (keys["d"]) prevkeys["d"] = true;
  else prevkeys["d"] = false;

  if (keys["s"] && !prevkeys["s"] || keys["w"] && !prevkeys["w"]) {
    rotate();
  }
  if (keys["s"] || keys["w"]) {
    prevkeys["s"] = true; prevkeys["w"] = true;
  } 
  else {
    prevkeys["s"] = false;
    prevkeys["w"] = false;
  }
  
  if (keys["c"]) {
    localStorage.setItem("highscore",0);
    clear();
  }

  if (keys[" "] && !prevkeys[" "]) {
    tobottom = true;
  }
  if (keys[" "]) prevkeys[" "] = true;
  else prevkeys[" "] = false;

  if (tobottom) {
    let done = false;
    for(let o = 0; o < 9; o++) {
      if(objpos[o][15] !== 0) {
        done = true;
      }
    }
    if(!done) objDown();
  }

  y += speed;

  if (landed) {
    dropSound.play();
    tobottom = false;
    y = 32;
    obj = nextobj;
    nextobj = parseInt(Math.floor(Math.random() * 7));
    nextobj++;
    direction = 0;

    clearobj();
    switch (obj) {
      case 0: //o
        objpos[x - 5][0] = 1;
        break;
      case 1: //O
        if (x >= 13) x--;
        if(x <= 5) x = 5;
        objpos[x - 5][0] = 1;
        objpos[x - 4][0] = 1;
        objpos[x - 5][1] = 1;
        objpos[x - 4][1] = 1;
        break;
      case 2: // I
        if(x <= 5) x = 5;
        objpos[x - 5][0] = 1;
        objpos[x - 5][1] = 2; //mitte
        objpos[x - 5][2] = 1;
        objpos[x - 5][3] = 1;
        break;
      case 3: // T
        console.log(x);
        if (x >= 12) x -= 2;
        if (x <= 5) x = 5;
        objpos[x - 4][0] = 1;
        objpos[x - 3][1] = 1;
        objpos[x - 5][1] = 1;
        objpos[x - 4][1] = 2; //mitte
        break;
      case 4: // L
        if (x >= 13) x--;
        if(x <= 5) x = 5;
        objpos[x - 5][0] = 2; //mitte
        objpos[x - 5][1] = 1;
        objpos[x - 5][2] = 1;
        objpos[x - 4][2] = 1;
        break;  
      case 5: // RL
        if (x <= 5) x = 6;
        objpos[x - 5][0] = 2; //mitte
        objpos[x - 5][1] = 1;
        objpos[x - 5][2] = 1;
        objpos[x - 6][2] = 1;
        break;
      case 6: // Z
        if (x >= 12) x -= 2;
        if (x <= 5) x = 5;
        objpos[x - 5][0] = 1;
        objpos[x - 4][0] = 1;
        objpos[x - 4][1] = 2; //mitte
        objpos[x - 3][1] = 1;
        break;
      case 7: // RZ
        if (x >= 12) x -= 2;
        if (x <= 5) x = 5;
        objpos[x - 3][0] = 1;
        objpos[x - 4][0] = 1;
        objpos[x - 4][1] = 2; //mitte
        objpos[x - 5][1] = 1;
        break;
      default:
        objpos[x - 5][0] = 1;
        break;
    }
  }
  landed = false;

  if (score > highscore) {
    localStorage.setItem("highscore",score);
    highscore = score;
  }

  checkdown();
  checkrow();
  checktop();

  tick += 1;
  tick = tick % 60;

}
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
gameLoop();

//drawing next block  ===============================================================
function o(offset) {
  ctx.drawImage(block, offset[0], offset[1], 32, 32);
}
function O(offset) {
  ctx.drawImage(block, offset[0], offset[1], 32, 32);
  ctx.drawImage(block, offset[0] + 32, offset[1], 32, 32);
  ctx.drawImage(block, offset[0], offset[1] - 32, 32, 32);
  ctx.drawImage(block, offset[0] + 32, offset[1] - 32, 32, 32);
}
function I(offset) {
  ctx.drawImage(block, offset[0], offset[1] - 64, 32, 32);
  ctx.drawImage(block, offset[0], offset[1] - 32, 32, 32);
  ctx.drawImage(block, offset[0], offset[1], 32, 32);
  ctx.drawImage(block, offset[0], offset[1] + 32, 32, 32);
  // lg MIchi
}
function T(offset) {
  ctx.drawImage(block, offset[0], offset[1], 32, 32);
  ctx.drawImage(block, offset[0] + 32, offset[1], 32, 32);
  ctx.drawImage(block, offset[0] + 32, offset[1] - 32, 32, 32);
  ctx.drawImage(block, offset[0] + 64, offset[1], 32, 32);
}
function L(offset) {
  ctx.drawImage(block, offset[0], offset[1], 32, 32);
  ctx.drawImage(block, offset[0], offset[1] - 32, 32, 32);
  ctx.drawImage(block, offset[0], offset[1] - 64, 32, 32);
  ctx.drawImage(block, offset[0] + 32, offset[1], 32, 32);
}
function RL(offset) {
  ctx.drawImage(block, offset[0], offset[1], 32, 32);
  ctx.drawImage(block, offset[0], offset[1] - 32, 32, 32);
  ctx.drawImage(block, offset[0], offset[1] - 64, 32, 32);
  ctx.drawImage(block, offset[0] + -32, offset[1], 32, 32);
}
function Z(offset) {
  ctx.drawImage(block, offset[0], offset[1] -32 , 32, 32);
  ctx.drawImage(block, offset[0] + 32, offset[1], 32, 32);
  ctx.drawImage(block, offset[0] + 32, offset[1] - 32, 32, 32);
  ctx.drawImage(block, offset[0] + 64, offset[1] , 32, 32);
}
function RZ(offset) {
  ctx.drawImage(block, offset[0], offset[1], 32, 32);
  ctx.drawImage(block, offset[0] + 32, offset[1], 32, 32);
  ctx.drawImage(block, offset[0] + 32, offset[1] - 32, 32, 32);
  ctx.drawImage(block, offset[0] + 64, offset[1] -32 , 32, 32);
}

//Move obj  ==================================================================
function objDown() {
  for (let i = 0; i < 9; i++) {
    for (let k = 15; k > 0; k--) {
      objpos[i][k] = objpos[i][k - 1];
    }
    objpos[i][0] = 0;
  }
  //six seven von Pühre
}
function objLeft(arr,l,h) { //kann mit L und RL in die Wand
  for (let i = 1; i < l; i++) {
    for (let k = 0; k < h; k++) {
      arr[i - 1][k] = arr[i][k];
    }
  }
  for (let k = 0; k < h; k++) {
    arr[l-1][k] = 0;
  }
}
function objRight(arr,l,h) { //9 und 16
  for (let i = l-2; i >= 0; i--) {
    for (let k = 0; k < h; k++) {
      arr[i + 1][k] = arr[i][k];
    }
  }
  for (let k = 0; k < h; k++) {
    arr[0][k] = 0;
  }
}
function movedown(pos) {
  console.log(grid);
  for (let i = 0; i < 9; i++) {
    for (let k = 0; k < pos; k++) {
      grid[i][pos - k] = grid[i][pos - k - 1];
    }
    grid[i][0] = 0;
  }
}
function rotate() {

  if (obj === 4 || obj === 5) {
    for(let k = 0; k < 9; k++) {
      for(let i = 0; i < 2; i++) {
        if(objpos[k][i] == 1) {
          return;
        }
      }
      if (objpos[k][15] == 1) {
        return;
      }
    }
  }

  const objrotate = Array.from({ length: 15 }, () => Array(16).fill(0));
  let xm = 0;
  let ym = 0;
  let delx = 0;
  let dely = 0;

  let temp = 0;
  let found = false;

  for (let i = 0; i < 9 && !found; i++) {
    for (let k = 0; k < 16; k++) {
      if (i === 8 && k === 15) {
        return;
      }
      if (objpos[i][k] === 2) {
        xm = i;
        ym = k;
        objrotate[i + 3][k] = 2;
        found = true;
        break;
      }
    }
  }
  for (let i = 0; i < 9; i++) {
    for (let k = 0; k < 16; k++) {
      if (objpos[i][k] === 1) {
        delx = i - xm;
        dely = k - ym;

        temp = delx;
        delx = dely;
        dely = temp;

        if (delx * delx > dely * dely && (direction % 2 !== 0 && obj !== 6 && obj !== 7)) {
          delx *= -1;
        } else {
          dely *= -1;
        }

        objrotate[xm + delx + 3][ym + dely] = 1;
      }
    }
  }

  for(let i = 0; i < 3; i++) {
    for(let k = 0; k < 16; k++) {
      if(objrotate[i][k] >= 1) {
        objRight(objrotate,15,16);
        objRight(objrotate,15,16);
        x+=2;
      }
      if(objrotate[14 - i][k] >= 1) {
        objLeft(objrotate,15,16);
        objLeft(objrotate,15,16);
        x-=2;
      }
    }
  }

  if(canrotate(objrotate) == false) {
    return;
  }

  for (let i = 0; i < 9; i++) {
    for (let k = 0; k < 16; k++) {
      objpos[i][k] = objrotate[i + 3][k];
    }
  }

  if (obj === 4 || obj === 5) {
    switch (direction) {
      case 1:
        if(canmove(objpos,9,16,2)) {
            objRight(objpos,9,16);
            x++;
        }
        else {return;}
        break;
      case 3:
        if(canmove(objpos,9,16,1)) {
          objLeft(objpos,9,16);
          x--;
        }
        else {return;}
        break;
      default:
        break;
    }
  }

  direction++;
  direction %= 4;
}

//Clear  ================================================================
function clearobj() {
  for (let j = 0; j < 9; j++) {
    for (let k = 0; k < 16; k++) {
      objpos[j][k] = 0;
    }
  }
}
function clear() {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 16; j++) {
      grid[i][j] = 0;
    }
  }
  score = 0;
}

//Draw  ========================================================================
function drawobj() {
  for (let i = 0; i < 9; i++) {
    for (let k = 0; k < 16; k++) {
      if (objpos[i][k] >= 1) {
        ctx.drawImage(block, i * 32 + 160, k * 32 + 64 + yoffset, 32, 32);
      }
    }
  }
}
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(55, 55, 55, 1)";
  ctx.fillRect(32 * 5 - 3, 93, 32 * 9 + 6, 32 * 16 + 6);

  ctx.fillStyle = "rgba(87, 87, 87, 1)";
  ctx.fillRect(32 * 5, 96, 32 * 9, 32 * 16);

  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(32 * 14.5 - 3, 32 * 7 - 3, 32 * 5 + 6, 32 * 6 + 6);

  ctx.fillStyle = "rgba(87, 87, 87, 1)";
  ctx.fillRect(32 * 14.5, 32 * 7, 32 * 5, 32 * 6);

  switch (nextobj) {
    case 0:
      o([32 * 16.5, 304]);
      break;
    case 1:
      O([32 * 16, 320]);
      break;
    case 2:
      I([32 * 16.5, 320]);
      break;
    case 3:
      T([32 * 15.5, 320]);
      break;
    case 4:
      L([32 * 16, 336]);
      break;
    case 5:
      RL([32 * 17, 336]);
      break;
    case 6:
      Z([32 * 15.5, 320]);
      break;
    case 7:
      RZ([32 * 15.5, 320]);
      break;
    default:
      break;
  }

  drawobj();

  ctx.fillStyle = "rgb(202, 202, 202)";
  ctx.fillRect(0, 0, 640, 96);

  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(32 * 5 - 3, 93, 32 * 9 + 6, 3);

  ctx.font = "20px Monospace";
  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillText("Next Block", 480, 216, 128);

  ctx.fillText("Highscore: " + localStorage.getItem("highscore"), 200, 75, 256);
  ctx.fillText("Score: " + score, 200, 55, 128);

  blocks();
}
function blocks() {
  for (let x = 0; x < 9; x++) {
    for (let y = 0; y < 16; y++) {
      if (grid[x][y] >= 1) {
        ctx.drawImage(block, x * 32 + 160, y * 32 + 96, 32, 32);
      }
    }
  }
}

//Check  =======================================================================
function checktop() {
  for (let i = 0; i < 9; i++) {
    if (grid[i][0] !== 0) {
      clear();
    }
  }
}
function checkrow() {
  let count = 0;
  for (let k = 0; k < 16; k++) {
    //y
    count = 0;
    for (let i = 0; i < 9; i++) {
      //x
      if (grid[i][k] >= 1) {
        count++;
      }
      if (count == 9) {
        console.log("Clear", k);
        for (let j = 0; j < 9; j++) {
          grid[j][k] = 0;
        }
        movedown(k);
        score += 100;
        clearSound.play();
      }
    }
  }
  return;
}
function checkdown() {
  for (let i = 0; i < 9; i++) {
    if (objpos[i][15] >= 1 && yoffset >= 32) {
      objtogrid(-1);
      clearobj();
      landed = true;
      return;
    }
  }
  for (let j = 0; j < 9; j++) {
    for (let k = 0; k < 16; k++) {
      if (
        objpos[j][k] + grid[j][k] >= 2 &&
        grid[j][k] > 0 &&
        objpos[j][k] > 0
      ) {
        objtogrid(0);
        clearobj();
        landed = true;
      }
    }
  }
}
function canmove(arr,l,h,LR) {
  const moveobj = Array.from({ length: l }, () => Array(h).fill(0));
  for(let i = 0; i < l; i++) {
    for(let k = 0; k < h; k++) {
      moveobj[i][k] = arr[i][k];
    }
  }
  switch (LR) {
    case 1:
      objLeft(moveobj,l,h);
      break;
    case 2:
      objRight(moveobj,l,h);
      break;
    default:
      break;
  }
  for(let i = 0; i < 9; i++) {
    for(let k = 0; k < 16; k++) {
      if(moveobj[i + ((9 - l) / 2)][k] !== 0 && grid[i][k] !== 0 && (moveobj[i + ((9 - l) / 2)][k] + grid[i][k] > 1)) {
        return false;
      }
    }
  }
  return true;
}
function canrotate(arr) {
  for(let i = 0; i < 9; i++) {
    for(let k = 0; k < 16; k++) {
      if(arr[i][k] > 0 && grid[i][k] > 0) {
        return false;
      }
    }
  }
  return true;
}

//obj to grid =================================================================
function objtogrid(correct) {
  for (let j = 0; j < 9; j++) {
    for (let k = 0; k < 16; k++) {
      if (objpos[j][k] !== 0) {
        grid[j][k - 1 - correct] = objpos[j][k];
      }
    }
  }
}