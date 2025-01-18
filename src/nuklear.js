let DEBUG_FUNCTION_PRINTS = false

function add_shape_pt(i,x,y,r,g,b,a,mode,s,t,lt)
{
  this.m["shape"].set(0,i,mode);
  this.m["shape"].set(1,i,s);
  this.m["shape"].set(2,i,t);
  this.m["shape"].set(3,i,lt);
  this.m["shape"].set(4,i,r);
  this.m["shape"].set(5,i,g);
  this.m["shape"].set(6,i,b);
  this.m["shape"].set(7,i,a);
  this.m["shape"].set(8,i,x);
  this.m["shape"].set(9,i,y);
}

function add_shape_rect(i,x,y,w,h,r,g,b,a)
{
  this.add_shape_pt(i++, x+0, y+0, r, g, b, a, 0, 0, 0);
  this.add_shape_pt(i++, x+w, y+0, r, g, b, a, 0, 0, 0);
  this.add_shape_pt(i++, x+0, y+h, r, g, b, a, 0, 0, 0);

  this.add_shape_pt(i++, x+w, y+0, r, g, b, a, 0, 0, 0);
  this.add_shape_pt(i++, x+0, y+h, r, g, b, a, 0, 0, 0);
  this.add_shape_pt(i++, x+w, y+h, r, g, b, a, 0, 0, 0);

  return i;
}
function add_shape_rect_corner(i,x,y,w,h,r,g,b,a,corner,lt)
{
/* 0 - lower left */
/* 1 - lower right */
/* 2 - upper left */
/* 3 - upper right */
  switch (corner) {
    case 0:
      this.add_shape_pt(i++, x+0, y+0, r, g, b, a, 2, -1, -1, lt);
      this.add_shape_pt(i++, x+w, y+0, r, g, b, a, 2, 0, -1, lt);
      this.add_shape_pt(i++, x+0, y+h, r, g, b, a, 2, -1, 0, lt);

      this.add_shape_pt(i++, x+w, y+0, r, g, b, a, 2, 0, -1, lt);
      this.add_shape_pt(i++, x+0, y+h, r, g, b, a, 2, -1, 0, lt);
      this.add_shape_pt(i++, x+w, y+h, r, g, b, a, 2, 0, 0, lt);
      break;
    case 1:
      this.add_shape_pt(i++, x+0, y+0, r, g, b, a, 2, 0, -1, lt);
      this.add_shape_pt(i++, x+w, y+0, r, g, b, a, 2, 1, -1, lt);
      this.add_shape_pt(i++, x+0, y+h, r, g, b, a, 2, 0, 0, lt);

      this.add_shape_pt(i++, x+w, y+0, r, g, b, a, 2, 1, -1, lt);
      this.add_shape_pt(i++, x+0, y+h, r, g, b, a, 2, 0, 0, lt);
      this.add_shape_pt(i++, x+w, y+h, r, g, b, a, 2, 1, 0, lt);
      break;
    case 2:
      this.add_shape_pt(i++, x+0, y+0, r, g, b, a, 2, -1, 0, lt);
      this.add_shape_pt(i++, x+w, y+0, r, g, b, a, 2, 0, 0, lt);
      this.add_shape_pt(i++, x+0, y+h, r, g, b, a, 2, -1, 1, lt);

      this.add_shape_pt(i++, x+w, y+0, r, g, b, a, 2, 0, 0, lt);
      this.add_shape_pt(i++, x+0, y+h, r, g, b, a, 2, -1, 1, lt);
      this.add_shape_pt(i++, x+w, y+h, r, g, b, a, 2, 0, 1, lt);
      break;
    case 3:
      this.add_shape_pt(i++, x+0, y+0, r, g, b, a, 2, 0, 0, lt);
      this.add_shape_pt(i++, x+w, y+0, r, g, b, a, 2, 1, 0, lt);
      this.add_shape_pt(i++, x+0, y+h, r, g, b, a, 2, 0, 1, lt);

      this.add_shape_pt(i++, x+w, y+0, r, g, b, a, 2, 1, 0, lt);
      this.add_shape_pt(i++, x+0, y+h, r, g, b, a, 2, 0, 1, lt);
      this.add_shape_pt(i++, x+w, y+h, r, g, b, a, 2, 1, 1, lt);
      break;
  }

  return i;
}

