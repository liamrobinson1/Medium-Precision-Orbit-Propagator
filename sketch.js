var w = 0
var h = 0

const G = 6.6743 * 10 ** -20
const SF = 100

let time
var deltaT = 1
var timeStop = 0
var scrollActivity = 0

var satMass = 3
var satOrbitalRadius = 100
var satAngle = -2

let earth
var earthMass = 5.97219 * 10 ** 24
var earthEqRadius = 6378.1370
var earthPolRadius = 6356.7523142
var earthOmega = 7.2921150 * 10 ** -5

const mu = G * earthMass

let moon
let tempMoon
var moonAngle = 0
var moonOrbitRadius = 357000
var moonDrawRadius = 1737.1 / SF
var moonMass = 7.348 * 10 ** 22

let sat
let satTrail = [[], [], []]
var transferFrame = 4

let missionSequence
// let missionArr = ["Propagate, to FREL = 2", "Propagate, to MANG = 1.2", "Target ECCE = 1.32, at FREL = 3", "Propagate, to FREL = 100", "Target MPER = 30, at moonperiapsis", "Target MECC = 0.05, at FREL = 100", "Propagate, to moonperiapsis", "Propagate, to EVPA = -0.4", "Target MECC = 2.2, at FREL = 30", "Propagate, to periapsis", "Target RMAG = 100, at periapsis", "Target ECCE = 0.01, at apoapsis", "Propagate, to FREL = 2"]
// let missionArr = ["Propagate, to FREL = 2", "Propagate, to MANG = 1.2", "Target ECCE = 1.32, at FREL = 50", "Propagate, to FREL = 100", "Target MPER = 30, at moonperiapsis", "Target MECC = 0.4, at FREL = 100", "Propagate, to EVPA = 0", "Target MECC = 1, at periapsis", "Target RMAG = 100, at periapsis", "Target ECCE = 0.01, at FREL = 40"]
// let missionArr = ["Propagate, to EVPA = -1"]
let missionArr = []

let earthTex
let moonTex

let earthCam
let satCam
let moonCam
let currentCam

let myFont

let plume

function suc() {
  console.log("success")
}

function bad() {
  console.log("bad")
}

function preload() {
  myFont = loadFont('assets/SourceSansPro-Regular.otf')
  earthTex = loadImage('assets/earthmap1k.jpg')
  moonTex = loadImage('assets/moonmap1k.jpg')
}

function setup() {
  frameRate(60)
  createCanvas(windowWidth, windowHeight, WEBGL)
  cameraSetup()
  perspective(100, 0, 0.0, 500)

  w = windowWidth
  h = windowHeight
  earth = new Earth(earthMass, 0, 0, earthEqRadius, earthPolRadius, earthOmega)
  moon = new Moon(moonMass, moonOrbitRadius, earth, 0, moonDrawRadius)
  sat = new GravSat(satOrbitalRadius, satAngle, satMass)
  sat.missionAnimTimer = new Time(sat.deltaT, 0)

  // missionSequence = new Mission(["Propagate, to FREL = 2", "Propagate, to MANG = 1.5", "Target MECC = 0.70, at moonperiapsis", "Target MECC = 0.18, at FREL = 3", "Propagate, to moonperiapsis", "Target MECC = 0.01, at FREL = 3"], sat)
  missionSequence = new Mission(missionArr, sat)
  // missionSequence = new Mission([], sat)
  plume = new ExhaustPlume(sat.pos, sat.vel.mag(), sat.vel, 20, 0, 0)

  time = new Time(deltaT, 1)
}

function draw() {
  //ORBIT CONTROL
  orbitControl(1, 1, 0.02)
  cameraControl()
  scrollActivity = 0

  //TIME UPDATE
  time.update()

  //UPDATE AND DRAW PLANETS AND MOONS
  earth.show()
  moon.show()
  moon.update()

  //UPDATE AND SHOW THE SAT
  sat.displayElements()
  sat.standardTimestep()

  if(sat.stillInOnePiece == 1) {
    if(keyIsDown(190) && time.halt == 0) {
      sat.executeManeuver("V", 0.036)
      time.keyPressedLastFrame = 1
      time.burnMagnitude += 1
    }

    if(keyIsDown(188) && time.halt == 0) {
      sat.executeManeuver("V", -0.036)
      time.keyPressedLastFrame = 1
      time.burnMagnitude -= 1
    }

    if(keyIsDown(ESCAPE)) {
      time.halt = 1
    }

    if(!keyIsDown(190) && !keyIsDown(190) && time.keyPressedLastFrame == 1) {
      plume = new ExhaustPlume(sat.pos, sat.vel.mag(), p5.Vector.mult(sat.vel, -1), time.burnMagnitude / 3, 40 + time.burnMagnitude, 50)
      time.keyPressedLastFrame = 0
      time.burnMagnitude = 0
    }
  }

  if(sat.stillInOnePiece == 1 && time.halt == 0 && time.timeSinceCreation % 10 == 0) {
    satTrail[0].push(sat.pos.x)
    satTrail[1].push(sat.pos.y)
    satTrail[2].push(sat.pos.z)
  }

  if(time.halt == 0) {
    plume.update()
  }

  plume.show()
  sat.displayFutureTrajectory(2000, earth)
  // sat.displayFutureTrajectory(sat.period / 2, moon)
  sat.saveGroundTrack(earth)
  sat.showGroundTrack()
}
