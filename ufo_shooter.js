//objects
let moon;
let stars;
let starGateDots = []
let earth;
let ftlDriveDots = [];
let starGateShellDots = [];
let ufos = {};
let laserShot;
let gameRules;
let font;
const IMAGES = {};
let resetButton;

// consts
let w = 732;
let h = 250;
let s = 7;
let starDotsCount = 6;
let ftlDriveDotsCount = 100;
let starGateRadius = 100;
const particlesExplosionCount = 30;

// ------------------------------------------------------- CLASSES ----------------------------------------- //

class GameRules {
  constructor() {
    this.numberOfLevels = 10;
    this.gameLevel = 1;
    this.counter = 10;
    this.gameLost = false;
    this.levelUfoCount = this.setLevelUfoCount();
    this.countDown = 3;
    this.startShooting = false;
    this.gameScoreStartingX = 0;
  }

  setLevelUfoCount() {
    let levels = {};
    for(let i = 1; i < this.numberOfLevels; i++) {
      levels[i] = {
        ufoCount: i * 5,
        kills: 0,
        timeFactor: i,
      }
    }

    return levels;
  }

  getGameState() {
    return this.gameLost;
  }

  setGameState(state) {
    this.gameLost = state;
  }

  getGameLevel() {
    return this.gameLevel;
  }

  getLevelUfoCount(level) {
    return this.levelUfoCount[level];
  }

  getAllLevels() {
    return this.levelUfoCount;
  }

  incGameLevel() {
    this.gameLevel++;
    this.counter = 60;
  }

  startCounting() {
    const countText = `TIME: ${this.counter}`;
    this.generateInfoText(countText, 10, 30);
    if(frameCount % 60 === 0) {
      this.counter--;
    }

    if(this.counter === 0) {
      this.gameLost = true;
    }
  }

  startCountdownToStart() {
    if(this.countDown > 0) {
      this.customText(this.countDown, w/2, 50);
    }
    
    if(frameCount % 60 === 0) {
      this.countDown--;
    }

    if(this.countDown === 0) {
      this.startShooting = true;
    }
  }

  resetCounter() {
    const timeFactor = this.levelUfoCount[this.gameLevel].timeFactor;
    this.counter = 10 + (timeFactor * 5);
    this.countDown = 3;
    this.startShooting = false;
  }

  incKills() {
    this.levelUfoCount[this.gameLevel].kills++;
  }

  showGameLevel() {
    const gameLevel = `LEVEL: ${this.gameLevel}`;
    this.generateInfoText(gameLevel, 10, 50);
  }

  showKills() {
    const kills = `KILLS: ${this.levelUfoCount[this.gameLevel].kills}`;
    this.generateInfoText(kills, 10, 70);
  }

  showScore() {
    const countKill = Object.keys(this.levelUfoCount).reduce((sum,key)=>sum + (this.levelUfoCount[key].kills||0),0);
    const score = `Your Score: ${countKill}`;
    this.customText(score,this.gameScoreStartingX, 250) 
    this.gameScoreStartingX++
    if(this.gameScoreStartingX === (w + 50)) {
      this.gameScoreStartingX = 0;
    }
  }

  resetGame() {
    location.reload();
  }

  generateInfoText(msg, textX, textY) {
    fill(100);
    textFont(font);
    textSize(20);
    text(msg, textX, textY);
  }

  customText(txt, x, y) {
    fill('red');
    textFont(font);
    textSize(30);
    text(txt, x, y);
  }
}

class Moon {
  constructor(x, y, z) {
    this.x = x | 0;
    this.y = y | 0;
    this.size = s | 2;
    this.vel = 5;
  }

  on() {
    push();
    translate(this.x, this.y, 0);
    texture(IMAGES.moon);
    rotateY(millis() / 10000);
    sphere(this.size);
    pop();
  }

  animate() {
    this.x = w / 2 + sin(frameCount / 30) * 100;
    this.y = h / 2 + cos(frameCount / 30) * 100;
  }
}

class Stars {
  constructor(w, h) {
    this.positions = [];
    for (let i = 0; i < 100; i++) {
      this.positions.push({
        w: random(0, w),
        h: random(0, h)
      });
    }
  }

  blink() {
    noStroke();
    fill(color(random(0, 255)));
    for (let i = 0; i < 100; i++) {
      ellipse(this.positions[i].w, this.positions[i].h, 2, 2);
    }
  }
}

