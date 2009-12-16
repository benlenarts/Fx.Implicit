/*
---
description: Fx.Implicit class

license: MIT-style

authors:
- Ben Lenarts

requires:
  core/1.2.4: '*'
# actually:
# - core/1.2.4: Fx.Morph

provides: [Element.Properties.opacity.get, Fx.Implicit]

inspiration:
  Spiffy by Lon Boonen (closed source, developed at Q42 in the Netherlands)

credits:
  Q42 (http://q42.nl), for allowing me to release this code as open-source

...
*/

// - display none bij het meten van stijl uitzetten

// the Mootools getter for opacity doesn't cut it. We need computed opacity
Element.Properties.opacity.get = function() {
  if (this.getStyle('visibility') == 'hidden') return '0';
  if (Browser.Engine.trident) {
    var filterValue = this.getStyle('filter');
    if (!filterValue) return '1';
    var match = filterValue.match(/alpha\(opacity=(\d{1,3})\)/);
    if (!match) return '1';
    return ''+(match[1].toInt() / 100);
  } else {
    return this.getComputedStyle('opacity');
  }
};


Fx.Implicit = new Class({

  Implements: Options,

  options: {
    properties: 'top left width height margin padding border-width border-color color background-color opacity display'.split(' ')
  },

  initialize: function(selector, options) {
    this.selector = selector;
    this.checkQueue = $H();
    this.setOptions(options);
    Fx.Implicit.instances.push(this);
  },
         
  destroy: function() {
    Fx.Implicit.instances.erase(this);
  },

  onDomChange: function(element) {
    var effectedElements = element.getElements(this.selector);
    if (element.match(this.selector)) effectedElements.push(element);
    effectedElements.each(this.addToCheckQueue.bind(this));
  },

  addToCheckQueue: function(element) {
    if (!this.checkQueue.has(element.uid)) {
      this.checkQueue.set(element.uid, {
        'element': element, 
        'style': {'before': this.readStyles(element)}
      });
    }
  },

  start: function() {
    if (this.checkQueue.getLength() == 0) return;
    var morphs = [];
    var self = this;
    this.checkQueue.each(function(item) {
      item.style.after = self.readStyles(item.element, true);
      var diff = Fx.Implicit.diffStyles(item.style.before, item.style.after);
      if ($H(diff).getLength() > 0) {
        item.element.setStyles(item.style.before);
        morphs.push({'element': item.element, 'style': diff});
      }
    });
    morphs.each(function(morph) {
      // filter immediate properties (i.e. display)
      var d = morph.style.display;
      if (d) {
        if (d[0] == 'none') morph.element.setStyle('display',d[1]);
        delete morph.style.display;
      }
      // convert color names (for IE)
      if (Browser.Engine.trident) {
        var newDiff = {};
        for (prop in morph.style)
          newDiff[prop] = 
            (/\bcolor$/).test(prop) ? morph.style[prop].map(Fx.Implicit.convertColorNames) : morph.style[prop];
        morph.style = newDiff;
      }
      // get fx associated with the element
      var fx = morph.element.retrieve('fx:reactive morph', null);
      if (!fx) {
        fx = new Fx.Morph(morph.element, self.options);
        fx.addEvent('complete', function() {
          Fx.Implicit.removeStyles(this.element, self.options.properties);          
        });
        morph.element.store('fx:reactive morph', fx);
      }
      // start the new transition
      fx.cancel();
      fx.start(morph.style);
    });
    this.checkQueue = $H();
  },

  readStyles: function(element, withoutInline) {
    var style = element.get('style');
    if (withoutInline && style) element.erase('style');
    if (element.getStyle('display') == 'none') element.setStyle('display','block');
    var styles = element.getStyles.apply(element, this.options.properties);
    element.set('style', style || '');
    return styles;
  }

});

Fx.Implicit.extend({

  instances: [],
  listeners: {originals: [], wrapped: []},
  isListening: false,
  domChanged: false,
  changedElements: {},

  add: function(selector, options) {
    return new Fx.Implicit(selector, options);
  },

  onDomChange: function(element) {
    if (this.isListening && !this.changedElements[element.uid]) {
      this.changedElements[element.uid] = true;
      this.domChanged = true;
      this.instances.each(function(instance) {
        instance.onDomChange(element);
      });
    }
  },

  makeDomChanger: function(fn) {
    var self = this;
    return function() {
      self.onDomChange(this);
      return fn.apply(this, arguments);
    }
  },

  listen: function(fn) {
    if (this.isListening) {
      return fn.run();
    } else {
      this.isListening = true;
      var result = fn.run();
      if (this.domChanged) this.start();
      this.isListening = false;
      this.domChanged = false;
      this.changedElements = {};
      return result;
    }
  },

  makeListener: function(fn) {
    // cache listeners to make the resulting functions as comparable as their originals
    if (this.listeners.wrapped.contains(fn)) return fn;

    var pos = this.listeners.originals.indexOf(fn);
    if (pos != -1) {
      return this.listeners.wrapped[pos];
    } else {
      var self = this;
      var wrapped = function() {
        return self.listen(fn.bind(this, arguments));
      };
      this.listeners.originals.push(fn);
      this.listeners.wrapped.push(wrapped);
      return wrapped;
    }
  },

  start: function() {
    this.instances.each(function(instance) { instance.start(); });
  },

  diffStyles: function(before, after) {
    var diff = {};
    for (var prop in before) {
      var valueBefore = before[prop];
      var valueAfter = after[prop];
      if (valueAfter !== undefined && valueBefore != valueAfter)
        diff[prop] = [valueBefore, valueAfter];
    }
    return diff;
  },

  removeStyles: function(element, properties) {
    var removeVisibility = properties.contains('opacity');
    element.set('style', element.get('style').replace(/ *([^:]+):[^;]+(;|$)/g, function(clause, property) {
      return (properties.contains(property) || removeVisibility && property == 'visibility') ? '' : clause;
    }));
  },

  cssColors: $H({
    aqua: '#00ffff',
    black: '#000000',
    blue: '#0000ff',
    fuchsia: '#ff00ff',
    gray: '#808080',
    green: '#008000',
    lime: '#00ff00',
    maroon: '#800000',
    navy: '#000080',
    olive: '#808000',
    purple: '#800080',
    red: '#ff0000',
    silver: '#c0c0c0',
    teal: '#008080',
    white: '#ffffff',
    yellow: '#ffff00'
  }),

  convertColorNames: function(value) {
    return value.replace(/\b\w+\b/g, function(word) {
      return Fx.Implicit.cssColors[word] || word;
    });
  }

});

