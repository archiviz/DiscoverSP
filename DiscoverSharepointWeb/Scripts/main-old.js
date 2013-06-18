////extension for creating bar graphs
(function ($) {
    "use strict";
    var opts = new Array(); var level = new Array(); $.fn.jqBarGraph = $.fn.jqbargraph = function (options) {
        var init = function (el) {
            opts[el.id] = $.extend({}, $.fn.jqBarGraph.defaults, options);
            ////proper parsing
           //// $(el).css({ "width": opts[el.id].width,"height": opts[el.id].height,"position": "relative", "text-align": "center"});

            ////modern cop 
            $(el).css("width", opts[el.id].width);
            $(el).css("height", opts[el.id].height);
            $(el).css("position", "relative");
            $(el).css("text-align", "center");

            doGraph(el);
        };
        var sum = function (ar) {
           var  total = 0; for (var val in ar) { total += ar[val]; }
            return total.toFixed(2);
        };

        var max = function (ar) {
            var maxvalue = 0;
            for (var val in ar) {
                var value = ar[val][0];
                if (value instanceof Array) {
                    maxvalue = sum(value);
                }
                if (parseFloat(value) > parseFloat(maxvalue)) {
                    maxvalue = value;
                }
            }
            return (maxvalue);
        };

        var maxMulti = function (ar) {
            maxvalue = 0;
            maxvalue2 = 0;
            for (var val in ar) {
                var ar2 = ar[val][0]; for (var val2 in ar2) {
                    if (ar2[val2] > maxvalue2) {
                        maxvalue2 = ar2[val2];
                    }
                }
                if (maxvalue2 > maxvalue) {
                    maxvalue = maxvalue2;
                }
            }
            return maxvalue;
        };

        var doGraph = function (el) {
            var barr = opts[el.id];
            var data = barr.data;
            if (data == null){
            $(el).html("There is not enought data for graph");      return;
            }

            if (barr.sort === "asc") { data.sort(sortNumbera); }
            if (barr.sort === "desc") { data.sort(sortNumberDesc); }
            var legend = "";
            var prefix = barr.prefix;
            var postfix = barr.postfix;
            var space = barr.barSpace;
            var legendWidth = barr.legend ? barr.legendWidth : 0;
            var fieldWidth = ($(el).width() - legendWidth) / data.length;
            var unique;
            var totalHeight = $(el).height();
            var leg = new Array();
            max = max(data);
            var colPosition = 0; for (var val in data) {
                var value;
                var valueData = data[val][0]; if (valueData instanceof Array) {
                    value = sum(valueData);
                } else {
                    value = valueData;
                }
            var lbl = data[val][1];
            var color = data[val][2];
            unique = val + el.id;
            if (color === null && barr.colors) {
                color = barr.color;
            }
            if (barr.colors && !color) {
                colorsCounter = barr.colors.length;
                if (colorsCounter === colPosition) {
                    colPosition = 0;
                }
                color = barr.colors[colPosition];
                colPosition++;
            }
                      
            if (barr.type === "multi") {
                color = "none";
            } if (lbl == null) { lbl = barr.lbl; } var out = "<div class='graphField" + el.id + "' id='graphField" + unique + "' style='position: absolute'>"; out += "<div class='graphValue" + el.id + "' id='graphValue" + unique + "'>" + prefix + value + postfix + "</div>"; out += "<div class='graphBar" + el.id + "' id='graphFieldBar" + unique + "' style='background-color:" + color + ";position: relative; overflow: hidden;'></div>"; if (!barr.legend || barr.legends) {
                out += "<div class='graphLabel" + el.id + "' id='graphLabel" + unique + "'>" + lbl + "</div>";
            }out += "</div>";
            $(el).append(out); var totalHeightBar = totalHeight - $(".graphLabel" + el.id).height() - $(".graphValue" + el.id).height(); var fieldHeight = (totalHeightBar * value) / max;

            $("#graphField" + unique).css("left", (fieldWidth) * val);
            $("#graphField" + unique).css("width", fieldWidth - space);
            $("#graphField" + unique).css("margin-left", space);

            if (valueData instanceof Array) {
                        if (barr.type === "multi") { var maxe = maxMulti(data); totalHeightBar = fieldHeight = totalHeight - $(".graphLabel" + el.id).height(); $(".graphValue" + el.id).remove(); } else { maxe = max; }
                        for (var i in valueData) {
                            var heig = totalHeightBar * valueData[i] / maxe; var wid = parseInt((fieldWidth - space) / valueData.length); var sv = ""; var fs = 0; if (barr.showValues) { sv = barr.prefix + valueData[i] + barr.postfix; fs = 12; }
                            var o = "<div class='subBars" + el.id + "' style='height:" + heig + "px; background-color: " + barr.colors[i] + "; left:" + wid * i + "px; color:" + barr.showValuesColor + "; font-size:" + fs + "px' >" + sv + "</div>"; $("#graphFieldBar" + unique).prepend(o);
                        }
                    }
            if (barr.type === "multi") {

                $(".subBars" + el.id).css("width", wid); $(".subBars" + el.id).css("position", "absolute");
                $(".subBars" + el.id).css("bottom", 0);
            }
            if (barr.position === "bottom") {
                $(".graphField" + el.id).css("bottom", 0);
            }
            if (!barr.legends) {
                leg.push([color, lbl, el.id, unique]);
            }
                if (barr.animate) { $("#graphFieldBar" + unique).css( "height", 0 ); $("#graphFieldBar" + unique).animate({ "height": fieldHeight }, barr.speed * 1000); } else { $("#graphFieldBar" + unique).css("height", fieldHeight); }
            }
            for (var l in barr.legends) { leg.push([barr.colors[l], barr.legends[l], el.id, l]); }
            createLegend(leg); if (barr.legend) { $(el).append("<div id='legendHolder" + unique + "'></div>"); $("#legendHolder" + unique).css({ "width": legendWidth, "float": "right", "text-align": "left" }); $("#legendHolder" + unique).append(legend); $(".legendBar" + el.id).css({ "float": "left", "margin": 3, "height": 12, "width": 20, "font-size": 0 }); }
            if (barr.title) { $(el).wrap("<div id='graphHolder" + unique + "'></div>"); $("#graphHolder" + unique).prepend(barr.title).css({ "width": barr.width + "px", "text-align": "center" }); }
        };

        var createLegend = function (legendb) {
            var legend = "";
            var unique;
            for (var val in legendb) { legend += "<div id='legend" + legendb[val][3] + "' style='overflow: hidden; zoom: 1;'>"; legend += "<div class='legendBar" + legendb[val][2] + "' id='legendColor" + legendb[val][3] + "' style='background-color:" + legendb[val][0] + "'></div>"; legend += "<div class='legendLabel" + legendb[val][2] + "' id='graphLabel" + unique + "'>" + legendb[val][1] + "</div>"; legend += "</div>"; }
        };

        this.each(function ()
        { init(this); });

    };

    $.fn.jqBarGraph.defaults = { barSpace: 10, width: 400, height: 300, color: "#000000", colors: false, lbl: "", sort: false, position: "bottom", prefix: "", postfix: "", animate: true, speed: 1.5, legendWidth: 100, legend: false, legends: false, type: false, showValues: true, showValuesColor: "#fff", title: false }; function sortNumbera(a, b) { if (a[0] < b[0]) { return -1; } if (a[0] > b[0]) { return 1; } return 0; }
    function sortNumberDesc(a, b) { if (a[0] > b[0]) { return -1; } if (a[0] < b[0]) { return 1; }return 0; }
})(jQuery);




////function for obtaining path values from url for navigation
var Path = {
    version: "0.8.4", map: function (a) {
        "use strict";
        if (Path.routes.defined.hasOwnProperty(a)) { return Path.routes.defined[a]; } else { return new Path.core.route(a);}
    }, root: function (a) { "use strict"; Path.routes.root = a; }, rescue: function (a) { Path.routes.rescue = a; }, history: { initial: {}, pushState: function (a, b, c) { if (Path.history.supported) { if (Path.dispatch(c)) { history.pushState(a, b, c); } } else { if (Path.history.fallback) { window.location.hash = "#" + c; } } }, popState: function (a) { var b = !Path.history.initial.popped && location.href === Path.history.initial.URL; Path.history.initial.popped = true; if (b) { return; } Path.dispatch(document.location.pathname);}, listen: function (a) { Path.history.supported = !!(window.history && window.history.pushState); Path.history.fallback = a; if (Path.history.supported) { Path.history.initial.popped = "state" in window.history, Path.history.initial.URL = location.href; window.onpopstate = Path.history.popState; } else { if (Path.history.fallback) { for (route in Path.routes.defined) { if (route.charAt(0) !== "#") { Path.routes.defined["#" + route] = Path.routes.defined[route]; Path.routes.defined["#" + route].path = "#" + route; } } Path.listen(); } } } }, match: function (a, b) {
        var c = {}, d = null, e, f, g, h, i; for (d in Path.routes.defined) {
            if (d !== null && d !== "") {
                d = Path.routes.defined[d]; e = d.partition(); for (h = 0; h < e.length; h++) {
                    f = e[h]; i = a; if (f.search(/:/) > 0) {
                        for (g = 0; g < f.split("/").length; g++) {
                            if (g < i.split("/").length && f.split("/")[g].charAt(0) === ":") {
                                c[f.split("/")[g].replace(/:/, "")] = i.split("/")[g];

                                i = i.replace(i.split("/")[g], f.split("/")[g]);
                            }
                        }
                    } if (f === i) { if (b) { d.params = c; } return d;}
                }
            }
        } return null;
    }, dispatch: function (a) { var b, c; if (Path.routes.current !== a) { Path.routes.previous = Path.routes.current; Path.routes.current = a; c = Path.match(a, true); if (Path.routes.previous) { b = Path.match(Path.routes.previous); if (b !== null && b.do_exit !== null) { b.do_exit(); } } if (c !== null) { c.run(); return true; } else { if (Path.routes.rescue !== null) { Path.routes.rescue(); } } } }, listen: function () { var a = function () { Path.dispatch(location.hash); }; if (location.hash === "") { if (Path.routes.root !== null) { location.hash = Path.routes.root; } } if ("onhashchange" in window && (!document.documentMode || document.documentMode >= 8)) { window.onhashchange = a; } else { setInterval(a, 50); } if (location.hash !== "") { Path.dispatch(location.hash); } }, core: { route: function (a) { this.path = a; this.action = null; this.do_enter = []; this.do_exit = null; this.params = {}; Path.routes.defined[a] = this;} }, routes: { current: null, root: null, rescue: null, previous: null, defined: {} }
}; Path.core.route.prototype = { to: function (a) { this.action = a; return this; }, enter: function (a) { if (a instanceof Array) { this.do_enter = this.do_enter.concat(a); } else { this.do_enter.push(a); } return this; }, exit: function (a) { this.do_exit = a; return this; }, partition: function () { var a = [], b = [], c = /\(([^}]+?)\)/g, d, e; while (d = c.exec(this.path)) { a.push(d[1]); } b.push(this.path.split("(")[0]); for (e = 0; e < a.length; e++) { b.push(b[b.length - 1] + a[e]); } return b; }, run: function () { var a = false, b, c, d; if (Path.routes.defined[this.path].hasOwnProperty("do_enter")) { if (Path.routes.defined[this.path].do_enter.length > 0) { for (b = 0; b < Path.routes.defined[this.path].do_enter.length; b++) { c = Path.routes.defined[this.path].do_enter[b](); if (!c) { a = true; break; } } } } if (!a) { Path.routes.defined[this.path].action(); } } }



