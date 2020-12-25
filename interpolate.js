function interpolate(t, out, res) {
  cond = out[0] < 0
  ifs = computeInterp(t, out, res)
  var its = []
  var iys = []
  
  for(var i = t[0] + res; i < (t[t.length - 1] - t[0]) + t[0]; i += res) {
    var n = 0
    its.push(i)

    if(i < t[1]) {
      iys.push(ifs[0][0][0] * i ** 2 + ifs[0][0][1] * i + ifs[0][0][2])
    }

    else {
      while(i >= t[n + 2]) {
        n += 1
      }
      if(i < t[t.length - 2]) {
        iys.push(ifs[n][1][0] * i ** 2 + ifs[n][1][1] * i + ifs[n][1][2])
      }
      else {
        iys.push(ifs[n-1][2][0] * i ** 2 + ifs[n-1][2][1] * i + ifs[n-1][2][2])
      }
    }
  }
  if(cond) {
    console.log("WHAT THE FUCK", iys)
  }
  return [its, iys]
}

function computeInterp(t, out, res) {
  var interpolatedFcns = []
  console.log(t.length, out[0])
  for(var i = 0; i < t.length - 3; i++) {
    var yinterp = pieceMealIntep(t[i], out[i], t[i+1], out[i+1], t[i+2], out[i+2], t[i+3], out[i+3])
    interpolatedFcns.push(yinterp)
  }
  if(out[0] < 0) {
    console.log(interpolatedFcns)
  }
  return interpolatedFcns
}

function pieceMealIntep(x1, y1, x2, y2, x3, y3, x4, y4) {
  var x = []
  var A = [
    [x1**2, 0,     0,     x1, 0,  0,  1, 0, 0, y1], //f12 at x1
    [x2**2, 0,     0,     x2, 0,  0,  1, 0, 0, y2], //f12 at x2
    [0,     x2**2, 0,     0,  x2, 0,  0, 1, 0, y2], //f23 at x2
    [0,     x3**2, 0,     0,  x3, 0,  0, 1, 0, y3], //f23 at x3
    [0,     0,     x3**2, 0,  0,  x3, 0, 0, 1, y3], //f34 at x3
    [0,     0,     x4**2, 0,  0,  x4, 0, 0, 1, y4], //f34 at x4
    [2*x2,  -2*x2, 0,     1, -1,  0,  0, 0, 0, 0], //f'12 == f'23 at x2
    [0,     2*x3,  -2*x3, 0,  1,  -1, 0, 0, 0, 0], //f'23 == f'34 at x3
    [1,     0,     0,     0,  0,  0,  0, 0, 0, 0]  //f''12 == 0 at x1
  ]

  var arref = rref(A)

  for(var i = 0; i < 9; i++) {
    x.push(parseFloat(arref[i][9]))
  }

  return [
    [x[0], x[3], x[6]],
    [x[1], x[4], x[7]],
    [x[2], x[5], x[8]]
  ]
}

function revArr(arr) {
  var newArray = [];
  for (var i = arr.length - 1; i >= 0; i--) {
    newArray.push(arr[i]);
  }
  return newArray;
}

function rref(A) {
    var rows = A.length;
    var columns = A[0].length;

    var lead = 0;
    for (var k = 0; k < rows; k++) {
        if (columns <= lead) return;

        var i = k;
        while (A[i][lead] === 0) {
            i++;
            if (rows === i) {
                i = k;
                lead++;
                if (columns === lead) return;
            }
        }
        var irow = A[i], krow = A[k];
        A[i] = krow, A[k] = irow;

        var val = A[k][lead];
        for (var j = 0; j < columns; j++) {
            A[k][j] /= val;
        }

        for (var i = 0; i < rows; i++) {
            if (i === k) continue;
            val = A[i][lead];
            for (var j = 0; j < columns; j++) {
                A[i][j] -= val * A[k][j];
            }
        }
        lead++;
    }
    return A;
}
