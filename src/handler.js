let keydown = function(e)
{
  console.log(e);
  window.handler_obj.publish("keydown", { key: e.key });
}

let keyup = function(e)
{
  window.handler_obj.publish("keyup", { key: e.key });
}

let mousemove = function(e)
{
  window.handler_obj.publish("mousemove", { x: e.clientX, y: e.clientY });
}

let mousedown = function(e)
{
  window.handler_obj.publish("mousedown", { x: e.clientX, y: e.clientY, button: e.button });
}

let mouseup = function(e)
{
  window.handler_obj.publish("mouseup", { x: e.clientX, y: e.clientY, button: e.button });
}

let resize = function() {
  window.handler_obj.publish("resize", { width: window.innerWidth, height: window.innerHeight });
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

function handler()
{
  let obj = {
    subscribe: subscribe,
    publish: publish,
    fxs: [ ]
  };
  window.handler_obj = obj;
  window.onmousemove = mousemove;
  window.onmousedown = mousedown;
  window.onmouseup   = mouseup;
  window.onresize    = resize;
  window.onkeydown   = keydown;
  window.onkeyup     = keyup;
  return obj;
}

module.exports.handler = handler;