////some easing equations for fluid animations
//// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend(jQuery.easing,
{
    def: "easeOutQuad",
    swing: function (x, t, b, c, d) {
        ////alert(jQuery.easing.default);
        return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
    },
    easeInQuad: function (x, t, b, c, d) {
        return c * (t /= d) * t + b;
    },
    easeOutQuad: function (x, t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    },
    easeInOutQuad: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) { return c / 2 * t * t + b; }
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    },
    easeInCubic: function (x, t, b, c, d) {
        return c * (t /= d) * t * t + b;
    },
    easeOutCubic: function (x, t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b;
    },
    easeInOutCubic: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) { return c / 2 * t * t * t + b; }
        return c / 2 * ((t -= 2) * t * t + 2) + b;
    },
    easeInQuart: function (x, t, b, c, d) {
        return c * (t /= d) * t * t * t + b;
    },
    easeOutQuart: function (x, t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },
    easeInOutQuart: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) { return c / 2 * t * t * t * t + b; }
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    },
    easeInQuint: function (x, t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
    },
    easeOutQuint: function (x, t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    easeInOutQuint: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) { return c / 2 * t * t * t * t * t + b; }
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },
    easeInSine: function (x, t, b, c, d) {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    },
    easeOutSine: function (x, t, b, c, d) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    },
    easeInOutSine: function (x, t, b, c, d) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    },
    easeInExpo: function (x, t, b, c, d) {
        return (t === 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    },
    easeOutExpo: function (x, t, b, c, d) {
        return (t === d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    },
    easeInOutExpo: function (x, t, b, c, d) {
        if (t === 0) { return b; }
        if (t === d) { return b + c; }
        if ((t /= d / 2) < 1) { return c / 2 * Math.pow(2, 10 * (t - 1)) + b; }
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeInCirc: function (x, t, b, c, d) {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    },
    easeOutCirc: function (x, t, b, c, d) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    },
    easeInOutCirc: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) { return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b; }
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    },
    easeInElastic: function (x, t, b, c, d) {
        var s = 1.70158; var p = 0; var a = c;
        if (t == 0) { return b; } if ((t /= d) == 1) { return b + c; } if (!p) { p = d * .3; }
        if (a < Math.abs(c)) { a = c; var s = p / 4; }
        else var s = p / (2 * Math.PI) * Math.asin(c / a);
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    },
    easeOutElastic: function (x, t, b, c, d) {
        var s = 1.70158; var p = 0; var a = c;
        if (t == 0) return b; if ((t /= d) == 1) return b + c; if (!p) p = d * .3;
        if (a < Math.abs(c)) { a = c; var s = p / 4; }
        else var s = p / (2 * Math.PI) * Math.asin(c / a);
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
    },
    easeInOutElastic: function (x, t, b, c, d) {
        var s = 1.70158; var p = 0; var a = c;
        if (t == 0) return b; if ((t /= d / 2) == 2) return b + c; if (!p) p = d * (.3 * 1.5);
        if (a < Math.abs(c)) { a = c; var s = p / 4; }
        else var s = p / (2 * Math.PI) * Math.asin(c / a);
        if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
    },
    easeInBack: function (x, t, b, c, d, s) {
        if (s == null) s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    easeOutBack: function (x, t, b, c, d, s) {
        if (s == null) s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    easeInOutBack: function (x, t, b, c, d, s) {
        if (s == null) s = 1.70158;
        if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    },
    easeInBounce: function (x, t, b, c, d) {
        return c - jQuery.easing.easeOutBounce(x, d - t, 0, c, d) + b;
    },
    easeOutBounce: function (x, t, b, c, d) {
        if ((t /= d) < (1 / 2.75)) {
            return c * (7.5625 * t * t) + b;
        } else if (t < (2 / 2.75)) {
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
        } else if (t < (2.5 / 2.75)) {
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
        } else {
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
        }
    },
    easeInOutBounce: function (x, t, b, c, d) {
        if (t < d / 2) return jQuery.easing.easeInBounce(x, t * 2, 0, c, d) * .5 + b;
        return jQuery.easing.easeOutBounce(x, t * 2 - d, 0, c, d) * .5 + c * .5 + b;
    }
});

////-----------------------------------------------------------------------------------------------
//// ---- global variables -------------------------------------------------------------------------
//// -----------------------------------------------------------------------------------------------
var started = false;
var animoff = true;
var currentpage = 0;
var currentpos = 0;
var contentWidth = 1180;
var visibleArea = 100;
var windowWidth, positionPrevious, positionActive, positionNext, handleWidth, visibleWidth, spaceWidth;
var lastdiv = 0;
var resizeInterval;
var baseurl = "sharepoint101.azurewebsites.net";
var linkurl = "https://" + baseurl + "/";
var add = "";
jQuery.easing.def = "easeInOutSine";
var ckname = "sharepoint_use_case_favs";
var handles = 10;
var adjust = 25;
var vidcount = 0;


////function for modal creation
var modal = (function () {
				var method = {},
				$overlay,
				$modal,
				$content,
				$close;

				//// Center the modal in the viewport
				method.center = function () {
					var top, left, type;

					top = Math.max($(window).height() - $modal.outerHeight(), 0) / 2;
					left = Math.max($(window).width() - $modal.outerWidth(), 0) / 2;

					$modal.css({
						top:top + $(window).scrollTop(), 
						left:left + $(window).scrollLeft()
					});
				};

				//// Open the modal
				method.open = function (settings) {
				type=settings.type;
				$content.empty().append(settings.content);
				if (type=='vid'){
					$('#vidplayer')[0].load();
					$('#vidplayer')[0].play();
					}
					$modal.css({
						width:settings.width || 'auto', 
						height:settings.height || 'auto'
					});

					method.center();
					$(window).bind('resize.modal', method.center);
					$modal.show();
					$overlay.show();
				};

				//// Close the modal
				method.close = function (settings) {
					$modal.hide();
					$overlay.hide();
					if (type=='vid'){
					$('#vidplayer')[0].pause();
					$('#videop').html($content.contents());
					$('.source').remove();
					$('.track').remove();
					}
					$content.empty();
					
					$(window).unbind('resize.modal');
				};

				// Generate the HTML and add it to the document
				$overlay = $('<div style="z-index:2002;" id="overlay"></div>');
				$modal = $('<div style="z-index:2003;" id="modal"></div>');
				$content = $('<div id="content"></div>');
				$close = $('<a id="close" href="#">close</a>');

				$modal.hide();
				$overlay.hide();
				$modal.append($content, $close);

				$(document).ready(function(){
					$('body').append($overlay, $modal);						
				});

				$close.click(function(e){
					e.preventDefault();
					method.close();
				});

return method;
			}());

		
var pad = function(num, totalChars) {
    var pad = '0';
    num = num + '';
    while (num.length < totalChars) {
        num = pad + num;
    }
    return num;
};

// utility function change color
var changeColor = function(color, ratio, darker) {
    // Trim trailing/leading whitespace
    color = color.replace(/^\s*|\s*$/, '');

    // Expand three-digit hex
    color = color.replace(
        /^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i,
        '#$1$1$2$2$3$3'
    );

    // Calculate ratio
    var difference = Math.round(ratio * 256) * (darker ? -1 : 1),
        // Determine if input is RGB(A)
        rgb = color.match(new RegExp('^rgba?\\(\\s*' +
            '(\\d|[1-9]\\d|1\\d{2}|2[0-4][0-9]|25[0-5])' +
            '\\s*,\\s*' +
            '(\\d|[1-9]\\d|1\\d{2}|2[0-4][0-9]|25[0-5])' +
            '\\s*,\\s*' +
            '(\\d|[1-9]\\d|1\\d{2}|2[0-4][0-9]|25[0-5])' +
            '(?:\\s*,\\s*' +
            '(0|1|0?\\.\\d+))?' +
            '\\s*\\)$'
        , 'i')),
        alpha = !!rgb && rgb[4] !== null ? rgb[4] : null,

        // Convert hex to decimal
        decimal = !!rgb? [rgb[1], rgb[2], rgb[3]] : color.replace(
            /^#?([a-f0-9][a-f0-9])([a-f0-9][a-f0-9])([a-f0-9][a-f0-9])/i,
            function() {
                return parseInt(arguments[1], 16) + ',' +
                    parseInt(arguments[2], 16) + ',' +
                    parseInt(arguments[3], 16);
            }
        ).split(/,/),
        returnValue;

    //// Return RGB(A)
    return !!rgb ?
        'rgb' + (alpha !== null ? 'a' : '') + '(' +
            Math[darker ? 'max' : 'min'](
                parseInt(decimal[0], 10) + difference, darker ? 0 : 255
            ) + ', ' +
            Math[darker ? 'max' : 'min'](
                parseInt(decimal[1], 10) + difference, darker ? 0 : 255
            ) + ', ' +
            Math[darker ? 'max' : 'min'](
                parseInt(decimal[2], 10) + difference, darker ? 0 : 255
            ) +
            (alpha !== null ? ', ' + alpha : '') +
            ')' :
        //// Return hex
        [
            '#',
            pad(Math[darker ? 'max' : 'min'](
                parseInt(decimal[0], 10) + difference, darker ? 0 : 255
            ).toString(16), 2),
            pad(Math[darker ? 'max' : 'min'](
                parseInt(decimal[1], 10) + difference, darker ? 0 : 255
            ).toString(16), 2),
            pad(Math[darker ? 'max' : 'min'](
                parseInt(decimal[2], 10) + difference, darker ? 0 : 255
            ).toString(16), 2)
        ].join('');
};

var darkerColor = function(color, ratio) {
    return changeColor(color, ratio, true);
};

////function to get section id from image ids
function getimageid(id){
if (id<=6){
prefix=1;
}else if (id>6&&id<=8){
prefix=2;
}else if (id>8&&id<=10){
prefix=3;
}else if (id>10&&id<=13){
prefix=4;
}else if (id>14&&id<=15){
prefix=5;
}else if (id>15&&id<=16){
prefix=6;
}else{
prefix=7;
}
return prefix;
}

