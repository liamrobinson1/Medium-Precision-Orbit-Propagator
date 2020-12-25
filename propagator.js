class Propagator {
  constructor(framesElapsed, initialState, initialTime, interp) {
    this.toInterp = interp
    this.framesToPropagate = framesElapsed
    this.initialState = initialState
    this.initialTime = initialTime
    this.integrator = new RungeKutta45(initialTime, initialState, 1, framesElapsed, 10 ** -6)
    this.resolutionForDisplay = 100
  }

  propagate() {
    if(frameCount % 100 == 0) {
      tic("500 frame prop")
    }
    this.results = this.integrator.iterate()
    var x = this.integrator.extract(0)
    var y = this.integrator.extract(1)
    var z = this.integrator.extract(2)
    var vx = this.integrator.extract(3)
    var vy = this.integrator.extract(4)
    var vz = this.integrator.extract(5)
    var t = this.integrator.extract("t")

    if(this.toInterp != "No Interp") {
      var xinterp = interpolate(t, x, this.resolutionForDisplay)
      var yinterp = interpolate(t, y, this.resolutionForDisplay)
      var zinterp = interpolate(t, z, this.resolutionForDisplay)
    }
    if(frameCount % 100 == 0) {
      toc("500 frame prop")
    }
    return [[t], [x], [y], [z], [vx], [vy], [vz]]
  }
}
