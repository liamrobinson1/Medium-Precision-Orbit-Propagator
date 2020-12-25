var w = 0
var h = 0

const G = 100

let time
var deltaT = 1
var timeStop = 0
let clog

var satMass = 3
var satOrbitalRadius = 100
var satAngle = -2

let earth
var earthMass = 40
var earthDrawRadius = 40

const mu = G * earthMass

let moon
let tempMoon
var moonAngle = 0
var moonOrbitRadius = 400
var moonDrawRadius = 10
var moonMass = 15

let falcon
let falconcopy
let falconTrail = [[], [], []]
let falconMoonTrail = []
var transferFrame = 4

let missionSequence
// let missionArr = ["Propagate, to FREL = 2", "Propagate, to MANG = 1.2", "Target ECCE = 1.32, at FREL = 3", "Propagate, to FREL = 100", "Target MPER = 30, at moonperiapsis", "Target MECC = 0.05, at FREL = 100", "Propagate, to moonperiapsis", "Propagate, to EVPA = -0.4", "Target MECC = 2.2, at FREL = 30", "Propagate, to periapsis", "Target RMAG = 100, at periapsis", "Target ECCE = 0.01, at apoapsis", "Propagate, to FREL = 2"]
// let missionArr = ["Propagate, to FREL = 2", "Propagate, to MANG = 1.2", "Target ECCE = 1.32, at FREL = 50", "Propagate, to FREL = 100", "Target MPER = 30, at moonperiapsis", "Target MECC = 0.4, at FREL = 100", "Propagate, to EVPA = 0", "Target MECC = 1, at periapsis", "Target RMAG = 100, at periapsis", "Target ECCE = 0.01, at FREL = 40"]
// let missionArr = ["Propagate, to EVPA = -1"]
let missionArr = []

let earthTex
let moonTex

let myFont

let plume

function preload() {
  myFont = loadFont('assets/SourceSansPro-Regular.otf')
  earthTex = loadImage('assets/earthmap4k.jpg')
  moonTex = loadImage('assets/moonmap1k.jpg')
}

function setup() {
  frameRate(60)

  createCanvas(windowWidth, windowHeight, WEBGL)
  w = windowWidth
  h = windowHeight
  earth = new Earth(earthMass, 0, 0, earthDrawRadius)
  moon = new Moon(moonMass, moonOrbitRadius, earth, 0, moonDrawRadius)
  falcon = new GravSat(satOrbitalRadius, satAngle, satMass)
  falconcopy = new GravSat(satOrbitalRadius, satAngle, satMass)
  falcon.missionAnimTimer = new Time(falcon.deltaT, 0)

  falcon.copy(falconcopy)
  // missionSequence = new Mission(["Propagate, to FREL = 2", "Propagate, to MANG = 1.5", "Target MECC = 0.70, at moonperiapsis", "Target MECC = 0.18, at FREL = 3", "Propagate, to moonperiapsis", "Target MECC = 0.01, at FREL = 3"], falcon)
  missionSequence = new Mission(missionArr, falcon)
  // missionSequence = new Mission([], falcon)
  plume = new ExhaustPlume(falcon.pos, falcon.vel.mag(), falcon.vel, 20, 0, 0)

  time = new Time(deltaT, 1)
}

function draw() {
  //ORBIT CONTROL
  orbitControl()
  clog = frameCount % 100 == 0

  //TIME UPDATE
  time.update()

  //UPDATE AND DRAW PLANETS AND MOONS
  earth.show()
  moon.show()
  moon.drawSOI()
  moon.update()


  //UPDATE AND SHOW THE SAT
  falcon.showSat()
  falcon.checkSOI(1)

  if(falcon.stillInOnePiece == 1 && time.currentFrame < transferFrame) {
    falcon.stillInOnePiece = falcon.orbitUpdate(time.halt, 1, moon, 1)
  }

  if(time.currentFrame >= transferFrame && falcon.haltPropagation == 0 && !time.halt) {
    if(falcon.missionSegment == 0 && falcon.missionAnimTimer.timeSinceCreation == 0) {
      missionSequence.printSequence()
    }
    if(falcon.missionSegment < missionSequence.sequence.length) {
      if(falcon.missionAnimTimer.timeSinceCreation == 0) {
        var results = missionSequence.executeSequence(falcon.missionSegment)
        missionSequence.burnMagnitude = results[0]
        missionSequence.framesToWait = results[1]
        falcon.executeManeuver("V", missionSequence.burnMagnitude)
        plume = new ExhaustPlume(falcon.pos, falcon.vel.mag(), p5.Vector.mult(falcon.vel, -1), missionSequence.burnMagnitude * 10, 40 + abs(missionSequence.burnMagnitude) * 10, 50)
        falcon.calculateElements(earth)
        falcon.stillInOnePiece = falcon.orbitUpdate(time.halt, 1, moon, 1)

        falcon.showSat()

        missionSequence.propagator.drawConvergence()
        falcon.missionAnimTimer.timeSinceCreation += 1
      }
      //IF WE"RE IN THE MIDDLE OF A SEGMENT
      else if(falcon.missionAnimTimer.timeSinceCreation < missionSequence.framesToWait && falcon.stillInOnePiece == 1) {
        falcon.standardTimestep()
        if(falcon.missionAnimTimer.timeSinceCreation == 2) {
        }
        falcon.missionAnimTimer.timeSinceCreation += 1
      }
      //IF WE"VE COMPLETED THE CURRENT SEGMENT
      else if(falcon.missionAnimTimer.timeSinceCreation == missionSequence.framesToWait) {
        falcon.missionAnimTimer.timeSinceCreation = 0
        falcon.missionSegment += 1
        console.log("Moving on!")
      }
    }
    else if(falcon.stillInOnePiece) {
      falcon.transferComplete = 1
      falcon.standardTimestep()

      if(keyIsDown(190)) {
        falcon.executeManeuver("V", 0.036)
        time.keyPressedLastFrame = 1
        time.burnMagnitude += 1
      }

      if(keyIsDown(188)) {
        falcon.executeManeuver("V", -0.036)
        time.keyPressedLastFrame = 1
        time.burnMagnitude -= 1
      }

      if(keyIsDown(ESCAPE)) {
        time.halt = 1
      }

      if(!keyIsDown(190) && !keyIsDown(190) && time.keyPressedLastFrame == 1) {
        plume = new ExhaustPlume(falcon.pos, falcon.vel.mag(), p5.Vector.mult(falcon.vel, -1), time.burnMagnitude / 3, 40 + time.burnMagnitude, 50)
        time.keyPressedLastFrame = 0
        time.burnMagnitude = 0
      }
    }
    else {
      falcon.showSat()
    }
  }

  if(falcon.stillInOnePiece == 1 && time.halt == 0) {
    falcon.displayFutureTrajectory(500)

    falconTrail[0].push(falcon.pos.x)
    falconTrail[1].push(falcon.pos.y)
    falconTrail[2].push(falcon.pos.z)
  }

  if(time.halt == 0) {
    plume.update()
  }
  plume.show()
  falcon.showTrail()

  // moonRelativeOrbit()

  if(falcon.missionSegment == missionSequence.sequence.length) {
    falcon.missionAnimTimer.timeSinceCreation = 0
    falcon.missionSegment = 0
    falcon.transferComplete = 0
  }
}
