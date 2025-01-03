/* See glf.jss for the JSON schema
 */

function resize({width, height})
{
  this.m.caM.set(0, 0, 2 / width);
  this.m.caM.set(1, 1, -2 / height);
  this.m.caM.set(0, 3, -1.0);
  this.m.caM.set(1, 3, 1.0);
}

function draw_glyph(arg)
{
  
  let idx = arg.json.cmap_lookup[arg.charCode];
  if (idx == undefined) {
    return;
  }
  let tab = arg.json.lookup[idx];
  if (tab.len == 0) {
    return;
  }
  arg.vao.bind(arg.gl.ELEMENT_ARRAY_BUFFER);
  const ext = arg.gl.getExtension("OES_element_index_uint");
  let start = tab.start;
  let len = tab.len;
  arg.gl.drawElements(arg.gl.TRIANGLES, len, arg.gl.UNSIGNED_INT, 4 * start);
}

function draw_char(c,x,y,w,h)
{
  let scale1 = 2 / (this.COLS);
  let scale2 = 2 / (this.LINES);
  this.m["pix_xy"].set(0,0,x);
  this.m["pix_xy"].set(1,0,y);
  this.m["gl_xy"].mul(this.m["caM"], this.m["pix_xy"]);
  x = this.m["gl_xy"].get(0,0);
  y = this.m["gl_xy"].get(1,0);
  let scalex = this.m["caM"].get(0,0);
  let scaley = this.m["caM"].get(1,1);
  w = scalex * w;
  h = -scaley * h;
  this.m["T2"].set(0, 3, x);
  this.m["T2"].set(1, 3, y);
  this.m["S2"].set(0, 0, w);
  this.m["S2"].set(1, 1, h);
  this.m["ST2"].mul(this.m["T2"], this.m["S2"]);
  this.m["caM_glf"].mul(this.m["ST2"], this.m["ST"]);
  this.prag.run(this.prog, draw_glyph, { gl: this.gl, vao: this.vao, json: this.json, charCode: c });
}

function init_draw_char()
{
  let xmin = -203;
  let ymin = -302;
//let xmax = 718
//let ymax=1098
//height = ymax - ymin = 1400
//width = xmax - xmin = 921
  let scale = 0.0010857763300760044;

  this.m["T"] = this.g.Matrix(Float32Array, 4, 4, [ 1, 0, 0, 0,
                                             0, 1, 0, 0,
                                             0, 0, 1,     0,
                                            -xmin, -ymin, 0,     1 ]);

  this.m["S"] = this.g.Matrix(Float32Array, 4, 4, [scale,     0, 0, 0,
                                             0, scale, 0, 0,
                                             0,     0, 1, 0,
                                             0,     0, 0, 1 ]);

  this.m["ST"] = this.g.matrix(Float32Array, 4, 4);
  this.m["ST"].mul(this.m["S"], this.m["T"]);

  this.m["T2"] = this.g.Matrix(Float32Array, 4, 4, [ 1, 0, 0, 0,
                                         0, 1, 0, 0,
                                         0, 0, 1, 0,
                                        -1.0 + (0), 1.0 -(0), 0,   1 ]);

  this.m["S2"] = this.g.Matrix(Float32Array, 4, 4, [ (1),     0, 0, 0,
                                         0,     (1), 0, 0,
                                         0,          0, 1, 0,
                                         0,          0, 0, 1 ]);
  this.m["ST2"] = this.g.matrix(Float32Array, 4, 4);

}

function create_prog(gl)
{
  let options = {
    gl: gl,
    src: { },
    location_fx: {
      coord: 'getAttribLocation',
      texCoord: 'getAttribLocation',
      caM: 'getUniformLocation'
    },
    enable_fx: {
      coord: 'enableVertexAttribArray',
      texCoord: 'enableVertexAttribArray',
    }
  }
  options.src[gl.VERTEX_SHADER] = `
precision highp float;
attribute vec2  coord;
attribute vec2  texCoord;
varying   vec2  st;
uniform   mat4  caM;

void main() {
  st = texCoord;
  gl_Position = caM * vec4(coord.x, coord.y, 0.0, 1.0);
}
`;

  options.src[gl.FRAGMENT_SHADER] = `
precision highp float;
varying vec2 st;
void main() {
  float flip  = 0.0;
  float s     = st.x;
  float t     = st.y;
  float alpha = 1.0;
  if (t < 0.0) {
    flip = 1.0;
    t    = -t;
  }
  if (1.0 - (s * s) < t) {
    alpha = flip;
  } else {
    alpha = 1.0 - flip;
  }
  if (alpha == 1.0) {
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
  } else {
    discard;
  }
}
`;
  return this.g.Program(options);
}

function create_prag(gl, caM_data, vbo)
{
  return this.g.Prag({
    gl: gl,
    vars: {
      coord: [ 'vertexAttribPointer', 2, gl.FLOAT, false, 4 * 4, 0 ],
      texCoord: [ 'vertexAttribPointer', 2, gl.FLOAT, false, 4 * 4, 2 * 4 ],
      caM: [ 'uniformMatrix4fv', false, caM_data ]
    },
    vbo: {
      coord: vbo,
      texCoord: vbo
    }
  });
}

let init = function(gl)
{
  this.gl = gl;

  console.log(this);
  this.m["caM"] = this.g.matrix(Float32Array, 4, 4);
  this.m["caM"].identity();

  this.m["pix_xy"]  = this.g.Matrix(Float32Array, 4, 1, [0, 0, 0, 1]);
  this.m["gl_xy"]   = this.g.Matrix(Float32Array, 4, 1, [0, 0, 0, 1]);
  this.m["caM_glf"] = this.g.matrix(Float32Array, 4, 4);

  this.prog         = create_prog(gl);
  this.m.vbo        = this.g.Matrix(Float32Array, 4, this.json.pts.length / 4, this.json.pts);
  this.m.vao        = this.g.Matrix(Uint32Array, 1, this.json.idx.length, this.json.idx);
  this.vbo          = this.g.VBO({gl: gl, m: this.m.vbo});
  this.vao          = this.g.VBO({gl: gl, m: this.m.vao});
  this.prag         = create_prag(gl, this.m.caM_glf._data, this.vbo);
  this.init_draw_char();
}

let display = function()
{
  console.log("glf.display");
  let s   = "Hello, World!";
  let length = s.length;
  let height = 30;
  let char_width = height * 0.657;
  let calc_width = char_width * length;
  let x = 0;
  let y = 0;
  for (let i=0; i<length; i++) {
    this.draw_char(s.charCodeAt(i), x + i*char_width, y + 1.2*height, char_width, height);
  }
}

let glf = function(glf_json, g)
{
  return {
    init: init,
    g: g,
    init_draw_char: init_draw_char,
    display: display,
    resize: resize,
    draw_char: draw_char,
    json: glf_json,
    COLS: 80,
    LINES: 24, 
    m: {  },
  };
}

module.exports.glf = glf;
