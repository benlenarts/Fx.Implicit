Fx.Implicit
===========

Cross-browser implicit animations analogous to WebKit's CSS-transitions. 

![Screenshot](http://benlenarts.github.com/Fx.Implicit/images/screenshot_clock.png)

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

The options available are those of [Fx](http://mootools.net/docs/core/Fx/Fx), plus the `properties` option which allows you to specify the CSS properties you want to animate.

Style changes are automatically detected within events and timed functions. The following code will cause the background color of every element with the `box` class to animate whenever it is clicked:

	#JS
	$$('.box').addEvent('click', function() {
	  this.toggleClass('alternate');
	});

