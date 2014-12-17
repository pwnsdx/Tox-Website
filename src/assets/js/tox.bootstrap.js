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

(function() {
    
    var Tox = {
        s: Foundation.utils.S, // Main selector
        e: function(e) { return e(); }, // Execute a function
        g: function(g) { return Foundation.utils.random_str(g); }, // Random string generator
        d: {
            scrollInstance: new ScrollMagic()
        }
    };
        
    // Run the Bootstrap
    Tox.Bootstrap = function()
    {
        // Inject Scenes
        this.e(this.scenesMap.Header);
        
        Tox.resize.addEvent(function(height, width) {
            Tox.s('body header.toxHeader').css({height: height});
        });
        
        // Watch Resize Events
        Tox.resize.watchEvents();
        
        return true;
    };
    
    Tox.scenesMap = {
        
        Header: function() {
            // Make timeline: https://github.com/janpaepke/ScrollMagic/blob/master/examples/advanced/svg_drawing.html#L80
            
            var gBdyHeight = function() {
                return Tox.resize.stats.h;
            };
                        
            var tween = TweenMax.to('body header.toxHeader section', 1, {className: '+=active'});
            
            return new ScrollScene({duration: gBdyHeight}) // Duration can be a function (return resize event)
            //.setPin('body header.toxHeader section')
            .setTween(tween)
            .addTo(Tox.d.scrollInstance);
        }
    };
    
    // Resize listener
    Tox.resize = {
        
        memory: [],
        stats: {
            h: Tox.s('body').outerHeight(),
            w: Tox.s('body').outerWidth()
        },
        addEvent: function(execCallback) {
            
            // Push the callback to memory
            this.memory.push(execCallback);
            
            // Execute callbacks for the first time
            execCallback(Tox.resize.stats.h, Tox.resize.stats.w);
            
            return this.memory.length;
        },
        removeEvent: function(id) {
            this.memory[id] = false;
        },
        
        watchEvents: function() {
            
            var execCallbacks = function(h, w) {       
                for(var i = 0, len = Tox.resize.memory.length; i < len; i++) {
                    Tox.resize.memory[i](h, w);
                }
            };
            
            // Fire events
            Tox.s(window).on('resize', Foundation.utils.throttle(function(e) {
                
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
    
    return Tox.Bootstrap();
})();