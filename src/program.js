var NS_Program = { };

NS_Program.NOP = function () { }

NS_Program.compile = function (progtype, src, force)
{
  let shader = this.gl.createShader(progtype);
  this.gl.shaderSource(shader, src)
  this.gl.compileShader(shader)
  let log = this.gl.getShaderInfoLog(shader)
  if (log.length > 0) {
    console.error(log)
    if (force) {
      if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        console.error(src)
        return -1;
      } else {
        console.error("Shader was forced through!");
        return shader;
      }
    }
    console.error(src);
    return -1;
  }
  return shader;
}

NS_Program.init = function ()
{
  this.shaders = { }

  for (id in this.src) {
    let src = this.src[id]
    this.shaders[id] = this.compile(id, src, true);
    if (this.shaders[id] === -1) {
      this.id = 0;
      return;
    }
  }

  this.id = this.gl.createProgram()

  for (id in this.shaders) {
    let shader = this.shaders[id]
    this.gl.attachShader(this.id, shader)
  }

  this.init = NS_Program.NOP
}

NS_Program.link = function ()
{
  for (i in this.parameters) {
    let fxs = this.parameters[i]
    switch(fxs.length) {
      case 2: fxs[0](this.id, fxs[1]); break;
      case 3: fxs[0](this.id, fxs[1], fxs[2]); break;
      case 4: fxs[0](this.id, fxs[1], fxs[2], fxs[3]); break;
    }
  }

  for (i in this.transform_feedback) {
    let id = this.transform_feedback[i]
    this.gl.transformFeedbackVaryings(this.id, id, this.gl.INTERLEAVED_ATTRIBS)
  }

  this.gl.linkProgram(this.id);

  let log = this.gl.getProgramInfoLog(this.id);
  if (log.length > 0) {
    console.error(log)
  }

  if (!this.gl.getProgramParameter(this.id, this.gl.LINK_STATUS)) {
    console.error('LINK ERROR')
    this.id = 0
  }

  for (id in this.location_fx) {
    let fx = this.location_fx[id];
    this.locs[id] = this.gl[fx](this.id, id);
  }

  for (id in this.enable_fx) {
    let fx = this.enable_fx[id];
    this.gl[fx](this.locs[id])
  }

  this.link = NS_Program.NOP;
}

NS_Program.use = function ()
{
  this.init();
  this.link();
  this.gl.useProgram(this.id);
}

NS_Program.run = function (draw, draw_arg)
{
  this.use()
  draw(draw_arg)
}

function Program(options)
{
  options = options || { }
  if (options.gl === undefined) {
    console.error('options does not contains gl element');
    return null;
  }
  let _program = {
    options: options,
    gl: options.gl,
    use: NS_Program.use,
    _type: options._type || Float32Array,
    src: options.src || { },
    id: 0,
    color: options.color || { r: 1.0, g: 1.0, b: 1.0 },
    link: NS_Program.link,
    compile: NS_Program.compile,
    init: NS_Program.init,
    run: NS_Program.run,
    location_fx: options.location_fx || { },
    enable_fx: options.enable_fx || { },
    transform_feedback: options.transform_feedback || { },
    parameters: options.parameters || { },
    locs: { }
  }
  return _program;
}

module.exports.Program = Program;
