/*
 *   _____  ___ __  __
 *  |_   _|/ _ \\ \/ /
 *    | | | (_) |>  <
 *    |_|  \___//_/\_\
 *
 * Copyright (C) 2015 The Tox Project <https://tox.chat/>
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
        g: function(g) { return Foundation.utils.random_str(g); }, // Random string generator
        c: {}, // Cache
        d: { // Defines
            scrollInstance: (new ScrollMagic.Controller()),
            events: {
                Click: (Modernizr.touch ? 'touchstart' : 'click'),
                Scroll: (Modernizr.touch ? 'touchmove' : 'DOMMouseScroll mousewheel')
            },
            cssPaths: {
                imgs: window.imagesRevisionsDensity,
                scrollingArrow: 'header.toxHeader aside a',
                downloadLinuxClientsSelection: 'aside.tObject.downloadNow table tr td input',
                downloadButton: 'header.toxHeader section div p.download a.dlbutton',
                downloadSectionLink: 'header.toxHeader section div p.infos a.dlbutton'
            }
        }
    };

    // Run the Bootstrap
    Tox.Bootstrap = function()
    {
        // Start device detection
        Detectizr.detect({
            detectDevice:true,
            detectScreen:true
        });

        // Load images for the current pixel density
        jQuery('<link>')
            .appendTo('head')
            .attr({type : 'text/css', rel : 'stylesheet'})
            .attr('href', Tox.d.cssPaths.imgs[(Tox.utils.devicePixelRatio() == 1 ? 1 : 2)]);

        // Load scenes
        this.scenesMap.Header();
        //this.scenesMap.Content.One();
        this.scenesMap.Footer();

        // Watch Resize Events
        Tox.resize.run();
    };

    Tox.scenesMap = {
        memory: {},

        Header: function()
        {
            // Make timeline: https://github.com/janpaepke/ScrollMagic/blob/master/examples/advanced/svg_drawing.html#L80

            // Lock scrolling only for tablet/desktop
            switch(Modernizr.touch) {

                // This is a mobile/tablet device - Do not lock scrolling
                case true: Tox.scrollManager.Unlock(); break;

                // Desktop
                // Lock scrolling & bind unlocking to keyboard arrows
                case false:
                Tox.scrollManager.Lock();
                Tox.s(document).on('keydown.scrollManager', function(e) {
                    switch(e.which) {
                        case 38: case 40: // Up/Down
                        e.preventDefault(); // Prevent execution
                        Tox.scrollManager.Unlock(true);
                        break;
                    }
                });
                break;
            }

            // If the user support csstransforms, show full-screen header
            if(Modernizr.csstransforms) {
                Tox.resize.addEvent(function(height, width) {
                    Tox.s('header.toxHeader').css({height: height});
                });
            }

            // Remove anchors as Javascript is active
            Tox.s('a[data-anchor=true]').attr('href', '');

            // Show the download button details
            Tox.s('header.toxHeader section div p.hide').removeClass('hide');
            
            // Open the download link in a new tab
            Tox.s(Tox.d.cssPaths.downloadButton).attr('target', '_blank');
            
            switch(Detectizr.os.name) {

                case 'windows': // Windows
                if(Tox.utils.gteVersion('7', Detectizr.os.version)) {
                    Tox.utils.replaceDownloadText('win', 'Windows 7 or later');
                } else {
                    Tox.utils.replaceDownloadText('win', 'Please upgrade to Windows 7 or later');
                }
                
                // Set download button link
                Tox.s(Tox.d.cssPaths.downloadButton)
                    .attr('href', 'https://wiki.tox.chat/Binaries#Windows');
                break;

                case 'mac os': // OS X
                if(Tox.utils.ltVersion('10.7.0', Detectizr.os.version)) {
                    Tox.utils.replaceDownloadText('osx', 'OS X 10.7 or later');
                } else {
                    Tox.utils.replaceDownloadText('osx', 'Please upgrade to OS X 10.7 or later');
                }
                    
                // Set download button link
                Tox.s(Tox.d.cssPaths.downloadButton)
                    .attr('href', 'https://wiki.tox.chat/Binaries#MacOSX');
                break;

                case 'ios': // iOS
                Tox.utils.replaceDownloadText('osx', 'iOS 7 or later');
                    
                // Set download button link
                Tox.s(Tox.d.cssPaths.downloadButton)
                    .attr('href', 'https://wiki.tox.chat/Binaries#iOS');
                break;

                case 'linux': // Linux
                Tox.utils.replaceDownloadText('nux', 'GNU/Linux');
                    
                // Set download button link
                Tox.s(Tox.d.cssPaths.downloadButton)
                    .attr('href', 'https://wiki.tox.chat/Binaries#Linux');
                break;
                    
                default:
                // No OS found, add Tox.d.cssPaths.downloadButton to Tox.d.cssPaths.downloadSectionLink
                Tox.d.cssPaths.downloadSectionLink = Tox.d.cssPaths.downloadSectionLink + ', ' + Tox.d.cssPaths.downloadButton;
                break;
            }

            // Handle download button
            Tox.s(Tox.d.cssPaths.downloadSectionLink).on(Tox.d.events.Click, function(e) {
                e.preventDefault();

                // Unlock scrolling
                Tox.scrollManager.Unlock();

                // Scroll to the bottom of the page
                TweenLite.to(window, .8, {scrollTo:{x:0, y: Tox.s(document).height()}});
            });
            
            // Handle arrow scrolling
            Tox.s(Tox.d.cssPaths.scrollingArrow).on(Tox.d.events.Click, function(e) {
                e.preventDefault();

                // Unlock scrolling
                Tox.scrollManager.Unlock(true);
            });
            
            // Add scrolling arrow bouncing
            (new TimelineMax({repeat:300, delay:0.5})
                .add(TweenMax.to(Tox.d.cssPaths.scrollingArrow, 1, {y:10, ease:Bounce.easeOut}))
                .add(TweenMax.to(Tox.d.cssPaths.scrollingArrow, 1, {delay: 2, y:0, ease:Sine.easeOut})));
            
            // Show Header
            TweenMax.to('header.toxHeader section', .4, {
                delay: 1,
                opacity: 1,
                ease: Sine.easeInOut,
                onComplete: function() {

                    // Create Tween
                    var Tween = TweenMax.to([
                        'body header.toxHeader section',
                        'body header.toxHeader section div',
                        'body header.toxHeader aside.footer'
                    ], 1, {
                        opacity:0.3,
                        className: '+=tween',
                        ease: Sine.easeInOut
                    });

                    // Create the new scene
                    var scrollScenes = [
                        (new ScrollMagic.Scene({
                            duration: function()
                            {
                                return Tox.resize.stats.h; // Refresh height of the scene dynamically
                            }
                        })
                        //.setPin('body header.toxHeader section')
                        .setTween(Tween)
                        .addTo(Tox.d.scrollInstance))
                    ];
                }
            });

            return true;
        },

        Footer: function()
        {
            // Handle selection for Linux text
            Tox.s(Tox.d.cssPaths.downloadLinuxClientsSelection).on(Tox.d.events.Click, function(e) {
                Tox.s(this).select();
            });

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
            this.memory[ id ] = false;
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

    // Unlock / Lock scrolling
    Tox.scrollManager = {

        Lock: function()
        {
            Tox.s('body').css({'overflow': 'hidden'});
            Tox.s(document).on(Tox.d.events.Scroll, function(e) {
                e.stopPropagation();
                e.preventDefault();
                Tox.scrollManager.Unlock(true);
                return false;
            });
            TweenLite.to(window, 0.1, {
                scrollTo: {
                    x:0,
                    y: 0
                }
            });

            return true;
        },

        Unlock: function(scrollToPresentation)
        {
            if(Tox.s('body').css('overflow') === 'auto') return false;

            // Unlock scrolling
            Tox.s('body').css({'overflow': 'auto'});
            Tox.s(document).off(Tox.d.events.Scroll);

            // Unlock keyboard down/up keys
            if(!Modernizr.touch) Tox.s(document).off('keydown.scrollManager');

            // Scroll to presentation
            if(jQuery.type(scrollToPresentation) !== 'undefined') TweenLite.to(window, 1, {scrollTo:{x:0, y: Tox.resize.stats.h}});

            return true;
        }
    };

    // Tox Utilities
    Tox.utils = {

        devicePixelRatio: function()
        {
            if(jQuery.type(Tox.c.pixelRatio) !== 'undefined') return Tox.c.pixelRatio;

            var pixelRatio = 1;

            if(jQuery.type(window.devicePixelRatio) !== 'undefined')
            {
                pixelRatio = Math.ceil(window.devicePixelRatio);
            }
            else if(jQuery.type(window.matchMedia) !== 'undefined')
            {
                jQuery.each([1.3, 2, 3, 4, 5, 6, 7], function(key, ratio)
                {
                    var mediaQuery = [
                        '(-webkit-min-device-pixel-ratio: ' + ratio + ')',
                        '(min-resolution: ' + Math.floor(ratio*96) + 'dpi)',
                        '(min-resolution: ' + ratio + 'dppx)'
                    ].join(',');

                    if(!window.matchMedia(mediaQuery).matches) {
                        return false;
                    }

                    pixelRatio = Math.ceil(ratio);
                });
            }

            // Return and cache result
            Tox.c.pixelRatio = pixelRatio;
            return pixelRatio;
        },

        cmpVersion: function(a, b) {
            var i, cmp, len, re = /(\.0)+[^\.]*$/;
            a = (a + '').replace(re, '').split('.');
            b = (b + '').replace(re, '').split('.');
            len = Math.min(a.length, b.length);
            for( i = 0; i < len; i++ ) {
                cmp = parseInt(a[i], 10) - parseInt(b[i], 10);
                if( cmp !== 0 ) {
                    return cmp;
                }
            }
            return a.length - b.length;
        },
        gteVersion: function(a, b) {
            return (this.cmpVersion(a, b) >= 0);
        },
        ltVersion: function(a, b) {
            return (this.cmpVersion(a, b) < 0);
        },
        replaceDownloadText: function(os, specs) {
            Tox.s('span#download-platform').addClass(os).append('&nbsp;&nbsp;');
            Tox.s('span#download-specs').html(specs + ' &middot;');
        }
    };

    return Tox.Bootstrap();
})();