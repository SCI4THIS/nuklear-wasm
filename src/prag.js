var NS_Prag = { }

NS_Prag.run = function (prog, draw, draw_arg)
{
  prog.use()
  for (id in this.vars) {
    let fxs = this.vars[id]
    let loc = prog.locs[id]
    if (this.vbo[id] != undefined) {
      this.vbo[id].bind(prog.gl.ARRAY_BUFFER)
    }
    if (loc != undefined) {
      switch(fxs.length) {
        case 2: prog.gl[fxs[0]](loc, fxs[1]); break;
        case 3: prog.gl[fxs[0]](loc, fxs[1], fxs[2]); break;
        case 4: prog.gl[fxs[0]](loc, fxs[1], fxs[2], fxs[3]); break;
        case 5: prog.gl[fxs[0]](loc, fxs[1], fxs[2], fxs[3], fxs[4]); break;
        case 6: prog.gl[fxs[0]](loc, fxs[1], fxs[2], fxs[3], fxs[4], fxs[5]);
            break;
      }
    }
  }
  draw(draw_arg)
}

function Prag(options)
{
  options = options || { }
  return {
    vbo: options.vbo || { },
    vars: options.vars || { },
    run: NS_Prag.run
  };
}

module.exports.Prag = Prag;
