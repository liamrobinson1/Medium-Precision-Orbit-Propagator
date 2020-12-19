var w = 0
var h = 0

const G = 10

let time
var deltaT = 1
var timeStop = 0

var satMass = 3
var satOrbitalRadius = 100
var satAngle = - 3.14 / 2

let earth
var earthMass = 40
var earthDrawRadius = 50

let moon
let tempMoon
var moonPos = 0
var moonAngle = 0
var moonOrbitRadius = 250
var moonDrawRadius = 10
var moonMass = 10

let falcon
let falconcopy
let falconTrail = []
var transferFrame = 10

let missionSequence

let satImage

function preload() {
  satImage = loadImage('assets/saturnV.png')
  earthImage = loadImage('assets/earth.png')
  moonImage = loadImage('assets/moon.png')
}

function setup() {
  frameRate(30)
  createCanvas(windowWidth, windowHeight)
  w = windowWidth
  h = windowHeight
  earth = new Earth(earthMass, w / 2, h / 2)
  moon = new Moon(moonMass, moonOrbitRadius, earth, 0, -2 * PI / 1000)
  falcon = new GravSat(satOrbitalRadius, satAngle, satMass, 0)
  falconcopy = new GravSat(satOrbitalRadius, satAngle, satMass, 0)
  falcon.copy(falconcopy)
  // missionSequence = new Mission(["Propagate, to FREL = 2000", "Propagate, to periapsis", "Target RAPO = 350, at apoapsis", "Target RPER = 350, at apoapsis"], falcon)
  missionSequence = new Mission(["Propagate, to periapsis", "Target RMAG = 170, at apoapsis", "Target ECCE = 0.0007, at FREL = 1000", "Target PERD = 420, at FREL = 6"], falcon)
  time = new Time()
  resizeImages()
}

function draw() {
  //TIME UPDATE
  time.update()

  //UPDATE AND DRAW PLANETS AND MOONS
  moonPos = createVector(moonOrbitRadius * cos(moonAngle) + earth.pos.x, moonOrbitRadius * sin(moonAngle) + earth.pos
  .y)
  earth.show()
  moon.show()
  moon.drawSOI()
  moon.update()


  //UPDATE AND SHOW THE SAT
  falcon.showSat()
  falcon.checkSOI()
  // if(keyIsDown(RIGHT_ARROW)) {
  falcon.orbitUpdate(time.halt, 1)
  // }
  if(frameCount == 2) {
    falcon.correctThetaFindRs()
  }


  if(time.currentFrame > transferFrame && falcon.transferComplete == 0) {
    // falcon.enterTransfer()
    missionSequence.printSequence()
    missionSequence.executeSequence()
    // console.log(falcon.vel.x, falcon.vel.y)
    // falcon.vel.x = 0.0079857
    // falcon.executeManeuver(0.21868)
    // console.log(falcon.vel.x, falcon.vel.y)
    falcon.transferComplete = 1
  }
  else if(time.currentFrame > transferFrame) {
    falcon.correctThetaFindRs()
    falcon.displayElements()
    // console.log(falcon.theta, falcon.distToEarth, falcon.vel.x, falcon.vel.y)
  }

  if(time.currentFrame % 5 == 0) {
    falconTrail.push([falcon.pos.x, falcon.pos.y])
  }
  falcon.calculateElements()
  // falcon.displayFutureTrajectory(500)

  if(keyIsDown(RIGHT_ARROW)) {
    falcon.executeManeuver(0.008)
    falcon.correctThetaFindRs()
    console.log(falcon.dvUsed)
  }
  if(keyIsDown(LEFT_ARROW)) {
    falcon.executeManeuver(-0.008)
    falcon.correctThetaFindRs()
  }

  if(keyIsDown(UP_ARROW)) {
    time.halt = 1
  }
  if(keyIsDown(DOWN_ARROW)) {
    time.halt = 0
  }

  noFill()
  push()
  beginShape()
  stroke(0, 255, 255)
  for(var i = 0; i < falconTrail.length; i++) {
    vertex(falconTrail[i][0], falconTrail[i][1])
  }
  endShape()
  pop()

  addImages()
}
