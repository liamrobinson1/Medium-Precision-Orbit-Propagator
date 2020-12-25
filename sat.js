
class GravSat {
  constructor(r, t, satMass) {
    this.pos = createVector(earth.pos.x + r * cos(t), earth.pos.y + -r * sin(t))
    this.vel = createVector(-sin(t), -cos(t) + 0.00001, 0).mult((G * earth.mass / r) ** 0.5)
    this.acc = createVector(0, 0)
    this.gravityVector = createVector(0, 0)
    this.gravitySourceMass = 0
    this.distToEarth = 0
    this.distToMoon = 0
    this.r1 = 0
    this.r2 = 0
    this.apoapsis = 0
    this.periapsis = 0
    this.transferComplete = 0
    this.period = 0
    this.a = 0
    this.mass = satMass
    this.initialPosition = createVector(earth.pos.x + r * cos(t), earth.pos.y -r * sin(t))
    this.apoapsisVector = createVector(this.pos.x, this.pos.y)
    this.periapsisVector = createVector(this.pos.x, this.pos.y)
    this.dvUsed = 0
    this.stillInOnePiece = 1
    this.deltaT = deltaT
    this.missionSegment = 0
    this.haltPropagation = 0
    this.velMoon = createVector(0, 0)
    this.posMoon = createVector(0, 0)
    this.velFlipped = 0
    this.currentSOI = "any"
    this.mostRecentPath = []
    this.theta = 0
    this.specificE = 0
    this.eccMoon = 0
    this.eccMoonVector = createVector(0, 0, 0)
    this.moonPos = createVector(0, 0, 0)
    this.orbitNormalVector = createVector(0, 0, 1)
    this.hMoonUnitVector = createVector(0, 0, 1) //THIS SHOULD BE CORRECT FOR PLANAR TRAJECTORIES
    this.vectorToEarth = createVector(0, 0, 0)
    this.vectorToMoon = createVector(0, 0, 0)
    this.earthPosVelAngle = 0
    this.state = [0, this.pos.x, this.pos.y, this.pos.z, this.vel.x, this.vel.y, this.vel.z]
  }

  orbitUpdate(halt, propFidelity, currentMoon, propDirection) {
    if(halt == 0) {
      for(var i = 0; i < propFidelity; i++) {
        var gravVector = this.gravityVector.copy()
        var gravUnitVector = p5.Vector.div(gravVector, gravVector.mag())
        var fmag = G * this.gravitySourceMass / gravVector.mag() ** 2

        var propagator = new Propagator(2, [this.pos.x, this.pos.y, this.pos.z, this.vel.x, this.vel.y, this.vel.z], time.timeSinceCreation, "No Interp")
        this.state = propagator.propagate()
        // this.state = [this.pos.x, this.pos.y, this.pos.z, this.vel.x, this.vel.y, this.vel.z]

        this.vel = createVector(this.state[4][0][1], this.state[5][0][1], this.state[6][0][1])
        this.pos = createVector(this.state[1][0][1], this.state[2][0][1], this.state[3][0][1])

        this.calculateElements(earth)

        if(this.distToEarth < earth.drawRadius) {
          return 0
        }
        if(this.distToMoon < currentMoon.drawRadius) {
          return 0
        }
      }
    }
    return 1
  }

  showSat() {
    push()
    stroke(0, 200, 200)
    fill(0, 200, 200)
    translate(this.pos.x, this.pos.y, this.pos.z)
    sphere(this.mass)
    pop()
  }

  showTrail() {
    showVertexPath(falconTrail[0], falconTrail[1], falconTrail[2], color(0, 255, 255))
  }