////function to create header popup menus
function makeTopMenu(id) {

    var sec = parseInt(id);
	var hiddenarr = hidden.split(',');
	var offset = '-30';
	var br = '';
	if (windowWidth<1580){
	offset = '-104';
	br = '<br>';
}
	
	var menuhtml = '<ul>';

    if (sec == 1) {
	if (jQuery.inArray('1', hiddenarr) < 0) {
menuhtml+='<li class="fl"><a rel="1" class="flink f-1 m" id="store" href="#store">Store, Sync, And Share Your Content</a></li>';
        }
		
		if (jQuery.inArray('2', hiddenarr) < 0) {
menuhtml+='<li class="fl"><a rel="2" class="flink f-2 m" id="store" href="#store">Keep Everyone On The Same Page</a></li>';
        }
		
		if (jQuery.inArray('3', hiddenarr) < 0) {
menuhtml+='<li class="fl"><a rel="3" class="flink f-3 m" id="store" href="#store">Stay On Track And Deliver On Time</a></li>';
        }
		
		if (jQuery.inArray('4', hiddenarr) < 0) {
menuhtml+='<li class="fl"><a rel="4" class="flink f-4 m" id="store" href="#store">Find the Right People</a></li>';
        }
		
		if (jQuery.inArray('5', hiddenarr) < 0) {
menuhtml+='<li class="fl"><a rel="5" class="flink f-5 m" id="store" href="#store">Find What You Need</a></li>';
        }
		
		if (jQuery.inArray('6', hiddenarr) < 0) {
menuhtml+='<li class="fl"><a rel="6" class="flink f-6 m" id="store" href="#store">Make Informed Decisions</a></li>';
        }

		
    } else if (sec == 7) {
	if (jQuery.inArray('7', hiddenarr) < 0) {
menuhtml+='<li class="fl"><a rel="7" class="flink f-7 m" id="store" href="#store">Onboard New Employees</a></li>';
        }
		
		if (jQuery.inArray('8', hiddenarr) < 0) {
menuhtml+='<li class="fl"><a rel="8" class="flink f-8 m" id="store" href="#store">Keep Everyone Informed</a></li>';
        }
    } else if (sec == 9) {
	if (jQuery.inArray('9', hiddenarr) < 0) {
menuhtml+='<li class="fl"><a rel="9" class="flink f-9 m" id="store" href="#store">Share Your Knowledge</a></li>';
        }
		if (jQuery.inArray('10', hiddenarr) < 0) {
menuhtml+='<li class="fl"><a rel="10" class="flink f-10 m" id="store" href="#store">Boost Business Processes</a></li>';
        }
    } else if (sec == 11) {
	if (jQuery.inArray('11', hiddenarr) < 0) {
menuhtml+='<li class="fl"><a rel="11" class="flink f-11 m" id="store" href="#store">Make Your Customers And Partners Happy</a></li>';
        }
		if (jQuery.inArray('12', hiddenarr) < 0) {
menuhtml+='<li class="fl"><a rel="12" class="flink f-12 m" id="store" href="#store">Engage Your Audience Online</a></li>';
        }
		if (jQuery.inArray('13', hiddenarr) < 0) {
menuhtml+='<li class="fl"><a rel="13" class="flink f-13 m" id="store" href="#store">Align Your Teams</a></li>';
        }
    } else if (sec == 14) {
	if (jQuery.inArray('14', hiddenarr) < 0) {
menuhtml+='<li class="fl"><a rel="14" class="flink f-14 m" id="store" href="#store">Crunch The Numbers Together</a></li>';
        }
    } else if (sec == 15) {
	if (jQuery.inArray('15', hiddenarr) < 0) {
menuhtml+='<li class="fl"><a rel="15" class="flink f-15 m" id="store" href="#store">Help Meet Compliance Needs</a></li>';
        }
    } else if (sec == 16) {
	if (jQuery.inArray('16', hiddenarr) < 0) {
menuhtml+='<li class="fl"><a rel="16" class="flink f-16 m" id="store" href="#store">Provide The Right Support</a></li>';
}
if (jQuery.inArray('17', hiddenarr) < 0) {
menuhtml+='<li class="fl"><a rel="17" class="flink f-17 m" id="store" href="#store">Empower People And Stay In Control</a></li>';
}
    }
	menuhtml+='</ul>';
	return menuhtml;
}

////shareurl params:
////string type = indicates service to use
////int id = indicates section id
function shareURL(type, id){
////get description and title from html
var desc = $('.c_'+id).find('.htext').html();
var bigdesc = $('.c_'+id).find('.hide').html();

if (bigdesc.length<5){
bigdesc = $('.c_'+id).find('.mntext').html();
}


////post to facebook wall
if (type=="fb"){
var imgid = getimageid(parseInt(id));
var wdt = ($(window).width()/2);
////create post url
var url ='https://www.facebook.com/dialog/feed?'+
  'app_id=159161370927800&'+
  'link='+encodeURIComponent(linkurl+'main/index.html#'+$('.c_'+id).attr('id'))+'&'+
  'picture='+linkurl+currentpage+'rollover.png&'+
  'name=Discover%20Sharepoint&'+
  'caption='+encodeURIComponent(desc)+'&'+
  'description='+encodeURIComponent(bigdesc)+'.&'+
  'redirect_uri='+encodeURIComponent(linkurl+'main/index.html#'+$('.c_'+id).attr('id'));
  ////post in blank tab
////window.open(url,'_blank');
var wdt = ($(window).innerWidth()/2)-500;
var hdt = ($(window).innerHeight()/2)-300;
//post in popup window
window.open(url,'1368776105683','width=1000,height=600,toolbar=0,menubar=0,location=0,status=1,scrollbars=0,resizable=0,left='+wdt+',top='+hdt);
////post to linkedin
}else if (type=="li"){
////create post url
var url='http://www.linkedin.com/shareArticle?'+
'mini=true&'+
'url='+encodeURIComponent(linkurl+'main/index.html#'+$('.c_'+id).attr('id'))+'&'+
'title='+encodeURIComponent(desc)+'&'+
'summary='+encodeURIComponent(bigdesc)+'&'+
'source=Discover%20Sharepoint';
var wdt = ($(window).width()/2)-260;
var hdt = ($(window).height()/2)-200;
////post in popup window
window.open(url,'1368776105683','width=520,height=400,toolbar=0,menubar=0,location=0,status=1,scrollbars=0,resizable=0,left='+wdt+',top='+hdt);
////post to email
}else if (type=="twit"){
////create post url
var url='https://twitter.com/share?'+
'url='+encodeURIComponent(linkurl+'main/index.html#'+$('.c_'+id).attr('id'));
var wdt = ($(window).width()/2)-260;
var hdt = ($(window).height()/2)-225;
////post in popup window
window.open(url,'1368776105683','width=520,height=450,toolbar=0,menubar=0,location=0,status=1,scrollbars=0,resizable=0,left='+wdt+',top='+hdt);
////post to email
}else if (type=="yam"){
////create post url
var url='https://www.yammer.com/messages/new?'+
'status='+encodeURIComponent(linkurl+'main/index.html#'+$('.c_'+id).attr('id'));
////post in new window
window.open(url,'1368776105683','width=1000,height=600,toolbar=0,menubar=0,location=0,status=1,scrollbars=0,resizable=0,left='+wdt+',top='+hdt);
////post to email
}else{
////open native email client
window.open('mailto: ?subject='+desc+'&body=Hello, I just found this and thought you might be interested:%0D%0A%0D%0A"'+bigdesc+'"%0D%0A%0D%0Ahttp://'+baseurl+'/main/index.html#/'+$('.c_'+id).attr('id'),'_blank');
}
}

////function to shuffle the contents of an array
function shuffle(array) {
  var tmp, current, top = array.length;
  if(top) while(--top) {
    current = Math.floor(Math.random() * (top + 1));
    tmp = array[current];
    array[current] = array[top];
    array[top] = tmp;
  }
  return array;
}

////function to set the site title based on page navigation selections	
function setTitle(title_postfix){
	var defaultTitle = "Discover Sharepoint";
	$(document).attr("title", defaultTitle+title_postfix);
	$('meta[property=og\\:title]').attr('content', defaultTitle+title_postfix);
	$('meta[property=og\\:site_name]').attr('content', defaultTitle+title_postfix);
}

////set local storage object
function setStorage(data) {
       localStorage.setItem(ckname, data);
     }
	
////set cookie object, (for ie10 as local storage does not work)
function setCookie(value)
{
var exdate=new Date();
exdate.setDate(exdate.getDate() + 365);
var c_value=escape(value) + ((365===null) ? "" : "; expires="+exdate.toUTCString());
document.cookie="sharepoint_use_case_favs=" + c_value;
}

////retrieve local storage object
function getStorage() {
       return localStorage.getItem(ckname);
}

////retrieve cookie object, (for ie10 as local storage does not work)
function getCookie()
{
var i,x,y,ARRcookies=document.cookie.split(";");
for (i=0;i<ARRcookies.length;i++)
{
  x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
  y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
  x=x.replace(/^\s+|\s+$/g,"");
  if (x == 'sharepoint_use_case_favs') {
      return unescape(y);
  } else {
      return '';
  }
  }
}

function parse(str){
var parsed = [];
if (str!==""&&str!==null){
var arr = str.split(',');
for (var i = 0; i < arr.length; i++) {
if (arr[i]!==null && arr[i]!=="" && typeof arr[i]!='undefined'&& arr[i]!='nan'){
parsed.push(arr[i]);
}
}
}
return parsed;
}


////check favorites (local based for non sharepoint site)
function checkFavorites()
{
var favArr;
    ////alert (document.documentMode);
if (!insp) {
    if (!isie) {
        favs = getStorage();
    }
    else {
        favs = getCookie();
    }
}
  if (favs!==null && favs!==""){
  favArr = parse(favs);
  
  var favhtml='';
  var imgid;
  var count;
  if (favArr.length>6){
  $('#nextfav1').css('display','inline');
  count = 6;
  }else{
   $('#nextfav1').css('display','none');
   count = favArr.length;
  }

  for (var i = 0; i < count; i++) {

  if (i%2===0){
  if (i>0){
  favhtml+='</div>';
  }
  favhtml+='<div class="span4 block-holder">';
  }
  imgid = getimageid(parseInt(favArr[i]));
  
  var icheight;
  
  if ($(window).innerWidth()<1580){
  icheight='105px';
  }else{
  icheight='45%';
  }
  
  
  favhtml+= '<div style="background:url(../Images/buttons/'+favArr[i]+'rollover'+add+'.png) no-repeat;height:'+icheight+';" class="ic2 promo-block-2x1 a-'+(i+1)+' hidden hiddenf hide-show"><a rel="'+favArr[i]+'" class="nav-link menu-item" href="#"></a><div style="display:none;" rel="'+favArr[i]+'" class="title">'+$('.c_'+favArr[i]+' > div').find('.htext').html()+'</div></div>';

}

$('#favholder').html(favhtml);
}else{
$('#favholder').html('<div class="emptyfavs">Click the favorite button on the Use Case pages to add them to this section</div>');
  }
$('#nextfav1').attr('rel','0');
return favs;

}

////check recommended: 
////TODO: integrate DB code for sharepoint users
function checkRec(start)
{
var recArr = parse(rec);

var favhtml='';
var imgid;
var addsm='';
var len;
if (recArr.length>6){
len=6;
}else{
len=recArr.length;
}

  for (var i = 0; i < len; i++) {
  if (i%2===0){
  if (i>0){
  favhtml+='</div>';
  }
  favhtml+='<div class="span4 block-holder">';
  }
  
  var icheight;
  
  if ($(window).innerWidth()<1580){
  icheight='105px';
  var addsm='-SM';
  }else{
  icheight='45%';
  }
  
  
  imgid = getimageid(parseInt(recArr[i]));
  favhtml+= '<div style="background:url(../Images/buttons/'+recArr[i]+'rollover'+addsm+'.png) no-repeat;height:'+icheight+';" class="ic2 promo-block-2x1 a-'+(i+1)+' hidden hiddenf hide-show"><a rel="'+recArr[i]+'" class="nav-link menu-item" href="#"></a><div style="display:none;" rel="'+recArr[i]+'" class="title">'+$('.c_'+recArr[i]+' > div').find('.htext').html()+'</div></div>';
}

$( ".recsec" ).each(function( index ) {
var elem=$(this);
var rel=elem.parent().parent().attr('rel');

	if (jQuery.inArray(rel,recArr)>=0){
	elem.attr('src','../Images/admin_checked.png');
	}else{
	elem.attr('src','../Images/admin_unchecked.png');
	}
	});
	

if (start){
$('#favholder2').html(favhtml);
console.log(recArr.length);
 if (recArr.length>6){
  $('#nextfav2').css('display','inline');
  }else{
  $('#nextfav2').css('display','none');
  }

}else{
 if (recArr.length>6){
  $('#nextfav1').css('display','inline');
  }else{
  $('#nextfav1').css('display','none');
  }
$('#nextfav2').attr('rel','0');
$('#nextfav1').attr('rel','0');
$('#favholder').html(favhtml);
$('#favholder2').html(favhtml);
}
}




