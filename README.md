Fx.Implicit
===========

Register implicit animations similar to Webkit's CSS-transitions. 

How to use
----------

Just write CSS for different visual states:

  #CSS
  .box { background-color: blue; }
  .box.alternate { background-color: red; }

And register the implicit animation in javascript:

	#JS
  Fx.Implicit.add('.box', {properties: ['background-color']});

This code doesn't require HTML to be present, so you can execute it whenever you want.

The options available are all the options available to Fx.Morph, plus the 'properties' option which allows you to specify the CSS properties you want to animate.

Visual state changes are checked and animated on every event. This code will cause the background color of every .box to animate whenever it is clicked:

	#JS
  $$('.box').addEvent('click', function() {
    this.toggleClass('alternate');
  });

