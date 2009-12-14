Fx.Implicit
===========

Cross-browser implicit animations analogous to WebKit's CSS-transitions. 

How to use
----------

Just write CSS for different visual states:

	#CSS
	.box { background-color: blue; }
	.box.alternate { background-color: red; }

And register the implicit animation in javascript:

	#JS
	Fx.Implicit.add('.box', {properties: ['background-color']});

This call doesn't require HTML to be present, so you can execute it whenever you want.

The options available are the same as those available to Fx.Morph, plus the `properties` option which allows you to specify the CSS properties you want to animate.

Visual state changes are automatically detected within events and timed functions. The following code will cause the background color of every element with the `box` class to animate whenever it is clicked:

	#JS
	$$('.box').addEvent('click', function() {
	  this.toggleClass('alternate');
	});

