var NS_Matrix = { }

NS_Matrix.idx = function (i,j)
{
  let x = i;
  if (j != undefined) {
    x = i + this._n * j;
  }
  if (x < 0 || x >= this._length) { return null; }
  return x;
}

NS_Matrix.dim = function (n, m)
{
  return ((this._n === n) && (this._m === m));
}

NS_Matrix.size = function ()
{
  return this._length * this._size;
}

NS_Matrix.identity = function ()
{
  if (this._n != this._m) {
    console.error("Identity matrices must be square");
    return;
  }
  this.zero()
  for (let i = 0; i < this._n; i++) {
    this._data[this.idx(i,i)] = 1;
  }
}

NS_Matrix.zero = function ()
{
  for (let i = 0; i < this._length; i++) {
    this._data[i] = 0;
  }
}

NS_Matrix.copy = function (m)
{
  if (this.dim(m._n, m._m) || m._type != type) {
    console.error("Type/Dimension mismatch");
    return;
  }
  m._data = this._data.slice(0)
}

NS_Matrix.mul = function (A,B)
{
  if (A._type != this._type || this._type != B._type) {
    console.error("Type mismatch");
    return;
  }
  if (A._m != B._n || !this.dim(A._n, B._m)) {
    console.error(`Dimension mismatch: ${A._m} != ${B._n} || ${!this.dim(A._n, B._m)}` );
    return;
  }
  for (let i = 0; i < this._n; i++) {
    for (let j = 0; j < this._m; j++) {
      let ix = this.idx(i,j)
      this._data[ix] = 0;
      for (let k = 0; k < this._n; k++) {
        this._data[ix] += A._data[A.idx(i,k)] * B._data[B.idx(k,j)];
      }
    }
  }
}

NS_Matrix.sub = function (u,v)
{
  if (!this.dim(u._n,u._m) || !this.dim(v._n,v._m)) {
    console.error("Dimension mismatch");
    return;
  }
  if (this._type != u._type || this._type != v._type) {
    console.error("Type mismatch");
    return;
  }
  for (let i = 0; i < this._length; i++) {
    this._data[i] = u._data[i] - v._data[i];
  }
  this._decomposed = false;
}

NS_Matrix.add = function (u,v)
{
  if (!this.dim(u._n,u._m) || !this.dim(v._n,v._m)) {
    console.error("Dimension mismatch");
    return;
  }
  if (this._type != u._type || this._type != v._type) {
    console.error("Type mismatch");
    return;
  }
  for (let i = 0; i < this._length; i++) {
    this._data[i] = u._data[i] + v._data[i];
  }
  this._decomposed = false;
}

NS_Matrix.transpose = function (M)
{
  if (!this.dim(M._m, M._n)) {
    console.error("Transpose dimension mismatch");
    return;
  }
  if (this._type != M._type) {
    console.error("Type mismatch");
    return;
  }
  for (let i = 0; i < this._n; i++) {
    for (let j = 0; j < this._m; j++) {
      this.set(i,j,M.get(j,i));
    }
  }
}

NS_Matrix.set = function (i,j,v)
{
  if (v != undefined) {
    this._data[i + this._n * j] = v;
  } else {
    this._data[i] = j;
  }
}

NS_Matrix.get2 = function (i,j)
{
  if (j === undefined) { return this._lu[i]; }
  return this._lu[i + this._n * j];
}

NS_Matrix.get = function (i,j)
{
  if (j === undefined) { return this._data[i]; }
  return this._data[i + this._n * j];
}