function getHash(){
	var hashes = window.location.hash.substring(2);
		var rel;
	if(deeplink){
		if(hashes == "home"){
		}else if(hashes == "store_sync_and_share"){
			rel=1;
		}else if(hashes == "on_the_same_page"){
			rel=2;
		}else if(hashes == "stay_on_track"){
			rel=3;
		}else if(hashes == "connect_with_experts"){
			rel=4;
		}else if(hashes == "find_what_you_need"){
			rel=5;
		}else if(hashes == "make_better_decisions"){
		rel=6;
		}else if(hashes == "onboard_new_employees"){
			rel=7;
		}else if(hashes == "keep_everyone_informed"){
			rel=8;
		}else if(hashes == "share_best_practices"){
			rel=9;
		}else if(hashes == "monitor_business_processes"){
			rel=10;
		}else if(hashes == "make_your_customers_happy"){
			rel=11;
		}else if(hashes == "engage_your_audience"){
			rel=12;
		}else if(hashes == "make_teamwork_easier"){
			rel=13;
		}else if(hashes == "run_the_numbers"){
			rel=14;
		}else if(hashes == "meet_compliance_needs"){
			rel=15;
		}else if(hashes == "provide_the_right_support"){
			rel=16;
		}else if(hashes == "empower_people"){
			rel=17;
		}
		startpage = rel;
			
	
	}
	deeplink = true;	
	////console.log(hashes);
}


function nextfav(oid, cont, cont2)
{
if (!insp) {
if(!isie)
  {
  favs=getStorage();
  }
else
  {
  favs=getCookie();
  }
  }

  
  var id = oid+1;
  console.log(oid);
  console.log(id);
var farr;
var type;
if ($('#rec').hasClass('on')||cont=="#favholder2"){
farr = parse(rec);
}else{
farr = parse(favs);
}



console.log(farr);

if (farr.length<id*6){
id=0;
}
var len = 6;

if (id>0){
farr.splice(0, 6*id);
len = farr.length;
if (farr.length>=6){
len = 6;
}
}

var favhtml='';
var imgid;
console.log(farr);
  
  for (var i = 0; i < len; i++) {

  if (i%2===0){
  if (i>0){
  favhtml+='</div>';
  }
  favhtml+='<div class="span4 block-holder">';
  }
  var icheight;
  var add='';
   if ($(window).innerWidth()<1580){
  icheight='105px';
  add='-SM';
  }else{
  icheight='45%';
  }
  
  
  imgid = getimageid(parseInt(farr[i]));
  favhtml+= '<div style="background:url(../Images/buttons/'+farr[i]+'rollover'+add+'.png) no-repeat;height:'+icheight+';" class="ic2 promo-block-2x1 a-'+(i+1)+' hidden hiddenf hide-show"><a rel="'+farr[i]+'" class="nav-link menu-item" href="#"></a><div style="display:none;" rel="'+farr[i]+'" class="title">'+$('.c_'+farr[i]+' > div').find('.htext').html()+'</div></div>';
}
$(cont2).attr('rel',id+'');
$(cont).html(favhtml);
console.log(cont);
}


////add favorite to user local storage
function addFavorite(id, removed){
if (!insp) {
    if (!isie) {
        favs = getStorage();
    }
    else {
        favs = getCookie();
    }
}
var favArr = parse(favs);
if (favArr!==null&&favArr!==""){ 
var newfavs='';
////alert (id);
if (removed){
if ($.inArray(id, favArr)>-1){
var arrayspot=$.inArray(id, favArr);
favArr.splice(arrayspot,1);
}
}else{
if ($.inArray(id, favArr)>-1){
return false;
}else{
favArr.push(id);
}
}
  for (var i = 0; i < favArr.length; i++) {
  newfavs += favArr[i];
  if (i<favArr.length-1){
  newfavs += ',';
  }
}
}else{
newfavs=id;
}
////alert (newfavs);
favs = newfavs;
if (!insp) {
if(!isie){
setStorage(newfavs);
}else{
  setCookie(newfavs);
  }
  }else{
  addFav();
  }

if (!removed){
$('.c_'+id+' > div').find('.addfavorite').addClass('favorited').attr('src','../Images/favorited.png').css('cursor','pointer');
}else{
$('.c_'+id+' > div').find('.addfavorite').removeClass('favorited').attr('src','../Images/favorite_off.png').css('cursor','pointer');
}
////alert(thisrel);
return newfavs;
}





var deeplink = true;
//// get url hash for navigation and page redirect




//// -----------------------------------------------------------------------------------------------
//// ---- resize window function -------------------------------------------------------------------
//// -----------------------------------------------------------------------------------------------

var positions;
var columncontents=[];
var columnstretch=[];
var menuleft;

function setMenuActive(id){
var mid;
var nwidth=$('#navigation').width();
////var move=155;
var iid;
$('#navigation .active').removeClass('active');
if (id < 1){
mid=0;
iid=0;
}else if (id>=1&&id<7){
mid=1;
iid=1;
}else if (id>=7&&id<9){
mid=7;
iid=2;
}else if (id>=9&&id<11){
mid=9;
iid=3;
}else if (id>=11&&id<14){
mid=11;
iid=4;
}else if (id>=14&&id<15){
mid=14;
iid=5;
}else if (id>=15&&id<16){
mid=15;
iid=6;
}else{
mid=16;
iid=7;
}

var move=-8;
$( "#navigation .menu-item" ).each(function( index ) {
if (!$(this).hasClass('hide')){
	if (index<iid){
	move+=$(this).innerWidth();
	}else if (index==iid){
	move+=$(this).find('a').width()/2;
	}else{
	return false;
	}
	}
	});
////move-=30/iid;
$('#navigation .m_'+mid).addClass('active');
$('#menupointer img').attr('src','../Images/pointer-'+mid+'.png');
if (mid===0){
$('#menupointer').fadeOut('slow');
}else{
$('#menupointer').fadeIn('slow');
}
$("#menupointer").animate({'left' : (move)+'px'}, 1000, 'easeInOutCubic', function(){});

}


////function that keeps the site layout in tact on initilization and resize, handles all responsive layout parameters
function initilizeStage(){
 
  	windowWidth = $(window).innerWidth();
	if (windowWidth<1500){
handleWidth = (windowWidth*.05);
handles = 5;
	}else{
handleWidth = (windowWidth*.08);	
handles = 8;
	}
	
	contentWidth=windowWidth;
	
	positionPrevious = (contentWidth-(handleWidth))*-1;
	positionActive = (windowWidth-contentWidth)/2;
	positionNext = windowWidth-(handleWidth);
	
	visibleWidth = windowWidth-(handleWidth*2);
	spaceWidth = (windowWidth-contentWidth-(handleWidth*2))/-2;
	var lefthandle=handleWidth;
	var icwidth,icheight, txtholder, spacertop, spacer, spacertops, tpad,  bbtn, font, line,bg,topspacer,icspacer,txtspacer,favmainfnt,favmainl,icgw, vh, tfont, fw,nav,navfont,navmargin,cleft,imgwidth,cmid,cright;
	
if (windowWidth<1580){
	add = "-SM";
	icwidth = "390px";
	icheight = "105px";
	txtholder="465px";
	spacertop="100px";
	tpad = "4px";
	bbtn = "60px";
	font = "13px";
	line = "16px";
	bg = "450px";
	topspacer = '120px';
	icspacer = '120px';
	txtspacer = '260px';
	favmainfnt = '25px';
	favmainl = '35px';
	icgw = '108px';
	tfont = '32px';
	nav = '1000px';
	navfont = '14px';
	navmargin = '15px';
	$('#nextfav1').attr('src',"../Images/next_sm.png").css({'bottom':'-2px','padding-left':'20px'});
	$('#nextfav2').attr('src',"../Images/next_sm.png").css({'bottom':'-2px','padding-left':'20px'});
	$('#favmain').css('bottom','0px');
	vh = '270px'
	cleft = 550;
	imgwidth = 390;
	cmid = 45;
	cright = 450;
	}else{
	add = "";
	icwidth = "570px";
	icheight = "45%";
	txtholder="675px";
	spacertop="135px";
	spacertops="120px";
	tpad = "8px";
	bbtn = "60px";
	font = "16px";
	line = "20px";
	bg = "600px";
	topspacer = '190px';
	icspacer = '145px';
	txtspacer = '390px';
	favmainfnt = '30px';
	favmainl = '45px';
	tfont = '40px';
	icgw = '162px'
	vh = '410px'
	nav = '1240px';
	navfont = '15px';
	navmargin = '20px';
	cleft = 650;
	cright = 570;
	imgwidth = 490;
	cmid = 90;
	$('#nextfav1').attr('src',"../Images/next.png").css({'bottom':'-12px','padding-left':'100px'});
	$('#nextfav2').attr('src',"../Images/next.png").css({'bottom':'-12px','padding-left':'100px'});
	$('#favmain').css('bottom','15px');
	}
	////menuleft = contentWidth/3.679;
	////$('#menupointer').css('left',menuleft+'px');
	////var imgwidth = visibleWidth/3.179;
	////var cleft = visibleWidth/2.5;
	////var cright = visibleWidth/3.0;
	////var cmid = visibleWidth/13;
	var cont = visibleWidth/1.26;
	var tbl = visibleWidth/1.2;
	var arrow = visibleWidth/1.2;

	$('.ucimage').css('width',imgwidth+'px');
	$('.cleft').css('width',cleft+'px');
	$('.cright').css('width',cright+'px');
	$('.cmid').css('width',cmid+'px');
	$('.guide').css('width',(tbl)+'px');
	$('.guideimg').css('width',((tbl/2)-10)+'px');
	
	$('#favmain').css({'font-size':favmainfnt,'left':favmainl});
	$('.back-button-holder').css('top',bbtn);
	
	$('#end > .retention').css('height',$('#meet_compliance_needs > .retention').height());
	$('#end > .darkgraybg').css('height',$('#meet_compliance_needs > .darkgraybg').height());
	
	
	$('.back-button-holder').css('top',bbtn);
	
	
	////$('.oth').find('table').css('width',$('#firsttable').width()+'px');
	$('#navigation').css('width',nav);
	$('.tq').css('width',nav);
	$('#topmenu').css('width',nav);
	$( "#menut" ).find('h2').each(function( index ) {
	$(this).css('font-size',navfont);
	$(this).find('a').css('margin-right',navmargin);
	});
	
	
	$( ".icg" ).each(function( index ) {
	var thisimg = $(this).parent().parent().attr('rel');
	$(this).parent().css('width',icgw);
	$(this).css('width',icgw);
	$(this).css('height',icgw);
	$(this).css({'background-image':'url(../Images/buttons/'+thisimg+'-off'+add+'.png)','background-repeat':'no-repeat'});
	});
	
	$( ".icgon" ).each(function( index ) {
	var thisimg = $(this).find('a').attr('rel');
	$(this).parent().css('width',icgw);
	$(this).css('width',icgw);
	$(this).css('height',icgw);
	$(this).css({'background-image':'url(../Images/buttons/'+thisimg+'rollover'+add+'.png)','background-repeat':'no-repeat'});
	});
	
	$( ".ic" ).each(function( index ) {
	$(this).css({'background-image':'url(../Images/buttons/'+$(this).find('a').attr('rel')+'rollover'+add+'.png)','background-repeat':'no-repeat'});
	$(this).css({'background-image':'url(../Images/buttons/'+$(this).parent().parent().attr('rel')+'-off'+add+'.png)','background-repeat':'no-repeat'});
	});
	
	$( ".ic2" ).each(function( index ) {
	$(this).css({'background-image':'url(../Images/buttons/'+$(this).find('a').attr('rel')+'rollover'+add+'.png)','background-repeat':'no-repeat'});
	});
	
	$( ".mbg" ).each(function( index ) {
	var bgc = '#D1D2D4';
	if ($(this).attr('rel')=='2-getstarted'){
	bgc = '#0873BA';
	}else if ($(this).attr('rel')=='4-hr'){
	bgc = '#45C9F5';
	}else if ($(this).attr('rel')=='5-rd'){
	bgc = '#FCD804';
	}else if ($(this).attr('rel')=='6-sales'){
	bgc = '#BD1D8D';
	}else if ($(this).attr('rel')=='7-finance'){
	bgc = '#16a751';
	}else if ($(this).attr('rel')=='8-legal'){
	bgc = '#ffc315';
	}else if ($(this).attr('rel')=='3-it'){
	bgc = '#8EC642';
	}
	
	
	
	$(this).css({'background':'url(../Images/'+$(this).attr('rel')+add+'.png)','background-repeat':'no-repeat','background-position':'50% 0','background-color':bgc,'height':bg});
	////$(this).find(".icholder").css('width','570px');
	
	////alert(bg);
	});
	$(".icholder").css('width',icwidth);
	////$('.icholder > div').css('height', icspacer);
	$('.promo-block-2x1').css('height', icheight);
	$('.txtholder').css('width', txtholder);
	$('.txtholder > div').css('height', txtspacer);
	$('.txtholder > h2').css('font-size', tfont);
	$('#videomain').css({'width':txtholder,'height':vh});
	$('.spacertop').css('height', spacertop);
	$('.spacertops').css('width', spacertops);
	$('.promo-block-2x1 > .title').css({'padding':tpad,'font-size':font, 'line-height':line});
	
	
	
	
	
	if (currentpage===0){
	
	positionNext = contentWidth;
	
	lefthandle=0;
	////$("#start").css({"display":"inline", "width":handleWidth+"px"});
	////$("#start2").css({"display":"inline", "width":handleWidth+"px"});
	
	$("#homebutton").css({"display":"none"});
	$("#menupointer").css({"display":"none"});
	$("#leftshade").css({"width":"0%"});
	$("#rightshade").css({"width":"0%"});
	$(".icons").css({"display":"none"});
	$(".quote1").css({"display":"none"});
	$(".quote2").css({"display":"none"});
	$("#leftarrow").css({"width":"0%"});
	$("#rightarrow").css({"width":"0%"});
	


$( ".difftriangle" ).each(function( index ) {
	var startcolor = $(this).parent().parent().parent().parent().parent().parent().parent().parent().css('background-color');
	
	var darker = darkerColor(startcolor, 0.2);
	var darker2 = darkerColor(darker, 0.2);
	$(this).css('border-bottom-color', darker2);
	$(this).parent().find('.benefit').css('background-color', darker);
	
});

}else{
$("#leftshade").css({"width":handles+'%'});
	$("#rightshade").css({"width":handles+'%'});
	$("#leftarrow").css({"width":(handles/3)+'%',"left":(handles/3.5)+'%'});
	$("#rightarrow").css({"width":(handles/3)+'%',"right":(handles/3.5)+'%'});
}

setMenuActive(currentpage);
$("#end").css({"display":"inline", "width":handleWidth+"px"});
var addwidth=0;
positions=[];
	$( ".column_content" ).each(function( index ) {
	$(this).css({"left":addwidth+"px"});
	positions[index]=addwidth;
	lastdiv=index;
	if (index===0){
	addwidth+=contentWidth;
	}else{
	addwidth+=visibleWidth+0;
	}
	////console.log( index + ": " + addwidth);
});

	$(".column_content.active .contentstretch").css({"width":(visibleWidth+500)+"px"});
	
	$( ".bar" ).each(function( index ) {
	$(this).find('.contentstretch').css('height',($(this).height()+500)+'px');
	$(this).find('.colwrap').css('width',visibleWidth+'px');
	});
	
	$( ".diy" ).css('width',(visibleWidth+'px'));
	
	var height=$(".column_content.active").outerHeight(true);
	
	$("#main_wrapper").css({"height":(height+adjust)+"px"});
	var activeid = parseInt($('#main_wrapper .active').attr('rel'));
	var slide=handleWidth*2;
				if (activeid===0){
				slide=slide/2;
				}
$(".column_content").animate({'left' : '-='+(positions[activeid]-slide+spaceWidth)+'px'}, 1, function(){
					//// animation complete	
	$( ".column_content" ).each(function( index ) {
	positions[index]=parseInt($(this).css("left"));
});
	});

	$('.quotet').css('width',$('#firsttable').width()+'px');
$(".column_content.c_"+currentpage+" .footer .content").find('table').css('width',($(".column_content.c_"+currentpage).find('.mntable').width()-50)+'px');
settext();
}