class StarGateDot {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
    this.size = 2;
    this.cY = 150;
    this.cX = 600;
  }

  generate() {
    noStroke();
    fill(0, 212, 254);
    ellipse(this.x, this.y, this.size, this.size);
  }

  spin(i, speed, radius) {
    this.x = this.cX + sin(frameCount/speed+i) * radius;
    this.y = this.cY + cos(frameCount/speed+i) * radius;
  }

}

class ShellDot {
  constructor(x, y, s) {
    this.x = x | 0;
    this.y = y | 0;
    this.size = s | 2;
  }

  on(s) {
    noStroke();
    fill(0, 0, random(0, 255));
    ellipse(this.x, this.y, s, s);
  }
}

class Earth {
  drawEarth() {
    texture(IMAGES.earth);
    rotateY(millis() / 10000);
    sphere(30);
  }
}

class FtlDriveDot {
  constructor(x, y, s) {
    this.x = 600;
    this.y = 150 | y;
    this.s = 2 | s;
    this.vx = random(-5, -1);
    this.alpha = 255;
    this.gravity = 0.1;
  }
  on() {
    noStroke()
    fill(255, this.alpha);
    ellipse(this.x, this.y, this.s, this.s)
  }
  move() {
    this.y;
    this.x += this.vx;
    this.alpha -= 3.5;
    this.s -= 0.01;
  }
  finished() {
    return this.alpha < 0; 
  }
}

class Ufo {
  constructor(x, y) {
    this.x = x || 300;
    this.y = y || 150;
    this.velX = random(-0.1,0.1);
    this.velY = random(-0.1,0.1);
    this.gravity = random(-0.1,0.1);
    this.factor = 10;
    this.size = 10;
    this.id = makeid(10);
    this.shootable = false;
  }

  generate() {
    push();
    translate(this.x, this.y, 0);
    texture(IMAGES.ufo)
    rotateY(millis() / 100);
    ellipsoid(this.size * 2, this.size, this.size * 2);
    pop();
  }

  oscillate() {
    this.x += sin(frameCount / 100 * this.factor - 1);
    this.y += cos(frameCount / 100 * this.factor);
  }

  move() {
    this.x += this.velX;
    this.velX += this.gravity;
    this.y += this.velY;
    this.velY += this.gravity;
    if (this.x + (this.size * 2) < 0 || this.x > w - (this.size * 2)) {
      this.velX = -this.velX;
    }
    if (this.y + this.size < 0 || this.y > h - this.size) {
      this.velY = -this.velY;
    }
  }

  makeShootable() {
    this.shootable = true;
  }

  makeUnshootable() {
    this.shootable = false;
  }

  shooted() {
    const checkShot = dist(mouseX, mouseY, this.x, this.y);
    if(checkShot <= (this.size * 2) && this.shootable) {
      this.destroyUfo();
    }
  }

  destroyUfo() {
    const level = gameRules.getGameLevel();
    gameRules.incKills();
    ufos = {...ufos, [level]: ufos[level].filter(ufo => ufo.id !== this.id)};
    if (ufos[level].length === 0) {
      gameRules.incGameLevel();
      gameRules.resetCounter();
    }
  }
}

class Laser {
  constructor() {
    this.range = 20;
    this.size = 3;
    this.startingX = mouseX;
    this.startingY = mouseY;
    this.leftGunX = this.startingX - this.range;
    this.rightGunX = this.startingX + this.range;
  }

  generateShot() {
    fill(color('red'));
    ellipse(this.leftGunX, this.startingY, this.size, this.size);
    ellipse(this.rightGunX, this.startingY, this.size, this.size);
    this.leftGunX += 2;
    this.rightGunX -= 2;
    if(this.leftGunX === this.startingX && this.rightGunX === this.startingX) {
      laserShot = null;  
    }
  }
}

// ---------------------------------------------- FUNCTIONS ------------------------------------------ //

function makeid(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}


function populateFtlDriveDots() {
  for(let i=0; i< ftlDriveDotsCount; i++) {
    ftlDriveDots.push(new FtlDriveDot());
  }
}


function populateStarGate() {
  for(let i=0; i< starDotsCount; i++) {
    starGateDots.push(new StarGateDot());
  }
}


function populateShellGate() {
  const spacing = 5;
  const cY = 150;
  const cX = 600;
  for(let x = (cX - starGateRadius) / 2; x <= cX + starGateRadius; x += spacing) {
    for(let y = (cY - starGateRadius) / 2; y <= cY + starGateRadius; y += spacing) {
      if((x-cX)*(x-cX) + (y-cY)*(y-cY) <= starGateRadius*starGateRadius) {
          starGateShellDots.push(new ShellDot(x, y, s));
      }
    }
  }
}

