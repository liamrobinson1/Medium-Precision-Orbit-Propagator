//OLD MISSION ARCHITECTURE

  // if(time.currentFrame >= transferFrame && sat.haltPropagation == 0 && !time.halt) {
  //   if(sat.missionSegment == 0 && sat.missionAnimTimer.timeSinceCreation == 0) {
  //     missionSequence.printSequence()
  //   }
  //   if(sat.missionSegment < missionSequence.sequence.length) {
  //     if(sat.missionAnimTimer.timeSinceCreation == 0) {
  //       var results = missionSequence.executeSequence(sat.missionSegment)
  //       missionSequence.burnMagnitude = results[0]
  //       missionSequence.framesToWait = results[1]
  //       sat.executeManeuver("V", missionSequence.burnMagnitude)
  //       plume = new ExhaustPlume(sat.pos, sat.vel.mag(), p5.Vector.mult(sat.vel, -1), missionSequence.burnMagnitude * 10, 40 + abs(missionSequence.burnMagnitude) * 10, 50)
  //       sat.calculateElements(earth)
  //       sat.stillInOnePiece = sat.orbitUpdate(time.halt, 1, moon, 1)
  //
  //       sat.showSat()
  //
  //       missionSequence.propagator.drawConvergence()
  //       sat.missionAnimTimer.timeSinceCreation += 1
  //     }
  //     //IF WE"RE IN THE MIDDLE OF A SEGMENT
  //     else if(sat.missionAnimTimer.timeSinceCreation < missionSequence.framesToWait && sat.stillInOnePiece == 1) {
  //       sat.standardTimestep()
  //       if(sat.missionAnimTimer.timeSinceCreation == 2) {
  //       }
  //       sat.missionAnimTimer.timeSinceCreation += 1
  //     }
  //     //IF WE"VE COMPLETED THE CURRENT SEGMENT
  //     else if(sat.missionAnimTimer.timeSinceCreation == missionSequence.framesToWait) {
  //       sat.missionAnimTimer.timeSinceCreation = 0
  //       sat.missionSegment += 1
  //       console.log("Moving on!")
  //     }
  //   }
  //   else if(sat.stillInOnePiece) {
  //     sat.transferComplete = 1
  //     sat.standardTimestep()
  //
  //     if(keyIsDown(190)) {
  //       sat.executeManeuver("V", 0.036)
  //       time.keyPressedLastFrame = 1
  //       time.burnMagnitude += 1
  //     }
  //
  //     if(keyIsDown(188)) {
  //       sat.executeManeuver("V", -0.036)
  //       time.keyPressedLastFrame = 1
  //       time.burnMagnitude -= 1
  //     }
  //
  //     if(keyIsDown(ESCAPE)) {
  //       time.halt = 1
  //     }
  //
  //     if(!keyIsDown(190) && !keyIsDown(190) && time.keyPressedLastFrame == 1) {
  //       plume = new ExhaustPlume(sat.pos, sat.vel.mag(), p5.Vector.mult(sat.vel, -1), time.burnMagnitude / 3, 40 + time.burnMagnitude, 50)
  //       time.keyPressedLastFrame = 0
  //       time.burnMagnitude = 0
  //     }
  //   }
  //   else {
  //     sat.showSat()
  //   }
  // }

class Mission {
  constructor(sequence, target) {
    this.sequence = sequence //an array of valid mission sequences
    this.targetObject = target //the object the target sequence acts on
  }

  printSequence() {
    for(var i = 0; i < this.sequence.length; i++) {
      console.log((i + 1).toString() + ". " + this.sequence[i])
    }
  }

  executeSequence(i) {
    this.propagator = new Targeter(this.targetObject, "noChange", null, 1, "apoapsis", null, "burnV", 0.00, 100, 0.01, 2000, 1)
    this.propagator.segmentTimer = new Time(this.targetObject.deltaT, 0)

    if(this.sequence[i] != "phase") {
      this.parseUserMissionPhase(this.sequence[i])
    }
    else {
      this.parseUserMissionPhase("Target PERD = " + (moon.period * (-sat.moonAngle + 2 * PI + 1) / (2 * PI)).toString() + ", at FREL = 10")
    }

    if(this.sequence[i].includes('Target')) {
      this.propagator.vary(1, "any", "varying", this.propagator.sensetivity)
    }
    else if(this.sequence[i] == "phase") {
      this.propagator.vary(1, "any", "varying", 14)
    }
    else {
      this.propagator.propagate(this.propagator.propFidelity, this.propagator.propStopCondition, this.propagator.propStopValue, 1, this.initialSOI, null)
    }
    this.propagator.drawConvergence()

    return [this.propagator.currentControlValue, this.propagator.segmentTimer.timeSinceCreation]
  }