NS_Matrix.decompose = function ()
{
  let Tol = 0.001;

  if (this._n != this._m || this._decomposed) { return; }

  for (let i = 0; i < this._length; i++) {
    this._lu[i] = this._data[i]
  }

  for (i = 0; i <= this._n; i++) {
    this._P[i] = i
  }

  for (i = 0; i < this._n; i++) {
    let maxA = 0.0;
    let imax = i;

    for (let k = i; k < this._n; k++) {
      let absA = Math.abs(this._lu[this.idx(k,i)])
      if (absA > maxA) {
        maxA = absA;
	imax = k;
      }
    }

    if (maxA < Tol) {
      console.error('Matrix is degenerate (' + maxA + ' < ' + Tol + ')');
      return;
    }

    if (imax != i) {
      // Pivoting P
      this._P[imax] ^= this._P[i];
      this._P[i] ^= this._P[imax];
      this._P[imax] ^= this._P[i];

      // pivoting rows of A
      for (let j = 0; j < this._m; j++) {
        let tmp = this._lu[this.idx(i,j)]
	this._lu[this.idx(i,j)] = this._lu[this.idx(imax,j)];
        this._lu[this.idx(imax,j)] = tmp;
      }

      this._P[this._n]++;
    }

    for (j = i + 1; j < this._n; j++) {
      this._lu[this.idx(j,i)] /= this._lu[this.idx(i,i)]
      for (k = i + 1; k < this._n; k++) {
        this._lu[this.idx(j,k)] -=
                 this._lu[this.idx(j,i)] * this._lu[this.idx(i,k)]
      }
    }
  }
  this._decomposed = true;
  return;
}

NS_Matrix.determinant = function ()
{
  if (this._det != null) { return this._det; }
  this.decompose();
  if (!this._decomposed) { return null; }
  this._det = this._lu[this.idx(0,0)];
  for (let i = 1; i < this._n; i++) {
    this._det = this._det * this._lu[this.idx(i,i)];
  }
  if ((this._P[this._n] - this._n) % 2 === 1) {
    this._det = -this._det;
  }
  return this._det
}

NS_Matrix.invert = function (m)
{
  m.decompose();
  if (!m._decomposed) {
    console.error("Can't invert degenerate matrix");
    return;
  }
  for (let j = 0; j < this._n; j++) {
    for (let i = 0; i < this._n; i++) {
      if (m._P[i] == j) {
        this.set(i,j,1);
      } else {
        this.set(i,j,0);
      }
      for (let k = 0; k < i; k++) {
        let val = this.get(i,j) - m.get2(i,k) * this.get(k,j)
        this.set(i,j,val);
      }
    }
    for (let i = this._n - 1; i >= 0; i--) {
      for (let k = i + 1; k < this._n; k++) {
        let val = this.get(i,j) - m.get2(i,k) * this.get(k,j)
        this.set(i,j,val);
      }
      this.set(i,j,this.get(i,j)/m.get2(i,i));
    }
  }
  this._decomposed = false;
}

NS_Matrix.print = function ()
{
  s = '';
  for (let i = 0 ; i < this._n; i++) {
    if (i > 0) { s += '\n'; }
    for (let j = 0; j < this._m; j++) {
      if (j > 0) { s += ','; }
      s += this.get(i,j);
      //s += this._data[i + j * this._n];
    }
  }
  console.log(s);
}

function matrix(type, n, m)
{
  let length = n * m
  let mat = {
    _n: n,
    _m: m,
    _type: type,
    _length: length,
    _size: type.BYTES_PER_ELEMENT,
    _data: new type(length),
    _lu: null,
    _P: null,
    _decomposed: false,
    _det: null,
    idx: NS_Matrix.idx,
    copy: NS_Matrix.copy,
    dim: NS_Matrix.dim,
    size: NS_Matrix.size,
    add: NS_Matrix.add,
    sub: NS_Matrix.sub,
    mul: NS_Matrix.mul,
    set: NS_Matrix.set,
    get: NS_Matrix.get,
    get2: NS_Matrix.get2,
    transpose: NS_Matrix.transpose,
    identity: NS_Matrix.identity,
    zero: NS_Matrix.zero,
    determinant: NS_Matrix.determinant,
    decompose: NS_Matrix.decompose,
    invert: NS_Matrix.invert,
    print: NS_Matrix.print
  }
  if (n === m) {
    mat._lu = new type(length)
    mat._P = new Int8Array(length)
  }
  return mat
}

function Matrix(type, n, m, arr)
{
  let mat = matrix(type, n, m);
  for (let i = 0; i < arr.length; i++) {
    mat.set(i,arr[i]);
  }
  return mat
}


module.exports.matrix = matrix;
module.exports.Matrix = Matrix;