  copy(copyInto) {
    copyInto.pos = createVector(this.pos.x, this.pos.y)
    copyInto.vel = createVector(this.vel.x, this.vel.y)
    copyInto.acc = createVector(this.acc.x, this.acc.y)
    copyInto.gravityVector = createVector(this.gravityVector.x, this.gravityVector.y)
    copyInto.gravitySourceMass = parseFloat(this.gravitySourceMass)
    copyInto.distToEarth = parseFloat(this.distToEarth)
    copyInto.vectorToEarth = createVector(this.vectorToEarth.x, this.vectorToEarth.y, 0)
    copyInto.distToMoon = parseFloat(this.distToMoon)
    copyInto.r1 = parseFloat(this.r1)
    copyInto.r2 = parseFloat(this.r2)
    copyInto.apoapsis = parseFloat(this.apoapsis)
    copyInto.periapsis = parseFloat(this.periapsis)
    copyInto.transferComplete = parseInt(this.transferComplete)
    copyInto.period = parseFloat(this.period)
    copyInto.a = parseFloat(this.a)
    copyInto.h = parseFloat(this.h)
    copyInto.p = parseFloat(this.p)
    copyInto.dvUsed = parseFloat(this.dvUsed)
    copyInto.mass = parseFloat(this.mass)
    copyInto.ecc = parseFloat(this.ecc)
    copyInto.deltaT = parseFloat(this.deltaT)
    copyInto.velMoon = createVector(this.velMoon.x, this.velMoon.y)
    copyInto.posMoon = createVector(this.posMoon.x, this.posMoon.y)
    copyInto.apoapsisVector = createVector(this.apoapsisVector.x, this.apoapsisVector.y, 0)
    copyInto.periapsisVector = createVector(this.periapsisVector.x, this.periapsisVector.y, 0)
    copyInto.moonAngle = parseFloat(this.moonAngle)
    copyInto.currentSOI = this.currentSOI.toString()
    copyInto.eccMoon = parseFloat(this.eccMoon)
    copyInto.eccMoonVector = createVector(this.eccMoonVector.x, this.eccMoonVector.y, this.eccMoonVector.z)
    copyInto.posMoon = this.posMoon
    copyInto.orbitNormalVector = this.orbitNormalVector
    copyInto.earthPosVelAngle = parseFloat(this.earthPosVelAngle)
  }

  checkSOI(propDirection) {
    if(dist(this.pos.x, this.pos.y, moon.pos.x, moon.pos.y) < moon.SOIrad && propDirection == 1) {
      this.gravitySourceMass = moon.mass
      this.gravityVector = createVector(moon.pos.x - this.pos.x, moon.pos.y - this.pos.y)
    }
    else {
      this.gravitySourceMass = earth.mass
      this.gravityVector = createVector(earth.pos.x - this.pos.x, earth.pos.y - this.pos.y)
    }
  }

  propagateSOI(targetMoon, propDirection, initialSOI) {
    if(dist(this.pos.x, this.pos.y, targetMoon.pos.x, targetMoon.pos.y) < targetMoon.SOIrad && propDirection == 1 && initialSOI != "pls no moon") {
      this.gravitySourceMass = targetMoon.mass
      this.gravityVector = createVector(targetMoon.pos.x - this.pos.x, targetMoon.pos.y - this.pos.y)
      this.currentSOI = "moon"
    }
    else {
      this.gravitySourceMass = earth.mass
      this.gravityVector = createVector(earth.pos.x - this.pos.x, earth.pos.y - this.pos.y)
      this.currentSOI = "earth"
    }
  }