function resizeWindow(){

	clearTimeout(resizeInterval);
	resizeInterval = setTimeout(function(){initilizeStage();}, 300);
	
}

////-----------------------------------------------------------------------------------------------
//// ---- scroll to anyting ------------------------------------------------------------------------
////-----------------------------------------------------------------------------------------------

function scrollToLocation(scrollTo, scrollToOffset, scrollspeed, onComplete){
	var destination = $(scrollTo).offset().top-scrollToOffset;
	var easing = 'easeInOutQuad';
	$("html:not(:animated),body:not(:animated)").animate({scrollTop: destination}, scrollspeed, easing, onComplete);
}


//// -----------------------------------------------------------------------------------------------
//// ---- init jquery stuff ------------------------------------------------------------------------
//// -----------------------------------------------------------------------------------------------

function settext(){
$('.rtext').each(function(){
var p=$(this).find('p');
var cont=$(this).find('.textcont');
//var pheight = $(p).outerHeight();
$(this).css('height','380px');
$(this).parent().find('.more').css('display','none');
if (started===false){
$(this).parent().find('.hide').html($(p).html());
}else{
$(p).html($(this).parent().find('.hide').html());
}

////console.log($(this).parent().parent().parent().parent().parent().parent().parent().attr('class'));

////console.log($(cont).outerHeight());
if ($(cont).outerHeight()>385) {
$(this).parent().find('.more').css('display','inline').attr('rel',$(cont).outerHeight()+'');

	while ($(cont).outerHeight()>385) {
    $(p).text(function (index, text) {
        return text.replace(/\W*\s(\S)*$/, '...');
    });
}
}
});
started=true;
}

	var pageSlideDuration = 1000;
	var easing = 'easeInOutCubic';
	
	

	