  parseUserMissionPhase(content) {
    var directives = content.split(",")
    if(directives[0].includes("Target")) {
      this.propagator.currentControlValue = 0
    	var value = parseFloat(directives[0].slice(14, directives[0].length))
      this.propagator.tolerance = 0.0001 //DEFAULT
      switch(directives[0].slice(7, 11)) {
        case "RMAG":
          this.propagator.targetParameter = "distToEarth"
          this.propagator.equalityCondition = value
          break
        case "PERD":
          this.propagator.targetParameter = "period"
          this.propagator.equalityCondition = value
          this.propagator.tolerance = 0.01
          break
        case "ECCE":
          this.propagator.targetParameter = "ecc"
          this.propagator.equalityCondition = value
          this.propagator.tolerance = 0.00001
          break
        case "SPFH":
          this.propagator.targetParameter = "h"
          this.propagator.equalityCondition = value
          break
        case "THTA":
          this.propagator.targetParameter = "theta"
          this.propagator.equalityCondition = value
          break
        case "SPFE":
          this.propagator.targetParameter = "specificE"
          this.propagator.equalityCondition = value
          break
        case "RAPO":
          this.propagator.targetParameter = "radapo"
          this.propagator.equalityCondition = value
          break
        case "RPER":
          this.propagator.targetParameter = "radper"
          this.propagator.equalityCondition = value
          break
        case "SMAX":
          this.propagator.targetParameter = "a"
          this.propagator.equalityCondition = value
          break
        case "VELM":
          this.propagator.targetParameter = "velMoon"
          this.propagator.equalityCondition = value
          break
        case "POSM":
          this.propagator.targetParameter = "posMoon"
          this.propagator.equalityCondition = value
          break
        case "BDTT":
          this.propagator.targetParameter = "BdotT"
          this.propagator.equalityCondition = value
          this.propagator.tolerance = 0.1
          this.propagator.sensetivity = 4
          break
        case "MANG":
          this.propagator.targetParameter = "moonAngle"
          this.propagator.equalityCondition = value
          break
        case "MPER":
          this.propagator.targetParameter = "moonPeriapsis"
          this.propagator.equalityCondition = value
          break
        case "MAPO":
          this.propagator.targetParameter = "moonApoapsis"
          this.propagator.equalityCondition = value
          break
        case "MECC":
          this.propagator.targetParameter = "moonEccentricity"
          this.propagator.equalityCondition = value
          this.propagator.tolerance = 0.05 //DEFAULT
          this.propagator.sensetivity = 3
          break
      }

      switch(directives[1].slice(4, directives[1].length)) {
        case "apoapsis":
          this.propagator.propStopCondition = "apoapsis"
          this.propagator.propStopValue = null
          break
        case "periapsis":
          this.propagator.propStopCondition = "periapsis"
          this.propagator.propStopValue = null
          break
        case "moonperiapsis":
          this.propagator.propStopCondition = "moonperiapsis"
          this.propagator.propStopValue = null
          break
      }
    }
    else if(directives[0].includes("Propagate")) {
      this.propagator.targetParameter = "noChange"
      this.propagator.currentControlValue = 0

      switch(directives[1].slice(4, directives[1].length)) {
        case "apoapsis":
          this.propagator.propStopCondition = "apoapsis"
          this.propagator.equalityCondition = null
          this.propagator.propStopValue = null
          break
        case "periapsis":
          this.propagator.propStopCondition = "periapsis"
          this.propagator.equalityCondition = null
          this.propagator.propStopValue = null
          break
        case "moonperiapsis":
          this.propagator.propStopCondition = "moonperiapsis"
          this.propagator.equalityCondition = null
          this.propagator.propStopValue = null
          break
      }
    }
    if(directives[1].includes("=")) {
    	var value = parseFloat(directives[1].slice(11, directives[1].length))
      switch(directives[1].slice(4, 8)) {
        case "FREL":
          this.propagator.propStopCondition = "framesElapsed"
          this.propagator.propStopValue = value
          break
        case "RMAG":
          this.propagator.propStopCondition = "distToEarth"
          this.propagator.propStopValue = value
          break
        case "THTA":
          this.propagator.propStopCondition = "theta"
          this.propagator.propStopValue = value
          break
        case "MANG":
          this.propagator.propStopCondition = "moonAngle"
          this.propagator.propStopValue = value
          break
        case "EVPA":
          this.propagator.propStopCondition = "earthPosVelAngle"
          this.propagator.propStopValue = value
          this.propagator.tolerance = 0.05
          break
      }
    }
    console.log("Targeting: ", this.propagator.targetParameter)
    console.log("Stopping at: ", this.propagator.propStopCondition)
    console.log("With value: ", this.propagator.propStopValue)
    console.log("Starting with ControlVar: ", this.propagator.currentControlValue)
    console.log("Looking for: ", this.propagator.equalityCondition)
  }
}