function populateExplosionParticles(x, y) {
  let particles = [];
  for(var i = 0; i < particlesExplosionCount; i++) {
    particles.push(new ExplosionParticles(x, y));
  }
  return particles;
}

function explodeWithParticles(particles) {
  particles.forEach((particle) => {
    particle.explode()
  })
}

class ExplosionParticle {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.gravity = createVector(0, 0.3);
    this.vel.mult(random(1, 6));
    this.lifeSpan = 255;
  }

  explode() {
    this.vel.add(this.gravity);
    this.position.add(this.vel);
    this.lifespan -=10;
    stroke(255, this.lifeSpan);
    strokeWeight(2);
    point(this.position.x, this.position.y);
  }
}

function populateUfos() {
  const levels = gameRules.getAllLevels();
  Object.keys(levels).forEach(levelKey => {
    ufos[levelKey] = [];
    for(let i=0; i < levels[levelKey]['ufoCount']; i++) {
      ufos[levelKey].push(new Ufo());
    }
  })
}


function generatePortalBorders(speed, radius) {
  for(let i=0; i< starGateDots.length; i++) {
    starGateDots[i].generate();
    starGateDots[i].spin(i, speed, radius);
  }
}


function generateBlinkingShell() {
  starGateShellDots.map((dot) => {
    s = sin(frameCount / 100) * 3;
    dot.on(s);
  })
}


function dispatchFtlDrive() {
  for (let i = ftlDriveDots.length - 1; i > 0; i--) { // reverse for loop
    ftlDriveDots[i].on();
    ftlDriveDots[i].move();
    if (ftlDriveDots[i].finished()) {
      ftlDriveDots.splice(i, 1);
    }
  }
}


function openStarGatePortal() {
  let speed = 30;
  let radius = 1;

  if(frameCount > 300 && frameCount <= 1000) {
    radius = (frameCount - 300)/7;
    speed = speed - (frameCount - 300)/40;
  } else if(frameCount > 1000 && frameCount < 2000) {
    speed = 6;
    radius = starGateRadius;
  }

  if(frameCount >300 && frameCount < 2000) {
    generatePortalBorders(speed, radius)
  }
  
  if(frameCount > 1200 && frameCount < 1700) {
    generateBlinkingShell();
  }

}

function intro() {
  if(frameCount > 1650) {
    dispatchFtlDrive();
  }
  if(frameCount > 1700) {
    playRound();
  }
}


function playRound() {
  const actualGameLevel = gameRules.getGameLevel();

  if(!gameRules.getGameState()) {
    ufos[actualGameLevel].forEach(ufo => {
      ufo.generate();
    });

    gameRules.startCountdownToStart();

    if(gameRules.startShooting) {
      ufos[actualGameLevel].forEach(ufo => {
        ufo.oscillate();
        ufo.move();
        ufo.makeShootable();
      });
      gameRules.startCounting();
    }
  
  } else {
    gameRules.showScore();
  }
  gameRules.showGameLevel()
  gameRules.showKills();
}


function laserShooting() {
  if(mouseIsPressed && !laserShot) {
    laserShot = new Laser();
  }

  if(laserShot) {
    laserShot.generateShot();
  }
}

// ---------------------------------- P5JS EXECUTION ----------------------------- //

function preload(){
  IMAGES.earth= loadImage('img/earth.jpg');
  IMAGES.moon = loadImage('img/moon.jpg');
  IMAGES.spaceship = loadImage('img/spaceship.jpg');
  IMAGES.ufo = loadImage('img/ufo.jpg');
  font = loadFont('fonts/exo.otf');
}

function setup() {
  background(51);
  let canvas = createCanvas(w, h, WEBGL);
  canvas.parent('container');
  gameRules = new GameRules();
  counterGraphic = createGraphics(256,256);
  moon = new Moon(w / 2, h / 2, s);
  stars = new Stars(w, h);
  earth = new Earth();
  populateFtlDriveDots();
  populateStarGate();
  populateShellGate();
  populateUfos();
}

function draw() {
  background('black');
  cursor(CROSS);
  translate(-width/2,-height/2,0)
  push();
  fill(color('white'));

  stars.blink();
  moon.on();
  moon.animate();

  openStarGatePortal();
  pop();
  laserShooting();
  intro();
  translate(width/2,height/2,0);
  earth.drawEarth();
}

function mousePressed() {
  const level = gameRules.getGameLevel();
  ufos[level].forEach(ufo => {
    ufo.shooted();
  });
}