$(document).ready(function(){
	
	//// -------------------------------------------------------------------------------------------
	//// ---- all elements to their location -------------------------------------------------------
	//// -------------------------------------------------------------------------------------------
	
	initilizeStage();

	parseAnimation(startpage);

	
	function parseAnimation(rel){
	animoff=false;
			
			deeplink = false;
			var previousSlide = $('.column_content.previous'),
				activeSlide = $('.column_content.active'),
				nextSlide = $('.column_content.next'),
				previousMenuitem = $('#navigation li.previous'),
				activeMenuitem = $('#navigation li.active'),
				nextMenuitem = $('#navigation li.next');
			
			
		
    var thisid = parseInt(rel);
	
	console.log(thisid);

	
	

	
	////alert(thisid);
	var activeid = parseInt($('#main_wrapper .active').attr('rel'));
	var handle = handleWidth;
	
	
	
	////set icon link variables
	
	if (thisid!=activeid){
			if( !$('.column_content').is(':animated')) {
    $("html, body").animate({ scrollTop: 0 }, "fast");	
			
	currentpage=thisid;
	
	
    ////console.log(footer);
	$(".column_content.c_"+thisid+" .footer .content").html(footer);	
	$(".column_content.c_"+activeid+" .footer .content").html('');
	$(".column_content.c_"+thisid+" .footer .content").find('table').css('width',($(".column_content.c_"+thisid).find('.mntable').width()-50)+'px');
if(thisid === 0){
$(".arrowclick").fadeIn('slow');
$("#leftshade").animate({"width":"0%"}, pageSlideDuration, easing);
$("#rightshade").animate({"width":"0%"}, pageSlideDuration, easing, function(){
$("#start2").show();
});
$("#leftarrow").animate({"width":"0%"}, pageSlideDuration, easing);
$("#rightarrow").animate({"width":"0%"}, pageSlideDuration, easing);
$(".icons").fadeOut('slow');
$(".quote1").fadeOut('slow');

}else{

$(".column_content.c_"+thisid+" .icons").fadeIn('slow');
$(".column_content.c_"+thisid+" .quote1").fadeIn('slow');
$(".column_content.c_"+thisid+" .quote2").fadeIn('slow');
$(".column_content.c_"+activeid+" .icons").fadeOut('slow');
$(".column_content.c_"+activeid+" .quote1").fadeOut('slow');
$(".column_content.c_"+activeid+" .quote2").fadeOut('slow');
}

if (activeid === 0){

var lefthandle = handleWidth;
$(".arrowclick").fadeOut('slow');
////$("#leftshade").css({"width":lefthandle+"px"});
$("#leftshade").animate({"width":handles+'%'}, pageSlideDuration, easing);
$("#rightshade").animate({"width":handles+'%'}, pageSlideDuration, easing);
$("#leftarrow").animate({"width":(handles/3)+'%',"left":(handles/3.5)+'%'}, pageSlideDuration, easing);
$("#rightarrow").animate({"width":(handles/3)+'%',"right":(handles/3.5)+'%'}, pageSlideDuration, easing);
$("#start2").fadeOut('slow');
}


if (activeid == lastdiv&&thisid !== 0){
var righthandle = handleWidth;
$("#rightshade").animate({"width":handles+'%'}, pageSlideDuration, easing);
$("#rightarrow").animate({"width":(handles/3)+'%',"right":(handles/3.5)+'%'}, pageSlideDuration, easing);
}

		
		setMenuActive(thisid);
		$('#main_wrapper .active').removeClass('active');
		$('#main_wrapper .c-'+thisid).addClass('active');
			
				
				//// set state
				window.location.hash = '/'+$('.column_content.c_'+thisid).attr('id');
				
				
				//// content stretching
				////going forwards
				if (thisid!=activeid){
				easing = 'easeInOutCubic';
				last=activeid-1;
				next=activeid+1;

		
$(".column_content.c_"+thisid+" .contentstretch").animate({"left":0+"px", "width":visibleWidth+"px"}, pageSlideDuration, easing);
		
				//// animate previous to active
				//// animate next to active

				$('#navigation .m_'+next).find('span').animate({'opacity': '1'});
				var slide=handleWidth*2;
				if (thisid===0){
				slide=slide/2;
				}
				
				$(".column_content").animate({'left' : '-='+(positions[thisid]-slide+spaceWidth)+'px'}, pageSlideDuration, easing, function(){
					//// animation complete
	
			

					
	$( ".column_content" ).each(function( index ) {
	positions[index]=parseInt($(this).css("left"));
});
			$("#main_wrapper").css({"height":($(".column_content.c_"+thisid).outerHeight(true)+adjust)+"px"});
animoff=true;
				});
				
				$(".column_content.c_"+thisid).addClass('active');
			}
			}
			}
			if (insp){
			addPage((thisid+1)+"");
			}
	}
	
	
 function showPageElements(pageSelector){
        var counter=1;
        var elementCount= $(pageSelector).find('.hide-show').length;
        $(pageSelector).find('.hide-show').each(function(){
		if ($(this).hasClass('hidesec')===false){
            var el=$(this);
            var delay=counter*120;
            counter = counter<elementCount ? counter+1 : counter;
         fadeIn(el,delay,elementCount);
		 }
        });
    }

    setTimeout(function() {
        showPageElements('.page-homepage');    
    }, 1000);


   var fadeOutCounter=0;
    function fadeOut(element,delay,maxElements){
         fadeOutCounter=maxElements <fadeOutCounter ? 0 : fadeOutCounter;
         var cleft=parseInt(element.css('left'));
       element.stop(true,true,true).delay(delay).animate({
           'left':cleft-10,
           opacity:0
       },500,'linear',function(){
          
          fadeOutCounter++;
        
          if(fadeOutCounter==maxElements){
              $('body').trigger('closingFinished');
              fadeOutCounter=0;
          }
       });
    }
    var fadeInCounter=0;
    function fadeIn(element,delay,maxElements){
        fadeInCounter=maxElements <fadeInCounter ? 0 : fadeInCounter;
      element.removeClass('hidden').removeClass('invisible');
        element.css('left',0).css('opacity',0);
                             var antiEl=$('.current-page').find('.antiscroll-inner');
           antiEl.scrollLeft(0);
        
        var cleft=parseInt(element.css('left'));
        element.css('left',cleft+10);
       element.stop(true,true).delay(delay).animate({
           'left':cleft,
           opacity:1
       },500,'linear',function(){
            
           fadeInCounter++;
            if(fadeInCounter==maxElements){
                fadeInCounter=0;
              $('body').trigger('openingFinished')
          } 
       });
    }

	
	
	var favorites = checkFavorites();
	////get footer element for distribution to all pages
	var footer = $(".column_content.active .footer .content").html();
	
	////fill icons containers
	$( ".icons" ).each(function( index ) {
	    var htmlc = '<table><tr><td>';
	    if (favorites === null) {
	        htmlc += '<img style="cursor:pointer;" class="addfavorite" src="../Images/favorite_off.png"/>';
	    } else {
	        if ($.inArray($(this).parent().parent().parent().parent().parent().parent().parent().parent().parent().attr('rel'), favorites.split(',')) < 0) {
	            htmlc += '<img style="cursor:pointer;" class="addfavorite" src="../Images/favorite_off.png"/>';
	        } else {
	            htmlc += '<img style="cursor:pointer;" class="addfavorite favorited" src="../Images/favorited.png"/>';
	        }
	    }
	htmlc +='</td></tr><tr><td style="height:10px;"></td></tr><tr><td><img style="cursor:pointer;" class="sharemail" src="../Images/mail_off.png"/></td></tr><tr><td style="height:10px;"></td></tr><tr><td><img style="cursor:pointer;" class="sharelinkedin" src="../Images/linkedin_off.png"/></td></tr><tr><td style="height:10px;"></td></tr><tr><td><img style="cursor:pointer;" class="sharefacebook" src="../Images/facebook_off.png"/></td></tr><tr><td style="height:10px;"></td></tr><tr><td><img style="cursor:pointer;" class="sharetwitter" src="../Images/twitter_off.png"/></td></tr><tr><td style="height:10px;"></td></tr><tr><td><img style="cursor:pointer;" class="shareyammer" src="../Images/yammer_off.png"/></td></tr></table>';
	
	
	
	$(this).html(htmlc);
});
	

	//// -------------------------------------------------------------------------------------------
	//// ---- all expanding elements to parent height ----------------------------------------------
	////-------------------------------------------------------------------------------------------
	
	$(".contentstretch").each(function(key, value) {
		$(this).css({"height":$(this).parent().height()+"px"});
	});
	 
$('#rec').on({
click:function(e){
e.preventDefault();
$(this).removeClass('off').addClass('on').css('color','#444');;
$('#fav').removeClass('on').addClass('off').css('color','#999');;
$('#nextfav1').attr('rel','0');
checkRec(false);
showPageElements('#favholder');
},
mouseenter:function(){
$(this).css('color','#000')
},
mouseleave:function(){
if ($(this).hasClass('on')){
$(this).css('color','#444')
}else{
$(this).css('color','#999')
}
}
});

$('#fav').on({
click:function(e){
e.preventDefault();
checkFavorites();
$(this).removeClass('off').addClass('on').css('color','#444');
$('#rec').removeClass('on').addClass('off').css('color','#999');
$('#nextfav1').attr('rel','0');
showPageElements('#favholder');
},
mouseenter:function(){
$(this).css('color','#000')
},
mouseleave:function(){
if ($(this).hasClass('on')){
$(this).css('color','#444')
}else{
$(this).css('color','#999')
}
}
});

$('#nextfav1').click(function(e){
nextfav(parseInt($(this).attr('rel')),'#favholder','#nextfav1');
showPageElements('#favholder');
});

$('body').on({click:function(e){
nextfav(parseInt($('#nextfav2').attr('rel')),'#favholder2','#nextfav2');
showPageElements('#favholder2');
}
}, '#nextfav2');

	//// -------------------------------------------------------------------------------------------
	//// ---- goto next page -----------------------------------------------------------------------
	//// -------------------------------------------------------------------------------------------
	

	
	
$('body').on({
		click: function(event){
			event.preventDefault();
		////if (animoff){
			var element = $(this);
			console.log(element.attr('rel'));
			parseAnimation(element.attr('rel'));
			
////}
$('#menufloat').css('display','none');
	}	
	},'.flink');
		

		
	 $('body').on({
		click: function(event){
			event.preventDefault();
			var element = $(this);
			parseAnimation($(this).attr('rel'));
$('#menufloat').fadeOut;
	}		
	}, '.nav-link');	


	$('body').on({
		click: function(event){
			event.preventDefault();
			var element = $(this);
			parseAnimation($(this).attr('rel'));
$('#menufloat').fadeOut;
	},
mouseenter:function(){
$('#topmenu').html(makeTopMenu($(this).attr('rel')));
$('#menufloat').css({ 'display': 'inline' });
},
mouseleave:function(){
   //// $('#menufloat').css('display', 'none');
}	
	},'#navigation .menu-item');	
	
	
	$('#menufloat').on({
mouseenter:function(){
$(this).css('display','inline');
},
mouseleave:function(){
$(this).fadeOut();
}	
	});	
	
	
	//// -------------------------------------------------------------------------------------------
	//// ---- add side click triggers --------------------------------------------------------------
	////-------------------------------------------------------------------------------------------
	
	$(".ic").on({
		mouseenter: function(event){
			$(this).find('.title').hide();
			$(this).css({'background-image':'url("../Images/buttons/'+$(this).find("a").attr('rel')+'rollover'+add+'.png")','background-repeat':'no-repeat'});
		},
		mouseleave: function(event){
			$(this).find('.title').show();
			$(this).css({'background-image':'url(../Images/buttons/'+$(this).parent().parent().attr('rel')+'-off'+add+'.png)','background-repeat':'no-repeat'});
		}
	});
	
	$("body").on({
		mouseenter: function(event){
		var titleelement = $(this).find('.title');
		var id = titleelement.attr('rel');
		////var idarr = id.split('-');
			titleelement.show();
			$(this).css({'background-image':'url(../Images/buttons/'+getimageid(id)+'-off'+add+'.png)','background-repeat':'no-repeat'});
		},
		mouseleave: function(event){
		var titleelement = $(this).find('.title');
		var id = titleelement.attr('rel');
			titleelement.hide();
			$(this).css({'background-image':'url(../Images/buttons/'+id+'rollover'+add+'.png)','background-repeat':'no-repeat'});
		}
	}, '.hiddenf');
	
	$("#rightshade").on({
		click: function(event){
			event.preventDefault();
			deeplink = false;
			var cid = currentpage+1;
			var hidArr = parse(hidden);
			var finid;
	var found = false;	
	for (var i = cid; i <= 17; i++) {	
	if ($.inArray(i.toString(), hidArr)<0) {
	////console.log(i.toString()+" is good");
	cid=i;
	i=18;
	}
	////console.log(cid.toString()+" is good");
	found = true;
	}

	if (!found){
	////console.log("notfoundright");
	for (var j = 0; j <= 17; j++) {	
	if ($.inArray(j.toString(), hidArr)<0) {
	cid=j;
	j=18;
	}
	
	}}
			////console.log(cid.toString()+" is good");
			if(cid<=17){
			parseAnimation(cid);
			}else{
			parseAnimation(1);
			}
			
		}
	});
	
	$("#leftshade").on({
		click: function(event){
			event.preventDefault();

			deeplink = false;
			var cid = currentpage-1;
			var hidArr = parse(hidden);
			var found = false;		
	for (var i = cid; i > 0; i--) {
	
	if ($.inArray(i.toString(), hidArr) < 0) {
	console.log(i.toString()+"is good");
	cid=i;
	i=0;
	}
	
	found = true;
	
	}

	if (!found){
	console.log("notfoundleft");
	for (var j = 17; j > 0; j--) {
		
	if ($.inArray(i.toString(), hidArr) < 0) {
	cid=j;
	j=0;
	}
	}}
			
			if (cid===0){
			$("#navigation .m_0").trigger("click");
			}else{
			parseAnimation(cid);
			}
	
		}
	});
	
	$("#rightarrow").on({
		click: function(event){
			event.preventDefault();
			deeplink = false;
			var cid = currentpage+1;
			var hidArr = parse(hidden);
			
	var found = false;		
	for (var i = cid; i <= 17; i++) {		
	if ($.inArray(i.toString(), hidArr) < 0) {
    cid=i;
	found = true;
	}
	}

	if (!found){
	for (var i = 0; i <= 17; i++) {		
	if ($.inArray(i.toString(), hidArr) < 0) {
    cid=i;
	}
	}}
		
			if(cid<=17){
			parseAnimation(cid);
			}else{
			parseAnimation(1);
			}
		}
	});
	
	$("#leftarrow").on({
		click: function(event){
			event.preventDefault();
			deeplink = false;
			var cid = currentpage-1;
			
			var hidArr = parse(hidden);
			
	var found = false;		
	for (var i = cid; i >= 0; i--) {
	
	if ($.inArray(i.toString(), hidArr) < 0) {
    cid=i;
	found = true;
	}
	}

	if (!found){
	for (var i = 17; i >= 0; i--) {		
	if ($.inArray(i.toString(), hidArr) < 0) {
    cid=i;
	}
	}}
			
			if (cid===0){
			$("#navigation .m_0").trigger("click");
			}else{
			parseAnimation(cid);
			}
		}
	});
	
	$("body").on({
		click: function(event){
			event.preventDefault();
			deeplink = false;
			$("#navigation .m_0").trigger("click");
		}
	}, ".homebutton");
	
	$(".arrowclick").on({
		click: function(event){
			event.preventDefault();
			deeplink = false;
			var id=$(this).attr("id");
			$("#navigation .m-"+id).trigger("click");
		}
	});
	
	$("#exitcp").on({
		click: function(event){
			event.preventDefault();
			$("#control_panel").fadeOut(function(){
			$("#main_wrapper").css({"height":($(".column_content.active").outerHeight(true)+adjust)+"px"});
			});
		}
	});
	
	$(".guideimg").on({
		click: function(event){
			event.preventDefault();
			var id = $(this).attr('rel');
			var wd = $(window).innerWidth()*0.7;
			var ht = wd*0.5625;
			
			if (ht>$(window).innerHeight()){
			ht = $(window).innerHeight()*0.7;
			wd = ht*1.777777777777778;
			}
			
			modal.open({content: '<img style="width:'+wd+'px;height:'+ht+'px;" src="../Images/share_'+id+'.jpg"/>', type:'image'});
		}
	});
function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}	
	
var simple = [];
var simple2 = [];
var simple3 = [];
var simple4 = [];
var simple5 = [];
var multi = [];
var dates = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];	
var colors = ['#0D73BA','#8DC540','#49C8F4','#FDD700','#BC1E8C','#08A54F','#FEC215'];

for (var i = 0; i < dates.length; i++) {
    ////alert(myStringArray[i]);
    ////var color = "#" + Math.random().toString(16).slice(2, 8);
	
	simple.push([getRandomInt(5,80),dates[i],"#" + Math.random().toString(16).slice(2, 8)]);
	simple2.push([getRandomInt(5,80),dates[i],"#" + Math.random().toString(16).slice(2, 8)]);
	simple3.push([getRandomInt(5,80),dates[i],"#" + Math.random().toString(16).slice(2, 8)]);
	simple4.push([getRandomInt(5,80),dates[i],"#" + Math.random().toString(16).slice(2, 8)]);
	simple5.push([getRandomInt(5,80),dates[i],"#" + Math.random().toString(16).slice(2, 8)]);
}

for (var j = 0; j < dates.length; j++) {
    ////alert(myStringArray[i]);
    var color = "#" + Math.random().toString(16).slice(2, 8);
	var rand = []
	for (var k = 0; k < 7; k++) {
	rand.push(getRandomInt(20,120));
	}
	
	multi.push([rand,dates[i]]);
}
	
