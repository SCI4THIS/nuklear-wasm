var NS_VBO = { }

NS_VBO.NOP = function () { }

NS_VBO.init = function ()
{
  this.id = this.gl.createBuffer()
  this.init = NS_VBO.NOP;
}

NS_VBO.reload_sub = function (target)
{
  this.gl.bufferData(target, this.m._data, this.usage)
  this.reload_sub = NS_VBO.NOP;
}

NS_VBO.reload = function ()
{
  this.reload_sub = NS_VBO.reload_sub
}

NS_VBO.bind = function (target)
{
  this.init()
  this.gl.bindBuffer(target, this.id)
  this.reload_sub(target)
}

NS_VBO.m_alert = function (index, vbo, arg2)
{
  vbo.reload()
}

function VBO(options)
{
  options = options || { };
  if (options.m === undefined) {
    console.error("options needs m");
    return null;
  }
  if (options.gl === undefined) {
    console.error("options needs gl");
    return null;
  }
  let gl = options.gl
  let m  = options.m;
  return {
    m: m,
    gl: gl,
    init: NS_VBO.init,
    usage: options.usage || gl.STATIC_DRAW,
    bind: NS_VBO.bind,
    reload: NS_VBO.reload,
    reload_sub: NS_VBO.reload_sub,
  };
}

module.exports.VBO = VBO;
