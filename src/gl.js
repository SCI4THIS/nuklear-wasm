let resize = function ({width, height}) {
  let el = document.getElementById(this.id);
  el.width = width;
  el.height = height;
  this.gl.viewport(0,0,width,height);
  this.publish("resize", {width, height})
  this.display();
}

let display = function()
{
  let gl = this.gl
  gl.clearColor(0.5, 0.5, 0.5, 0);
  gl.clear(gl.COLOR_BUFFER_BIT + gl.DEPTH_BUFFER_BIT);
  this.publish("display", gl);
}

let init = function()
{
  let options = { alpha: false };
  let el      = document.getElementById(this.id);
  let gl_ctx;
  try { gl_ctx = el.getContext("webgl", options) } catch (e) { }
  try { gl_ctx = gl_ctx || canvas.getContext("experimental-webgl", options); } catch(e) { }
  if (gl_ctx == null) {
    console.log("couldn't create GL instance");
    return;
  }
  this.gl = gl_ctx;
  this.publish("init", this.gl);
  this.resize({ width: window.innerWidth, height: window.innerHeight});
}


let subscribe = function(object, tag)
{
  this.fxs.push({ object, tag });
}

let publish = function(tag, args)
{
  for (let i=0; i<this.fxs.length; i++) {
    if (this.fxs[i].tag == tag) {
      this.fxs[i].object[tag](args);
    }
  }
}

let gl = function(id)
{
  return {
    id: id,
    init: init,
    resize: resize,
    display: display,
    subscribe: subscribe,
    publish: publish,
    fxs: [ ]
  };
}

module.exports.gl = gl;
