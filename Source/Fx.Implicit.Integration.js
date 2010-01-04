/*
---
description: Ties Fx.Implicit to DOM events and className changes.

license: MIT-style

authors:
- Ben Lenarts

requires:
- Fx.Implicit
- core/1.2.4: Element.Event

provides: 
- Fx.Implicit.Integration

credits:
  Q42 (http://q42.nl), for allowing me to release this code as open-source

...
*/

(function() {

// className triggers
var overrides = {};
['addClass', 'removeClass'].each(function(method) {
  overrides[method] = Fx.Implicit.makeDomChanger(Element.Prototype[method]);
});
Element.implement(overrides);

// DOM event listeners
var overrides = {};
['addEvent', 'removeEvent'].each(function(method) {
  var original = Element.Prototype[method];
  overrides[method] = function(type, fn) {
    original.call(this, type, Fx.Implicit.makeListener(fn));
  }
});
Native.implement([Element, Window, Document], overrides);

// delay & periodical listeners; almost a copy of the original Function#create
Function.prototype.create = function(options){
  var self = this;
  options = options || {};
  return function(event){
    var args = options.arguments;
    args = (args != undefined) ? $splat(args) : Array.slice(arguments, (options.event) ? 1 : 0);
    if (options.event) args = [event || window.event].extend(args);
    var returns = function() {
      return self.apply(options.bind || null, args);
    };
    // the only change: wrap timeouts and intervals
    if (options.delay) return setTimeout(Fx.Implicit.makeListener(returns), options.delay);
    if (options.periodical) return setInterval(Fx.Implicit.makeListener(returns), options.periodical);
    if (options.attempt) return $try(returns);
    return returns();
  };
}

// Request callback listeners
if (window.Request) {
  Request.implement('onStateChange', Fx.Implicit.makeListener(Request.prototype.onStateChange));
}

})();