$(document).on({
    click: function(event){
        modal.close();
        approve();
        openconsole();
        event.preventDefault();
       
    }
    
		
	}, '#adminok');


function openconsole() {
    checkRec(true);
    showPageElements('#favholder2');
    $("#control_panel").fadeIn(function () {

        $("#main_wrapper").css({ "height": ($("#control_panel").outerHeight(true)-10) + "px" });
    });
    $("html, body").animate({ scrollTop: 0 }, "fast", function () {
        var inm = 0;
        $(window).scroll(function () {

            if ($(document).scrollTop() > 1500 && inm === 0) {
                inm = 1;

                $('#exampleSimple').html('');
                $('#exampleSimple').jqbargraph({
                    data: simple, width: 1240, height: 250
                });

            }
        });
    });
}

	$(document).on({
click:function(e){
e.preventDefault();
modal.close();	
}
	}, '#admincancel');
	
		$(document).on({
click:function(e){
e.preventDefault();
if ($(this).attr('title')=="Admin Console"){
openconsole();
}	
}
	}, '.ms-core-menu-link');
	
	
	$(document).on({
click:function(e){
e.preventDefault();
  modal.open({ content: '<div style="padding:15px;width:450px;height:205px;background:#fff;font-size:24px;font-family: \'Segoe UI Light\', Helvetica, Arial, sans-serif;"><div>In order to provide analytics informaton, we must gather and store usage data from users of this app. Do you allow Microsoft to gather app usage information from users of this sharepoint tenant?</div><div><input id="adminok" type="submit" value="Yes"><input id="admincancel" type="submit" value="No"></div></div>', type: 'image' });	
}
	}, '#settings');
	
$(document).on({
    click: function (e) {
        e.preventDefault();
        ////console.log('app=' + approved);
        if (approved!==0) {
            openconsole();
        } else {
            modal.open({ content: '<div style="padding:15px;width:450px;height:205px;background:#fff;font-size:24px;font-family: \'Segoe UI Light\', Helvetica, Arial, sans-serif;"><div>In order to provide analytics informaton, we must gather and store usage data from users of this app. Do you allow Microsoft to gather app usage information from users of this sharepoint tenant?</div><div><input id="adminok" type="submit" value="Yes"><input id="admincancel" type="submit" value="No"></div></div>', type: 'image' });
        }
    }
	}, '#admin');
	
	$(document).on({
click:function(e){
e.preventDefault();
$(this).attr('src', '../images/admin_invisible.png').removeClass('hidesec').addClass('showsec');
$(this).parent().parent().find('.recsec').attr('src', '../images/admin_unchecked_invisible.png');
var hidArr = parse(hidden);
var newhid = '';

if (hidArr.length>0){
 for (var i = 0; i < hidArr.length; i++) {
 if (i>0){
 newhid+=',';
 }
 newhid+=hidArr[i];
 }
newhid+=',';
newhid+=$(this).parent().parent().attr('rel');
 }else{
 newhid+=$(this).parent().parent().attr('rel');
 }
hidden=newhid;
////alert(hidden);
checkHidden();

}
	}, '.hidesec');
	

	
$(document).on({
click:function(e){
    e.preventDefault();
    
$(this).attr('src', '../images/admin_visible.png').removeClass('showsec').addClass('hidesec');
var hidArr = parse(hidden);
var recArr = parse(rec);


var rel = $(this).parent().parent().attr('rel');
var newhid = '';

if ($.inArray(rel, recArr) > -1) {
$(this).parent().parent().find('.recsec').attr('src', '../images/admin_checked.png');
}else{
$(this).parent().parent().find('.recsec').attr('src', '../images/admin_unchecked.png');
}

if ($.inArray(rel, hidArr) > -1) {
    var arrayspot = $.inArray(rel, hidArr);
    hidArr.splice(arrayspot, 1);
	
}

for (var i = 0; i < hidArr.length; i++) {
newhid+=hidArr[i];
if (i<hidArr.length-1){
newhid+=',';
}
}
hidden = newhid;
checkHidden();
}
	}, '.showsec');
		
		
$('select').change(function(){
var col = $(this).attr('id');
if (col==="analytics_type"){
loaddropdown($(this).find('option:selected').val())
}

var simpled = [];
//var data = getAnalytics(type, object, sorttype);

//console.log(data);

if ($("#analytics_months").find('option:selected').val()=='0'||col==="analytics_type"){
var dates = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
for (var i = 1; i < dates.length; i++) {
simpled.push([getRandomInt(1,25),dates[i],"#" + Math.random().toString(16).slice(2, 8)]);
}
}else{
for (var i = 1; i < 32; i++) {
simpled.push([getRandomInt(1,25),i+'',"#" + Math.random().toString(16).slice(2, 8)]);
}
}
$('#exampleSimple').html('');
$('#exampleSimple').jqbargraph({
  	 data: simpled , width: 1240, height:250
});
});
	
	
var arrayOfData = new Array(
  	 [24,'Jan','#222222'],
  	 [24,'Feb','#7D252B'],
  	 [456,'Mar','#EB9781'],
  	 [54,'Apr','#FFD2B5'],
  	 [65,'May','#4A4147'],
	 [85,'Jun','#222222'],
  	 [25,'Jul','#7D252B'],
  	 [879,'Aug','#EB9781'],
  	 [45,'Sep','#FFD2B5'],
  	 [56,'Oct','#4A4147'],
	 [53,'Nov','#FFD2B5'],
  	 [5,'Dec','#4A4147']
);


$('#exampleSimple').jqbargraph({
  	 data: arrayOfData , width: 1240, height:250
});
	
	
$(".sharemail").on({
		click: function(event){
			event.preventDefault();
			var id=$(this).parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().attr('rel');
			var element = $(this);
			//alert(id);
			shareURL('mail', id);
		},
		mouseenter: function(event){
			$(this).attr('src', '../Images/mail.png');
		},
		mouseleave: function(event){
			$(this).attr('src', '../Images/mail_off.png');
		}
	});
	
	$(".dlbutton").on({
		click: function(event){
			event.preventDefault();
			var id=$(this).attr('rel');
			var newheight = $("#"+id+" > div").height();
			if ($(this).hasClass('closed')){
			$(this).removeClass('closed').addClass('open');
			$("#"+id).animate({"height":newheight+"px"}, pageSlideDuration, easing, function(){
$("#main_wrapper").css({"height":($("#main_wrapper").height()+newheight)+"px"});
});
}else if ($(this).hasClass('open')){
$(this).removeClass('open').addClass('closed');
			$("#"+id).animate({"height":"0px"}, pageSlideDuration, easing, function(){
$("#main_wrapper").css({"height":($("#main_wrapper").height()-newheight)+"px"});
});
}

			
		}
	});
	
	
	
	$(".closeguide").on({
		click: function(event){
			event.preventDefault();
			var newheight = $(this).parent().parent().parent().parent().height();
////alert($(this).parent().parent().parent().parent().attr('rel'));
			$(this).parent().parent().parent().parent().animate({"height":0+"px"}, pageSlideDuration, easing, function(){
$("#main_wrapper").css({"height":($("#main_wrapper").height()-newheight)+"px"});
$(".dlbutton").removeClass('open').addClass('closed');
});
			
		}
	});
	
	$(".sharelinkedin").on({
		click: function(event){
			event.preventDefault();
			var id=$(this).parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().attr('rel');
			var element = $(this);
			shareURL('li', id);
		},
		mouseenter: function(event){
			$(this).attr('src', '../Images/linkedin.png');
		},
		mouseleave: function(event){
			$(this).attr('src', '../Images/linkedin_off.png');
		}
	});
	
	$(".sharefacebook").on({
		click: function(event){
			event.preventDefault();
			var id=$(this).parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().attr('rel');
			var element = $(this);
			shareURL('fb', id);
		},
		mouseenter: function(event){
			$(this).attr('src', '../Images/facebook.png');
		},
		mouseleave: function(event){
			$(this).attr('src', '../Images/facebook_off.png');
		}
	});
	
	$(".sharetwitter").on({
		click: function(event){
			event.preventDefault();
			var id=$(this).parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().attr('rel');
			var element = $(this);
			shareURL('twit', id);
		},
		mouseenter: function(event){
			$(this).attr('src', '../Images/twitter.png');
		},
		mouseleave: function(event){
			$(this).attr('src', '../Images/twitter_off.png');
		}
	});
	
	$(".shareyammer").on({
		click: function(event){
			event.preventDefault();
			var id=$(this).parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().attr('rel');
			var element = $(this);
			shareURL('yam', id);
		},
		mouseenter: function(event){
			$(this).attr('src', '../Images/yammer.png');
		},
		mouseleave: function(event){
			$(this).attr('src', '../Images/yammer_off.png');
		}
	});
	
	
	$(".addfavorite").on({
		click: function(event){
			event.preventDefault();
			var id=$(this).parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().attr('rel');
			////alert(id);
			if (!$(this).hasClass("favorited")){
			favorites = addFavorite(id, false);
			}else{
			favorites = addFavorite(id, true);
			}
			checkFavorites();
showPageElements('#favholder');
		},
		mouseenter: function(event){
		if (!$(this).hasClass("favorited")){
			$(this).attr('src', '../Images/favorite.png');
			}
		},
		mouseleave: function(event){
			if (!$(this).hasClass("favorited")){
			$(this).attr('src', '../Images/favorite_off.png');
			}
		}
	});
	
	$(".videolnk").on({
		click: function(event){
			event.preventDefault();
			var id=$(this).attr('rel');
			var wd = $(window).innerWidth()*0.7;
			var ht = wd*0.5625;
			var src=$(this).attr('id');
			var subid=$(this).parent().find('.im').attr('id');
			if (ht>$(window).innerHeight()){
			ht = $(window).innerHeight()*0.7;
			wd = ht*1.777777777777778;
			}

	
			////vidcount++;
			$('#vidplayer').attr('height',ht);
			$('#vidplayer').attr('width',wd);
			$('#vidplayer').attr('poster',$(this).parent().find('.im').attr('src'));
			$('#vidplayer').prepend(' <source class="source" src="'+src+'" type="video/mp4">');
			$('#vidplayer').prepend('<track src="../Videos/'+id+'cap.'+capext+'" label="English" class="track" kind="subtitles" srclang="en" />');
			////$('#vidplayer > track').attr('src','../Videos/'+id+'cap.vtt');
			modal.open({content: $('#videop').contents(), type:'vid'});
			$('#vidplayer').load();
			if (insp){
			addVideoView(id);
			}
			
			////'<video class="video-js vjs-default-skin" id="vid'+vidcount+'" width="'+wd+'" height="'+ht+'" preload="none" src="'+src+'" poster="'+$(this).parent().find('.im').attr('src')+'" controls data-setup="{}">Your browser does not support HTML5 Video.</video>'
			////$('.vid1')[0].play();
			
		},
		mouseenter: function(event){
			$(this).attr('src','../Images/playbtn_on.png');
		},
		mouseleave: function(event){
			$(this).attr('src','../Images/playbtn.png');
		}
	});
	
	
	$("body").on({
		click: function(event){
		    event.preventDefault();
			if ($(this).parent().parent().find(".hidesec").hasClass("hidesec")){
			if ($(this).hasClass('on')){
			var recArr = parse(rec);
	var relid = $(this).parent().parent().attr('rel');
	
	$(this).removeClass('on');
	var newrec = '';
	for (var i = 0; i < recArr.length; i++) {
	if (recArr[i]!=relid){
	newrec+=recArr[i]+',';
	}
	}
	rec=newrec.substring(0, newrec.length - 1);;
	
		        addRec();
		        checkRec(true);
				showPageElements('#favholder2');
		  
		}else{
		  if (rec != '') {
		        rec += ',';
		    }
			$(this).addClass('on');
		    rec += $(this).parent().parent().attr('rel');
		    if (insp) {
		        addRec();
		        checkRec(true);
				showPageElements('#favholder2');
		    }
			////var id=$(this).find('a').attr('rel');
			////favorites = addFavorite(id, false);
			////$(this).removeClass('icg').addClass('icgon');
		
		}
		}
		}
	}, ".recsec");
	
	$("body").on({
	click: function(event){
	var recArr = parse(rec);
	var relid = $(this).find('a').attr('rel');
	
	$(this).removeClass('icgon').addClass('icg');
	$(this).find('title').css('display','inline');
	var newrec = '';
	for (var i = 0; i < recArr.length; i++) {
	if (recArr[i]!=relid){
	newrec+=recArr[i]+',';
	}
	}
	rec=newrec.substring(0, newrec.length - 1);;
	
		        addRec();
		        checkRec(true);
				showPageElements('#favholder2');
	
		},
		mouseleave: function(event){
	var add='';
		if ($(window).innerWidth()<1580){
		 add='-SM'
		 }
		
			$(this).find('.title').hide()
			$(this).css({'background-image':'url("../Images/buttons/'+$(this).find('a').attr('rel')+'rollover'+add+'.png")','background-repeat':'no-repeat'});
		},
		mouseenter: function(event){
		var add='';
		if ($(window).innerWidth()<1580){
		 add='-SM'
		 }
		
			$(this).find('.title').show()
			$(this).css({'background-image':'url(../Images/buttons/'+$(this).parent().parent().attr('rel')+'-off'+add+'.png)','background-repeat':'no-repeat'});
		}
	}, ".icgon"); 
	
	$(document).on("click", ".feedback", function(e){
	e.preventDefault();
	showFeedback();
	});
	
	$(document).on("click", "#submitfeedback", function(e){
	e.preventDefault();
	var msg = $('textarea#fbmsg').val();
	if (msg.length<1){
	alert('Please Enter Feedback');
	}else{
	sendFeedback(msg);
	}
	});

	//// ---- scroll to position -------------------------------------------------------------------
	
	$("#main_wrapper").on({
		click: function (event){
			event.preventDefault();
			var scrollTarget = $(this).attr('rel');
			scrollToLocation("#"+scrollTarget, 0, 500, function(){}); //// scrollTo, scrollToOffset, scrollspeed, onComplete
		}
	}, '.scrollto');
	
	$(document).on("click", ".more", function(e){
	e.preventDefault();
	var mn = $(this);
	var elem = mn.parent().parent().parent().parent().parent();
	var ht = mn.find('.hide').html();
	 
	elem.find('.mntext').html(ht);
    ////$(this).fadeOut('fast');
	////$(this).removeClass('more').addClass('less');
	elem.find('.rtext').animate({ height:parseInt(mn.attr('rel')) }, "fast", function(){
	var add = '';
	if (elem.find('.mntext').hasClass('white')){
	add = '-white';
	}
	mn.find('.rtoggle').html('<img src="../Images/up'+add+'.png"/>&nbsp;&nbsp;Show less</div>');
	////elem.find('b').html('Show less');
	mn.removeClass('more').addClass('less');
	});
	});
	
	$(document).on("click", ".less", function(e){
			e.preventDefault();
			var mn = $(this);
			var elem = mn.parent().parent().parent().parent().parent();
			var p = elem.find('.rtext').find('p');
            var cont= elem.find('.rtext').find('.textcont');
	while ($(cont).outerHeight()>385) {
    $(p).text(function (index, text) {
        return text.replace(/\W*\s(\S)*$/, '...');
    });
}
elem.find('.rtext').animate({ height: 385 }, "fast", function(){
var add = '';
	if (p.hasClass('white')){
	add = '-white';
	}
			mn.find('.rtoggle').html('<img src="../Images/down'+add+'.png"/>&nbsp;&nbsp;Show more</div>');
			////elem.find('b').html('Show more');
			mn.removeClass('less').addClass('more');
			});
});
			
			
	
	$(document).on("click", ".dlbutton", function(){
	var url = $(this).attr('rel');
	window.open('../guides/'+url,'_blank');
	});
	
	$(document).on("click", ".dlbuttonm", function(){
	var url = $(this).attr('rel');
	window.open(url,'_blank');
	});
	