function draw_shape({n,gl})
{
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function create_prag_shape(caM_data, vbo)
{
  let gl = this.gl;
  return this.g.Prag({
    gl: gl,
    vars: {
      mode_st: [ 'vertexAttribPointer', 4, gl.FLOAT, false, 4 * 10, 4 * 0 ],
      color:   [ 'vertexAttribPointer', 4, gl.FLOAT, false, 4 * 10, 4 * 4 ],
      coord:   [ 'vertexAttribPointer', 2, gl.FLOAT, false, 4 * 10, 4 * 8 ],
      caM: [ 'uniformMatrix4fv', false, caM_data ]
    },
    vbo: {
      coord: vbo,
      color: vbo,
      mode_st: vbo
    }
  });
}

function create_prog_shape()
{
  let gl = this.gl;
  let options = {
    gl: gl,
    src: { },
    location_fx: {
      coord: 'getAttribLocation',
      color: 'getAttribLocation',
      mode_st: 'getAttribLocation',
      caM: 'getUniformLocation'
    },
    enable_fx: {
      coord: 'enableVertexAttribArray',
      color: 'enableVertexAttribArray',
      mode_st: 'enableVertexAttribArray'
    }
  }
  options.src[gl.VERTEX_SHADER] = `
precision highp float;
attribute vec2  coord;
attribute vec4  color;
attribute vec4  mode_st;

varying   vec4  frag_color;
varying   vec4  frag_mode_st;

uniform   mat4  caM;

void main() {
  frag_color   = color;
  frag_mode_st = mode_st;

  gl_Position = caM * vec4(coord.x, coord.y, 0.0, 1.0);
}
`;

  options.src[gl.FRAGMENT_SHADER] = `
precision highp float;
varying vec4 frag_color;
varying vec4 frag_mode_st;

void main() {
  if (frag_mode_st[0] == 0.0) {
    gl_FragColor = frag_color;
  } else if (frag_mode_st[0] == 1.0) {
    float s = frag_mode_st[1];
    float t = frag_mode_st[2];
    if ((s * s + t * t) <= 1.0) {
      gl_FragColor = frag_color;
    } else {
      discard;
    }
  } else if (frag_mode_st[0] == 2.0) {
    float s = frag_mode_st[1];
    float t = frag_mode_st[2];
    float lt = frag_mode_st[3];
    float mag = sqrt((s * s) + (t * t));
    if (mag <= (1.0 + lt) && mag >= (1.0 - lt)) {
      gl_FragColor = frag_color;
    } else {
      discard;
    }
  }
}
`;
  return this.g.Program(options);
}

function lookup_button(button)
{
  switch (button) {
    case 0:
      return 0; /* NK_BUTTON_LEFT */
  }
  return 0;
}

let queue_display = function()
{
  if (this.is_display_queued) {
    return;
  }
  let delta = Date.now() - this.last_display_time;
  let frame_duration = 1000 / 60;
  if (delta < frame_duration) {
    this.is_display_queued = true;
    setTimeout(function (obj) { obj.g.gl.display() }, frame_duration - delta, this);
  } else {
    this.g.gl.display();
  }
}

let keyup = function({key})
{
}

let keydown = function({key})
{
  if (key.length == 1) {
    this.input.push([ this.wasm.instance.exports.nk_input_char, [this.nk.ctx, key.charCodeAt(0) ]]);
  } else {
    let nk_key = -1;
    if (key == "Backspace") {
      nk_key = this.wasm.instance.exports.nk_key_lookup(this.nk.s.NK_KEY_BACKSPACE);
    }
    if (key == "ArrowLeft") {
      nk_key = this.wasm.instance.exports.nk_key_lookup(this.nk.s.NK_KEY_LEFT);
    }
    if (key == "ArrowRight") {
      nk_key = this.wasm.instance.exports.nk_key_lookup(this.nk.s.NK_KEY_RIGHT);
    }
    if (key == "Enter") {
      nk_key = this.wasm.instance.exports.nk_key_lookup(this.nk.s.NK_KEY_ENTER);
    }
    if (key == "Delete") {
      nk_key = this.wasm.instance.exports.nk_key_lookup(this.nk.s.NK_KEY_DEL);
    }
    if (key == "ArrowUp") {
      nk_key = this.wasm.instance.exports.nk_key_lookup(this.nk.s.NK_KEY_UP);
    }
    if (key == "ArrowDown") {
      nk_key = this.wasm.instance.exports.nk_key_lookup(this.nk.s.NK_KEY_DOWN);
    }
    if (key == "Tab") {
      nk_key = this.wasm.instance.exports.nk_key_lookup(this.nk.s.NK_KEY_TAB);
    }
    if (key == "Home") {
      nk_key = this.wasm.instance.exports.nk_key_lookup(this.nk.s.NK_KEY_TEXT_START);
      this.input.push([ this.wasm.instance.exports.nk_input_key, [this.nk.ctx, nk_key, 1 ]]);
      this.input.push([ this.wasm.instance.exports.nk_input_key, [this.nk.ctx, nk_key, 0 ]]);
      nk_key = this.wasm.instance.exports.nk_key_lookup(this.nk.s.NK_KEY_SCROLL_START);
    }
    if (key == "End") {
      nk_key = this.wasm.instance.exports.nk_key_lookup(this.nk.s.NK_KEY_TEXT_END);
      this.input.push([ this.wasm.instance.exports.nk_input_key, [this.nk.ctx, nk_key, 1 ]]);
      this.input.push([ this.wasm.instance.exports.nk_input_key, [this.nk.ctx, nk_key, 0 ]]);
      nk_key = this.wasm.instance.exports.nk_key_lookup(this.nk.s.NK_KEY_SCROLL_END);
    }
    if (key == "PageUp") {
      nk_key = this.wasm.instance.exports.nk_key_lookup(this.nk.s.NK_KEY_SCROLL_UP);
    }
    if (key == "PageDown") {
      nk_key = this.wasm.instance.exports.nk_key_lookup(this.nk.s.NK_KEY_SCROLL_DOWN);
    }
    if (key == "Shift") {
      nk_key = this.wasm.instance.exports.nk_key_lookup(this.nk.s.NK_KEY_SHIFT);
    }
    if (nk_key == -1) {
      return;
    }
    this.input.push([ this.wasm.instance.exports.nk_input_key, [this.nk.ctx, nk_key, 1 ]]);
    this.input.push([ this.wasm.instance.exports.nk_input_key, [this.nk.ctx, nk_key, 0 ]]);
  }
  this.queue_display(); 
}

let mousemove = function({x,y})
{
  this.input.push([ this.wasm.instance.exports.nk_input_motion, [this.nk.ctx, x, y ]]);
  this.queue_display(); 
}

let mousedown = function({x,y,button})
{
  button = lookup_button(button);
  this.input.push([ this.wasm.instance.exports.nk_input_button, [ this.nk.ctx, button, x, y, true ]]);
  this.queue_display(); 
}

let mouseup = function({x,y,button})
{
  button = lookup_button(button);
  this.input.push([ this.wasm.instance.exports.nk_input_button, [ this.nk.ctx, button, x, y, false ]]);
  this.queue_display(); 
}

function resize({width, height})
{
  this.width = width;
  this.height = height;
  this.m.caM.set(0, 0, 2 / width);
  this.m.caM.set(1, 1, -2 / height);
  this.m.caM.set(0, 3, -1.0);
  this.m.caM.set(1, 3, 1.0);
}

function init(gl)
{
  this.gl = gl;

  this.m["caM"] = g.matrix(Float32Array, 4, 4);
  this.m["caM"].identity();

  this.m["shape"] = g.matrix(Float32Array, 10, 16 * 3);
  this.vbo = g.VBO({gl: gl, m: this.m["shape"]});
  this.prag = this.create_prag_shape(this.m.caM._data, this.vbo);
  this.prog = this.create_prog_shape();

  const malloc = g.import_object.env.malloc;
  //const malloc = this.wasm.instance.exports.my_malloc;
  const str_c  = g.import_object.env.str_c;
  const c_str  = g.import_object.env.c_str;

  this.nk.ctx = malloc(18328);
  this.nk.cmds = malloc(120);
  this.nk.rect = malloc(16);
  this.nk.property = malloc(4);
  this.nk.bg = malloc(4 * 4);
  this.nk.s = {
    Demo: c_str("Demo"),
    button: c_str("button"),
    easy: c_str("easy"),
    hard: c_str("hard"),
    Compression: c_str("Compression:"),
    background: c_str("background:"),
    R: c_str("#R:"),
    G: c_str("#G:"),
    B: c_str("#B:"),
    A: c_str("#A:"),
    NK_KEY_BACKSPACE: c_str("NK_KEY_BACKSPACE"),
    NK_KEY_RIGHT: c_str("NK_KEY_RIGHT"),
    NK_KEY_LEFT: c_str("NK_KEY_LEFT"),
    NK_KEY_ENTER: c_str("NK_KEY_ENTER"),
    NK_KEY_DEL: c_str("NK_KEY_DEL"),
    NK_KEY_UP: c_str("NK_KEY_UP"),
    NK_KEY_DOWN: c_str("NK_KEY_DOWN"),
    NK_KEY_TAB: c_str("NK_KEY_TAB"),
    NK_KEY_TEXT_START: c_str("NK_KEY_TEXT_START"),
    NK_KEY_SCROLL_START: c_str("NK_KEY_SCROLL_START"),
    NK_KEY_TEXT_END: c_str("NK_KEY_TEXT_END"),
    NK_KEY_SCROLL_END: c_str("NK_KEY_SCROLL_END"),
    NK_KEY_SCROLL_UP: c_str("NK_KEY_SCROLL_UP"),
    NK_KEY_SCROLL_DOWN: c_str("NK_KEY_SCROLL_DOWN"),
    NK_KEY_SHIFT: c_str("NK_KEY_SHIFT")
  }
  this.nk.glfont = this.wasm.instance.exports.alloc_nk_glfont(4 * (16.0), 4 * (10.512));
  this.nk.drawcmd = malloc(32);
  this.nk.op = 1;
  this.wasm.instance.exports.nk_init_default(this.nk.ctx, this.nk.glfont);
  this.wasm.instance.exports.nk_buffer_init_default(this.nk.cmds);
}

let nk_fxs = {
    nk_wasm_command_scissor: function(i32_1, i32_2, i32_3, i32_4) {
      let x = i32_1;
      let y = i32_2;
      let w = i32_3;
      let h = i32_4;
      if (DEBUG_FUNCTION_PRINTS) {
        console.log("nk_wasm_command_scissor");
      }
	/* This doesn't send a clear signal.
	 * If remains enabled it screws up the button rendering
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(x,y,w,h);
	*/
    },
    nk_wasm_command_line: function(i32_1,i32_2,i32_3,i32_4,i32_5,i32_6) {
      let nk = g.nuklear;
      let line_thickness = i32_1;
      let x0 = i32_2;
      let y0 = i32_3;
      let x1 = i32_4;
      let y1 = i32_5;
      let nk_color = i32_6;
      let r = nk.wasm.instance.exports.nk_color_r(nk_color);
      let G = nk.wasm.instance.exports.nk_color_g(nk_color);
      let b = nk.wasm.instance.exports.nk_color_b(nk_color);
      let a = nk.wasm.instance.exports.nk_color_a(nk_color);
      let lt = line_thickness;
      let off = lt / 2.0;
      let i = 0;
      if (DEBUG_FUNCTION_PRINTS) {
        console.log("nk_wasm_command_line");
      }
      if (x0 == x1) {
        nk.add_shape_rect(i, x0 - off    , y0, lt, y1 - y0, r, G, b, a);
      } else if (y0 == y1) {
        nk.add_shape_rect(i, x0, y0 - off, x1, lt, r, G, b, a);
      } else {
        console.log("Unhandled diagonal line");
      }
      
      nk.vbo.reload();
      nk.prag.run(nk.prog, draw_shape, {n: i, gl: g.gl.gl});
    },
    nk_wasm_command_curve: function(i32) { console.log(" nk_wasm_command_curve"); },
    nk_wasm_command_rect: function(i32_1, i32_2, i32_3, i32_4, i32_5, i32_6, i32_7) {
      let nk = g.nuklear;
      let rounding = i32_1;
      let line_thickness = i32_2;
      let x = i32_3;
      let y = i32_4;
      let w = i32_5;
      let h = i32_6;
      let nk_color = i32_7;
      let r = nk.wasm.instance.exports.nk_color_r(nk_color);
      let G = nk.wasm.instance.exports.nk_color_g(nk_color);
      let b = nk.wasm.instance.exports.nk_color_b(nk_color);
      let a = nk.wasm.instance.exports.nk_color_a(nk_color);
      if (DEBUG_FUNCTION_PRINTS) {
        console.log("nk_wasm_command_rect");
      }
      if (line_thickness == 0) {
        return;
      }
      let i = 0;
      let lt = line_thickness;
      let rn = rounding;
      let off = lt / 2.0;
        i = nk.add_shape_rect(i, x - off, y + rn, lt, h - 2 * rn, r, G, b, a);
        i = nk.add_shape_rect(i, x + w - off, y + rn, lt, h - 2 * rn, r, G, b, a);

        i = nk.add_shape_rect(i, x + rn, y - off, w - 2 * rn, lt, r, G, b, a);
        i = nk.add_shape_rect(i, x + rn, y + h - off, w - 2 * rn, lt, r, G, b, a);
      if (rn == 0) {
        i = nk.add_shape_rect(i, x - off    , y - off, lt, lt, r, G, b, a);
        i = nk.add_shape_rect(i, x + w - off, y - off, lt, lt, r, G, b, a);

        i = nk.add_shape_rect(i, x - off    , y + h - off, lt, lt, r, G, b, a);
        i = nk.add_shape_rect(i, x + w - off, y + h - off, lt, lt, r, G, b, a);
      } else {
        /* 0 - lower left */
        /* 1 - lower right */
        /* 2 - upper left */
        /* 3 - upper right */
        let frag_lt = lt / (lt + rn);
        i = nk.add_shape_rect_corner(i, x - off    , y - off, lt + rn, lt + rn, r, G, b, a, 0, frag_lt);
        i = nk.add_shape_rect_corner(i, x + w - off - rn, y - off, lt + rn, lt + rn, r, G, b, a, 1, frag_lt);

        i = nk.add_shape_rect_corner(i, x - off    , y + h - off - rn, lt + rn, lt + rn, r, G, b, a, 2, frag_lt);
        i = nk.add_shape_rect_corner(i, x + w - off - rn, y + h - off - rn, lt + rn, lt + rn, r, G, b, a, 3, frag_lt);
      }
      nk.vbo.reload();
      nk.prag.run(nk.prog, draw_shape, {n: i, gl: g.gl.gl});
    },
    nk_wasm_command_rect_filled: function(i32_1, i32_2, i32_3, i32_4, i32_5, i32_6) {
      let rounding = i32_1;
      let x = i32_2;
      let y = i32_3;
      let w = i32_4;
      let h = i32_5;
      let nk_color = i32_6;
      let r = g.nuklear.wasm.instance.exports.nk_color_r(nk_color);
      let G = g.nuklear.wasm.instance.exports.nk_color_g(nk_color);
      let b = g.nuklear.wasm.instance.exports.nk_color_b(nk_color);
      let a = g.nuklear.wasm.instance.exports.nk_color_a(nk_color);
      let nk = g.nuklear;
      if (DEBUG_FUNCTION_PRINTS) {
        console.log("nk_wasm_command_rect_filled");
      }
      let i = 0;
      if (rounding == 0) {
        i = nk.add_shape_rect(i, x, y, w, h, r, G, b, a);
      } else {
        let o = rounding;
        i = nk.add_shape_rect(i, x + o, y + 0, w - 2 * o, o        , r, G, b, a);
        i = nk.add_shape_rect(i, x + 0, y + o, w        , h - 2 * o, r, G, b, a);
        i = nk.add_shape_rect(i, x + o, y + h - o, w - 2 * o, o        , r, G, b, a);

        nk.add_shape_pt(i++, x+o, y+0, r, G, b, a, 1, 0, -1);
        nk.add_shape_pt(i++, x+0, y+o, r, G, b, a, 1, -1, 0);
        nk.add_shape_pt(i++, x+o, y+o, r, G, b, a, 1, 0, 0);

        nk.add_shape_pt(i++, x+w-o, y+0, r, G, b, a, 1, 0, -1);
        nk.add_shape_pt(i++, x+w, y+o, r, G, b, a, 1, 1, 0);
        nk.add_shape_pt(i++, x+w-o, y+o, r, G, b, a, 1, 0, 0);

        nk.add_shape_pt(i++, x+o, y+h, r, G, b, a, 1, 0, 1);
        nk.add_shape_pt(i++, x+0, y+h-o, r, G, b, a, 1, -1, 0);
        nk.add_shape_pt(i++, x+o, y+h-o, r, G, b, a, 1, 0, 0);

        nk.add_shape_pt(i++, x+w-o, y+h, r, G, b, a, 1, 0, 1);
        nk.add_shape_pt(i++, x+w, y+h-o, r, G, b, a, 1, 1, 0);
        nk.add_shape_pt(i++, x+w-o, y+h-o, r, G, b, a, 1, 0, 0);

      }
      nk.vbo.reload();
      nk.prag.run(nk.prog, draw_shape, {n: i, gl: g.gl.gl});
    },
    nk_wasm_command_rect_multi_color: function(i32_1, i32_2, i32_3, i32_4, i32_5, i32_6, i32_7, i32_8) {
      let x = i32_1;
      let y = i32_2;
      let w = i32_3;
      let h = i32_4;
      let nk_color_left = i32_5;
      let nk_color_top = i32_6;
      let nk_color_right = i32_7;
      let nk_color_bottom = i32_8;

      let l_r = wasm.instance.exports.nk_color_r(nk_color_left);
      let l_g = wasm.instance.exports.nk_color_g(nk_color_left);
      let l_b = wasm.instance.exports.nk_color_b(nk_color_left);
      let l_a = wasm.instance.exports.nk_color_a(nk_color_left);

      let t_r = wasm.instance.exports.nk_color_r(nk_color_top);
      let t_g = wasm.instance.exports.nk_color_g(nk_color_top);
      let t_b = wasm.instance.exports.nk_color_b(nk_color_top);
      let t_a = wasm.instance.exports.nk_color_a(nk_color_top);

      let r_r = wasm.instance.exports.nk_color_r(nk_color_right);
      let r_g = wasm.instance.exports.nk_color_g(nk_color_right);
      let r_b = wasm.instance.exports.nk_color_b(nk_color_right);
      let r_a = wasm.instance.exports.nk_color_a(nk_color_right);

      let b_r = wasm.instance.exports.nk_color_r(nk_color_bottom);
      let b_g = wasm.instance.exports.nk_color_g(nk_color_bottom);
      let b_b = wasm.instance.exports.nk_color_b(nk_color_bottom);
      let b_a = wasm.instance.exports.nk_color_a(nk_color_bottom);
      if (DEBUG_FUNCTION_PRINTS) {
        console.log("nk_wasm_command_rect_multi_color");
console.log({l_r,l_g,l_b,l_a});
console.log({t_r,t_g,t_b,t_a});
console.log({r_r,r_g,r_b,r_a});
console.log({b_r,b_g,b_b,b_a});
      }


      let i = 0;
	    /* x,y = left
	       x+w,y = top
	       x+w,y+h = right
	       x,y+h = bottom
	    */

      add_shape_pt(i++, x+0, y+0, l_r, l_g, l_b, l_a, 0, 0, 0);
      add_shape_pt(i++, x+w, y+0, t_r, t_g, t_b, t_a, 0, 0, 0);
      add_shape_pt(i++, x+0, y+h, b_r, b_g, b_b, b_a, 0, 0, 0);

      add_shape_pt(i++, x+w, y+0, t_r, t_g, t_b, t_a, 0, 0, 0);
      add_shape_pt(i++, x+0, y+h, b_r, b_g, b_b, b_a, 0, 0, 0);
      add_shape_pt(i++, x+w, y+h, r_r, r_g, r_b, r_a, 0, 0, 0);

      vbo["shape"].reload();
      prag["shape"].run(prog["shape"], draw_shape, i);
    },
    nk_wasm_command_circle: function(i32) { console.log(" nk_wasm_command_circle"); },
    nk_wasm_command_circle_filled: function(i32_1, i32_2, i32_3, i32_4, i32_5) {
      let nk = g.nuklear;
      let x = i32_1;
      let y = i32_2;
      let w = i32_3;
      let h = i32_4;
      let color = i32_5;
      let r = nk.wasm.instance.exports.nk_color_r(color);
      let G = nk.wasm.instance.exports.nk_color_g(color);
      let b = nk.wasm.instance.exports.nk_color_b(color);
      let a = nk.wasm.instance.exports.nk_color_a(color);
      if (DEBUG_FUNCTION_PRINTS) {
        console.log("nk_wasm_command_circle_filled");
      }

      let i = 0;

      nk.add_shape_pt(i++, x+0, y+0, r, G, b, a, 1.0, -1.0, -1.0);
      nk.add_shape_pt(i++, x+w, y+0, r, G, b, a, 1.0,  1.0, -1.0);
      nk.add_shape_pt(i++, x+0, y+h, r, G, b, a, 1.0, -1.0,  1.0);

      nk.add_shape_pt(i++, x+w, y+0, r, G, b, a, 1.0,  1.0, -1.0);
      nk.add_shape_pt(i++, x+0, y+h, r, G, b, a, 1.0, -1.0,  1.0);
      nk.add_shape_pt(i++, x+w, y+h, r, G, b, a, 1.0,  1.0,  1.0);

      nk.vbo.reload();
      nk.prag.run(nk.prog, draw_shape, {n: i, gl: g.gl.gl });
    },
    nk_wasm_command_arc: function(i32) { console.log(" nk_wasm_command_arc"); },
    nk_wasm_command_arc_filled: function(i32) { console.log(" nk_wasm_command_arc_filled"); },
    nk_wasm_command_triangle: function(i32) { console.log(" nk_wasm_command_triangle"); },
    nk_wasm_command_triangle_filled: function(i32_1, i32_2, i32_3, i32_4, i32_5, i32_6, i32_7) {
      let nk = g.nuklear;
      let x0 = i32_1;
      let y0 = i32_2;
      let x1 = i32_3;
      let y1 = i32_4;
      let x2 = i32_5;
      let y2 = i32_6;
      let color = i32_7;
      let r = nk.wasm.instance.exports.nk_color_r(color);
      let G = nk.wasm.instance.exports.nk_color_g(color);
      let b = nk.wasm.instance.exports.nk_color_b(color);
      let a = nk.wasm.instance.exports.nk_color_a(color);
      if (DEBUG_FUNCTION_PRINTS) {
        console.log("nk_wasm_command_triangle_filled");
      }

      let i = 0;
      nk.add_shape_pt(i++, x0, y0, r, G, b, a, 0, 0, 0);
      nk.add_shape_pt(i++, x1, y1, r, G, b, a, 0, 0, 0);
      nk.add_shape_pt(i++, x2, y2, r, G, b, a, 0, 0, 0);
      nk.vbo.reload();
      nk.prag.run(nk.prog, draw_shape, {n: i, gl: g.gl.gl});
    },
    nk_wasm_command_polygon: function(i32) { console.log(" nk_wasm_command_polygon"); },
    nk_wasm_command_polygon_filled: function(i32) { console.log(" nk_wasm_command_polygon_filled"); },
    nk_wasm_command_polyline: function(i32) { console.log(" nk_wasm_command_polyline"); },
    nk_wasm_command_text: function(i32_1, i32_2, i32_3, i32_4, i32_5, i32_6, i32_7, i32_8, i32_9, i32_10, i32_11) {
      let nk = g.nuklear;
      let font = i32_1;
      let bgcolor = i32_2;
      let fgcolor = i32_3;
      let r = nk.wasm.instance.exports.nk_color_r(fgcolor);
      let G = nk.wasm.instance.exports.nk_color_g(fgcolor);
      let b = nk.wasm.instance.exports.nk_color_b(fgcolor);
      let a = nk.wasm.instance.exports.nk_color_a(fgcolor);
      let x = i32_4;
      let y = i32_5;
      let w = i32_6;
      let h = i32_7;
      let height = i32_8;
      let length = i32_9;
      let s = g.import_object.env.str_c(i32_10);
      let char_width = height * 0.657;
      //let char_width = height * 0.5;
      let calc_width = char_width * length;
      if (DEBUG_FUNCTION_PRINTS) {
        console.log("nk_wasm_command_text: " + s);
      }
      for (let i=0; i<length; i++) {
        g.glf.draw_char(s.charCodeAt(i), x + i*char_width, y + 1.2*height, char_width, height);
      }
    },
    nk_wasm_command_image: function(i32) { console.log(" nk_wasm_command_image"); },
    nk_wasm_command_custom: function(i32) { console.log(" nk_wasm_command_custom"); },
};

let display = function() {
  this.last_display_time = Date.now();
  this.is_display_queued = false;
  let wasm = this.wasm;
  wasm.instance.exports.nk_rect(this.nk.rect, 0, 0, this.width, this.height);
  wasm.instance.exports.nk_input_begin(this.nk.ctx);
  for (let i=0; i<this.input.length; i++) {
    let fn = this.input[i][0];
    let fn_arg = this.input[i][1];
    fn(...fn_arg);
  }
  wasm.instance.exports.nk_input_end(this.nk.ctx);
  wasm.instance.exports.nk_HWvWS(this.nk.ctx, this.width, this.height);
	/*
enum nk_panel_flags {
    NK_WINDOW_BORDER            = NK_FLAG(0),
    NK_WINDOW_MOVABLE           = NK_FLAG(1),
    NK_WINDOW_SCALABLE          = NK_FLAG(2),
    NK_WINDOW_CLOSABLE          = NK_FLAG(3),
    NK_WINDOW_MINIMIZABLE       = NK_FLAG(4),
    NK_WINDOW_NO_SCROLLBAR      = NK_FLAG(5),
    NK_WINDOW_TITLE             = NK_FLAG(6),
    NK_WINDOW_SCROLL_AUTO_HIDE  = NK_FLAG(7),
    NK_WINDOW_BACKGROUND        = NK_FLAG(8),
    NK_WINDOW_SCALE_LEFT        = NK_FLAG(9),
    NK_WINDOW_NO_INPUT          = NK_FLAG(10)
};
87 = BORDER | MOVABLE | SCALABLE | MINIMIZABLE | TITLE
343 = 87 | BACKGROUND
*/
	/*
  wasm.instance.exports.nk_window_set_bounds(this.nk.ctx, this.nk.rect);
  if (wasm.instance.exports.nk_begin(this.nk.ctx, this.nk.s.Demo, this.nk.rect, 0)) {
    wasm.instance.exports.nk_layout_row_static(this.nk.ctx, 30, 80, 1);
    if (wasm.instance.exports.nk_button_label(this.nk.ctx, this.nk.s.button)) {
      console.log("button pressed");
    }
    wasm.instance.exports.nk_layout_row_dynamic(this.nk.ctx, 30, 2);
    if (wasm.instance.exports.nk_option_label(this.nk.ctx, this.nk.s.easy, this.nk.op == 1)) { this.nk.op = 1; }
    if (wasm.instance.exports.nk_option_label(this.nk.ctx, this.nk.s.hard, this.nk.op == 2)) { this.nk.op = 2; }

    wasm.instance.exports.nk_layout_row_dynamic(this.nk.ctx, 25, 1);
    wasm.instance.exports.nk_property_int(this.nk.ctx, this.nk.s.Compression, 0, this.nk.property, 100, 10, 1);

  }
  wasm.instance.exports.nk_end(this.nk.ctx);

  wasm.instance.exports.nk_wasm_draw_calculator(this.nk.ctx);
  */
	/*
  wasm.instance.exports.nk_wasm_draw_overview(this.nk.ctx);
  wasm.instance.exports.nk_wasm_draw_canvas(this.nk.ctx);
  wasm.instance.exports.nk_wasm_draw_node_editor(this.nk.ctx);
  */
  this.gl.disable(this.gl.SCISSOR_TEST);
  wasm.instance.exports.nk_wasm_draw(this.nk.ctx);
  //console.log({draw_stack});
  this.input = [];
}

let nuklear = function(g)
{
  let obj = {
    mousemove: mousemove,
    mousedown: mousedown,
    mouseup: mouseup,
    keydown: keydown,
    keyup: keyup,
    width: 240,
    height: 120,
    resize: resize,
    init: init,
    display: display,
    create_prag_shape: create_prag_shape,
    create_prog_shape: create_prog_shape,
    nk_fxs: nk_fxs,
    add_shape_pt: add_shape_pt,
    add_shape_rect: add_shape_rect,
    add_shape_rect_corner: add_shape_rect_corner,
    is_display_queued: false,
    queue_display: queue_display,
    last_display_time: 0,
    g: g,
    m: {  },
    input: [ ],
    nk: { },
  };


  return obj;
}

module.exports.nuklear       = nuklear;