  calculateElements(body) { //CALCULATES ORBITAL ELEMENTS WITH RESPECT TO A BODY
    this.mu = G * body.mass

    this.rBody = createVector(this.pos.x - body.pos.x, this.pos.y - body.pos.y, this.pos.z - body.pos.z)
    this.vBody = createVector(this.vel.x - body.vel.x, this.vel.y - body.vel.y, this.vel.z - body.vel.z)

    //PLACEHOLDERS UNTIL I FIX
    this.distToEarth = createVector(this.pos.x - earth.pos.x, this.pos.y - earth.pos.y, this.pos.z - earth.pos.z).mag()
    this.distToMoon = createVector(this.pos.x - moon.pos.x, this.pos.y - moon.pos.y, this.pos.z - moon.pos.z).mag()

    this.rBodyHat = p5.Vector.div(this.rBody, this.rBody.mag())
    this.vBodyHat = p5.Vector.div(this.vBody, this.vBody.mag())

    this.RMAG = this.rBody.mag()
    this.VMAG = this.vBody.mag()

    this.vectorToBody = createVector(body.pos.x - this.pos.x, body.pos.y - this.pos.y, body.pos.z - this.pos.z)
    this.velInBodyFrame = createVector(this.vel.x - body.vel.x , this.vel.y - body.vel.y, this.vel.z - body.vel.z)

    this.bodyPosVelAngle = this.velInBodyFrame.angleBetween(this.vectorToBody)

    this.hVector = p5.Vector.cross(this.rBody, this.vBody)
    this.h = this.hVector.mag()

    this.orbitNormal = p5.Vector.div(this.hVector, this.h)
    this.orbitBinormal = p5.Vector.cross(this.vBodyHat, this.orbitNormal)

    this.period = 2 * PI * ((this.a) ** 3 / this.mu) ** 0.5
    this.p = this.h ** 2 / this.mu
    this.a = 1 / (2 / this.RMAG - this.VMAG ** 2 / this.mu)
    this.e = -this.mu / (2 * this.a)
    this.ecc = (1 + 2 * this.e * this.h ** 2 / this.mu ** 2) ** 0.5
    this.eccVector = p5.Vector.cross(this.velInBodyFrame, this.hVector).div(this.mu).sub(this.rBodyHat)

    this.apoapsis = this.a * (1 + this.ecc)
    this.periapsis = this.a * (1 - this.ecc)

    this.gamma = acos(this.h / (this.RMAG * this.VMAG))

    if(p5.Vector.dot(this.rBody, this.vBody) > 0) {
      this.theta = acos((this.p / this.RMAG - 1) / this.ecc)
    }
    else {
      this.theta = 2 * PI - acos((this.p / this.RMAG - 1) / this.ecc)
    }

    if(this.ecc > 1) {
      calculateHyperbolicParameters(body)
    }

    push()
    stroke(255)
    fill(255)
    translate(-575, -450)
    textFont(myFont)
    textSize(16);
    textAlign(LEFT, TOP);
    text("timeElapsed in secs: " + frameCount, 100, 20)
    text("VMAG: " + this.VMAG, 100, 40)
    text("disttoearth: " + this.distToEarth, 100, 60)
    text("RMAG: " + this.RMAG, 100, 80)
    text("gamma: " + this.gamma, 100, 100)
    text("h: " + this.h, 100, 120)
    text("theta: " + this.theta, 100, 140)
    text("specificE: " + this.e, 100, 160)
    text("period: " + this.period, 100, 180)
    text("ecc: " + this.ecc, 100, 200)
    text("apo: " + this.apoapsis, 100, 220)
    text("peri: " + this.periapsis, 100, 240)
    text("a: " + this.a, 100, 260)
    text("framerate: " + frameRate().toFixed(2), 100, 280)
    pop()
  }

  calculateHyperbolicParameters(body) {
    this.betaAngle = acos(1 / this.ecc)

    var s1 = p5.Vector.mult(this.eccVector, cos(this.betaAngle))
    var s2 = p5.Vector.mult(p5.Vector.cross(this.orbitNormal, this.eccVector), sin(this.betaAngle))
    this.S = p5.Vector.add(s1, s2)
    var t1 = p5.Vector.cross(this.S, this.orbitNormal)
    this.T = p5.Vector.div(t1, t1.mag())
    this.R = p5.Vector.cross(this.S, this.T)
    var b1 = abs(this.aMoon) * (this.ecc ** 2 - 1) ** 0.5
    var b2 = p5.Vector.cross(this.S, this.orbitNormal)

    this.B = p5.Vector.mult(b2, b1)

    this.BdotR = p5.Vector.dot(this.B, this.R)
    this.BdotT = p5.Vector.dot(this.B, this.T)
  }

  displayFutureTrajectory(framesToProp) {
    var propagator = new Propagator(framesToProp, [this.pos.x, this.pos.y, this.pos.z, this.vel.x, this.vel.y, this.vel.z], time.timeSinceCreation, "No Interp")
    this.futureState = propagator.propagate()

    showVertexPath(this.futureState[1][0], this.futureState[2][0], this.futureState[3][0], color(255, 0, 0))
  }

  executeManeuver(axis, dv) {
    switch(axis) {
      case "V":
        this.vel.setMag(dv + this.vel.mag())
        break
      case "N":
        this.vel.add(p5.Vector.mult(this.orbitNormal, dv))
        break
      case "B":
        this.vel.add(p5.Vector.mult(this.orbitBinormal, dv))
        break
    }
  }

  standardTimestep() {
    this.stillInOnePiece = this.orbitUpdate(time.halt, 1, moon, 1)
    this.calculateElements(earth)
    this.showSat()
  }
}