$(document).keydown(function(event){

	 if (event.which == 39) {
	 event.preventDefault();
     deeplink = false;
			var cid = currentpage+1;
			var hidArr = parse(hidden);
			var finid;
	var found = false;	
	for (var i = cid; i <= 17; i++) {	
	if ($.inArray(i.toString(), hidArr)<0) {
	////console.log(i.toString()+" is good");
	cid=i;
	i=18;
	}
	////console.log(cid.toString()+" is good");
	found = true;
	}

	if (!found){
	////console.log("notfoundright");
	for (var j = 0; j <= 17; j++) {	
	if ($.inArray(j.toString(), hidArr)<0) {
	cid=j;
	j=18;
	}
	
	}}
			////console.log(cid.toString()+" is good");
			if(cid<=17){
			parseAnimation(cid);
			}else{
			parseAnimation(1);
			}
   }else if (event.which == 37){
   event.preventDefault();
	
			deeplink = false;
			var cid = currentpage-1;
			var hidArr = parse(hidden);
			var found = false;		
	for (var i = cid; i > 0; i--) {
	
	if ($.inArray(i.toString(), hidArr) < 0) {
	console.log(i.toString()+"is good");
	cid=i;
	i=0;
	}
	
	found = true;
	
	}

	if (!found){
	console.log("notfoundleft");
	for (var j = 17; j > 0; j--) {
		
	if ($.inArray(i.toString(), hidArr) < 0) {
	cid=j;
	j=0;
	}
	}}
			
			if (cid===0){
			$("#navigation .m_0").trigger("click");
			}else{
			parseAnimation(cid);
			}
   }
	});


	//// -------------------------------------------------------------------------------------------
	//// ---- initialize windowresize --------------------------------------------------------------
	//// -------------------------------------------------------------------------------------------
		
	$(window).resize(function() {
		resizeWindow();
		
	}).resize();
	
	//// -------------------------------------------------------------------------------------------
	//// ---- initialize hashchange ----------------------------------------------------------------
	//// -------------------------------------------------------------------------------------------
	
	$(window).bind('hashchange', function() {
		getHash();
	});
	
	////getHash();
	
	/*
$('.mntext').each(function(){
$(this).attr('rel',''+$(this)[0].scrollHeight+'');
$(this).dotdotdot();
});
	*/
	
});

preload([
    '../Images/buttons/1rollover.png',
    '../Images/buttons/2rollover.png',
    '../Images/buttons/3rollover.png',
	'../Images/buttons/4rollover.png',
    '../Images/buttons/5rollover.png',
    '../Images/buttons/6rollover.png',
	 '../Images/buttons/7rollover.png',
	'../Images/buttons/8rollover.png',
    '../Images/buttons/9rollover.png',
    '../Images/buttons/10rollover.png',
	'../Images/buttons/11rollover.png',
    '../Images/buttons/12rollover.png',
    '../Images/buttons/13rollover.png',
	'../Images/buttons/14rollover.png',
    '../Images/buttons/15rollover.png',
    '../Images/buttons/16rollover.png',
	 '../Images/buttons/17rollover.png'
]);

function preload(arrayOfImages) {
    $(arrayOfImages).each(function(){
        $('<img/>')[0].src = this;
        //// Alternatively you could use:
        //// (new Image()).src = this;
    });
}

function loaddropdown(type) {

var hide = false;
var options;
if (type==="0"||type==="1"){
hide=true;
}else if (type==="2"){
options = '<option value="0">All Pages</option>'+
  '<optgroup label="Get Started">'+
  '<option value="1">Store, sync, and share your content</option>'+
  '<option value="2">Keep everyone on the same page</option>'+
  '<option value="3">Stay on track and deliver on time</option>'+
  '<option value="4">Find the right people</option>'+
  '<option value="5">Find what you need</option>'+
  '<option value="6">Make informed decisions</option>'+
  '</optgroup>'+
  '<optgroup label="HR & Internal Communications">'+
   '<option value="7">Onboard new employees</option>'+
   '<option value="8">Keep everyone informed</option>'+
   '</optgroup>'+
   '<optgroup label="R&D, Production, & Operations">'+
   '<option value="9">Share your knowledge</option>'+
   '<option value="10">Boost business processes</option>'+
   '</optgroup>'+
   '<optgroup label="Sales & Marketing">'+
   '<option value="11">Make your customers and partners happy</option>'+
   '<option value="12">Engage your audience online</option>'+
   '<option value="13">Align your teams</option>'+
   '</optgroup>'+
   '<optgroup label="Finance & Accounting">'+
   '<option value="14">Crunch the numbers together</option>'+
   '</optgroup>'+
   '<optgroup label="Legal">'+
   '<option value="15">Help meet compliance needs</option>'+
   '</optgroup>'+
   '<optgroup label="Information Technology">'+
   '<option value="16">Provide the right support</option>'+
   '<option value="17">Empower people and stay in control</option>'+
   '</optgroup>';
}else if (type==="3"||type==="4"){
options = '<option value="0">All Videos</option>'+
 '<optgroup label="Store, sync, and share your content">'+
  '<option value="1">Get started with SkyDrive Pro</option>'+
  '<option value="2">Work together at the same time</option>'+
  '<option value="3">Gather more feedback and new ideas</option>'+
  '</optgroup>'+
  '<optgroup label="Keep everyone on the same page">'+
   '<option value="4">Set up a site in a few simple clicks</option>'+
   '<option value="5">Take notes together from a single place</option>'+
   '<option value="6">Stay in sync and always up to date</option>'+
   '</optgroup>'+
   '<optgroup label="Stay on track and deliver on time">'+
   '<option value="7">Organize and assign tasks</option>'+
   '<option value="8">Take your project to the next level</option>'+
   '<option value="9">See all your tasks in a single view</option>'+
   '</optgroup>'+
   '<optgroup label="Find the right people">'+
   '<option value="10">Connect with people</option>'+
   '<option value="11">Connect with the communities around you</option>'+
   '<option value="12">Find experts and answers</option>'+
   '</optgroup>'+
   '<optgroup label="Find what you need">'+
   '<option value="13">Meet your organization’s search engine</option>'+
   '<option value="14">Discover experts and answers</option>'+
   '<option value="15">Search for multimedia content</option>'+
   '</optgroup>'+
   '<optgroup label="Make informed decisions">'+
   '<option value="16">Gain deeper insights</option>'+
   '<option value="17">Build a data model with PowerPivot</option>'+
   '<option value="18">Create a dashboard with Power View</option>'+
   '</optgroup>';
}else{
options = '<option value="0">All Guides</option>'+
  '<optgroup label="Get Started">'+
  '<option value="1">Store, sync, and share your content</option>'+
  '<option value="2">Keep everyone on the same page</option>'+
 ' <option value="3">Stay on track and deliver on time</option>'+
  '<option value="4">Find the right people</option>'+
 ' <option value="5">Find what you need</option>'+
  '<option value="6">Make informed decisions</option>'+
  '</optgroup>';
}

if (!hide){
$("#analytics_unit").show();
  $("#analytics_unit").html(options);
  }else{
  $("#analytics_unit").hide();
  }
}


function showFeedback(){
	modal.open({content: '<div style="background:#000;"><div style="color:#fff;padding:5px;">Submit Feedback</div><div style="padding:10px;"><textarea id="fbmsg" rows="8" cols="50"></textarea></div><div style="padding:5px;"><input id="submitfeedback" type="submit" value="Send Feedback"></div>', type:'html', width:400});
	}

(function() {
    var method;
    var noop = function noop() {};
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

        //// Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());


