/*
 *   _____  ___ __  __
 *  |_   _|/ _ \\ \/ /
 *    | | | (_) |>  <
 *    |_|  \___//_/\_\
 *
 * Copyright (C) 2013-2015 The Tox Foundation <https://tox.im/>
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the
 * Free Software Foundation; either version 2 of the License, or (at your
 * option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

(function() {
    
    var Tox = {
        s: Foundation.utils.S, // Main selector
        e: function(e) { return e(); }, // Execute a function
        g: function(g) { return Foundation.utils.random_str(g); }, // Random string generator
        d: { // Defines
            scrollInstance: new ScrollMagic(),
            pathToAssets: 'assets/images/',
            clickEvent: (Modernizr.touch ? 'touchstart' : 'click'),
            cssPaths: {
                scrollingArrow: 'header.toxHeader footer a'
            }
        }
    };
        
    // Run the Bootstrap
    Tox.Bootstrap = function()
    {
        // Inject Scenes
        this.e(this.scenesMap.Header);
        this.e(this.scenesMap.Content.One);
        this.e(this.scenesMap.Footer);
        
        // Watch Resize Events
        Tox.resize.run();
        
        return true;
    };
    
    Tox.scenesMap = {
        
        memory: {},
        
        Header: function()
        {
            // Make timeline: https://github.com/janpaepke/ScrollMagic/blob/master/examples/advanced/svg_drawing.html#L80
            
            // Get right background density and load it
            Tox.utils.injectBackground('header.toxHeader section');
            
            // If the user support csstransforms, show full-screen header
            if(Modernizr.csstransforms) {
                Tox.resize.addEvent(function(height, width) {
                    Tox.s('header.toxHeader').css({height: height});
                });
            }
                        
            // Show the download button details
            Tox.s('header.toxHeader section div p.hide').removeClass('hide');
            // Detect OS for Download button...
            
            // Show Header
            TweenMax.to([
                'header.toxHeader section'
            ], .4, {delay: 1, opacity: 1, ease: Sine.easeInOut, onComplete: function() {
            
                // Create Tween
                var Tween = TweenMax.to([
                    'body header.toxHeader section',
                    'body header.toxHeader section div',
                    'body header.toxHeader footer'
                ], 1, {
                    opacity:0.3,
                    className: '+=tween',
                    ease: Sine.easeInOut
                });

                // Create the new scene
                var scrollScenes = [
                    (new ScrollScene(
                    {
                        duration: function()
                        {
                            return Tox.resize.stats.h; // Refresh height of the scene dynamically
                        }
                    })
                    //.setPin('body header.toxHeader section')
                    .setTween(Tween)
                    .addTo(Tox.d.scrollInstance))
                ];
                
                // Unlock scrolling
                Tox.s('body').css({'overflow': 'auto'});
            }});
            
            // Add scrolling arrow bouncing
            (new TimelineMax({repeat:300, delay:0.5})
            .add(TweenMax.to(Tox.d.cssPaths.scrollingArrow, 1, {y:'10', ease:Bounce.easeOut}))
            .add(TweenMax.to(Tox.d.cssPaths.scrollingArrow, 1, {delay: 2, y:0, ease:Sine.easeOut})));
            
            // Handle scrolling arrow
            Tox.s(Tox.d.cssPaths.scrollingArrow).on(Tox.d.clickEvent, function(e) {
                e.preventDefault();
                TweenLite.to(window, 1, {scrollTo:{x:0, y: Tox.resize.stats.h}});
            });
            
            return true;
        },
        
        Content:
        {
            One: function()
            {
                // Get right background density and load it
                Tox.utils.injectBackground('aside.tObject section.preview', 'aside.tObject section.preview div');
                
                // Create Tween
                var Tween = TweenMax.to([
                    'aside.tObject section.preview',
                    'aside.tObject section.preview div'
                ], 1, {
                    className: '+=tween',
                    ease: Sine.easeInOut
                });
                
                // Create the new scene
                var scrollScenes = (new ScrollScene({
                    duration: 1200
                })
                //.setPin('aside.tObject section.preview')
                .setTween(Tween)
                .addTo(Tox.d.scrollInstance));
            }
        },
        
        Footer: function()
        {
            return true;
        }
    };
    
    // Resize listener
    Tox.resize = {
        
        memory: [],
        stats:
        {
            h: Tox.s('body').outerHeight(),
            w: Tox.s('body').outerWidth()
        },
        addEvent: function(execCallback)
        {
            // Push the callback to memory
            this.memory.push(execCallback);
            
            // Execute callbacks for the first time
            execCallback(Tox.resize.stats.h, Tox.resize.stats.w);
            
            return this.memory.length;
        },
        removeEvent: function(id)
        {
            this.memory[id] = false;
        },
        
        run: function()
        {
            var execCallbacks = function(h, w)
            {
                for(var i = 0, len = Tox.resize.memory.length; i < len; i++)
                {
                    Tox.resize.memory[i](h, w);
                }
            };
            
            // Fire events
            Tox.s(window).on('resize.tox', Foundation.utils.throttle(function(e) {
                                
                // Get Height / Width
                Tox.resize.stats = {
                    h: Tox.s('body').outerHeight(),
                    w: Tox.s('body').outerWidth()
                };
                
                // Execute callbacks
                execCallbacks(Tox.resize.stats.h, Tox.resize.stats.w);
            }, 10));
        }
    };
    
    // Tox Utilities
    Tox.utils = {

        // Dense (Retina Detector) helper
        injectBackground: function(selector, selectorTarget) {
            var image = Tox.s(selector).dense('getImageAttribute');
            if(image == '') return false;
            return Tox.s((typeof selectorTarget == "undefined" ? selector : selectorTarget)).css({'background-image': 'url("' + Tox.d.pathToAssets + image + '")'});
        }
    };
    
    return Tox.Bootstrap();
})();