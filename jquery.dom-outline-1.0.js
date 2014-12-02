/**
 * Firebug/Web Inspector Outline Implementation using jQuery
 * Tested to work in Chrome, FF, Safari. Buggy in IE ;(
 * Andrew Childs <ac@glomerate.com>
 *
 * Example Setup:
 * var myClickHandler = function (element) { console.log('Clicked element:', element); }
 * var myDomOutline = DomOutline({ onClick: myClickHandler, filter: '.debug' });
 *
 * Public API:
 * myDomOutline.start();
 * myDomOutline.stop();
 */
var DomOutline = function(options) {
    options = options || {};

    var pub = {};
    var self = {
        opts: {
            namespace: options.namespace || 'DomOutline',
            borderWidth: options.borderWidth || 2,
            onClick: options.onClick || false,
            filter: options.filter || false,
            border: options.border || false,
            realtime: options.realtime || false,
            label: options.label || false,
            multiple: options.multiple || false,
            // onSelect: options.onSelect || false,
            // onCancel: options.onCancel || false
        },
        keyCodes: {
            // BACKSPACE: 8,
            // ESC: 27,
            // DELETE: 46
        },
        active: false,
        initialized: false,
        element: {},
        elements: new Array()
    };

    function writeStylesheet(css) {
        var element = document.createElement('style');
        element.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(element);

        if (element.styleSheet) {
            element.styleSheet.cssText = css; // IE
        } else {
            element.innerHTML = css; // Non-IE
        }
    }

    function initStylesheet() {
        if (self.initialized !== true) {
            var css = '' +
                '.' + self.opts.namespace + ' {' +
                '    background: #09c;' +
                '    position: absolute;' +
                '    z-index: 999;' +
                '    pointer-events: none;' +
                '}' +
				'.' + self.opts.namespace + '_selected {' +
                '    background: red;' +
                '    position: absolute;' +
                '    z-index: 1000;' +
                '    pointer-events: none;' +
                '}' +
                '.' + self.opts.namespace + '_hidden {' +
                '    display: none;' +
                '}' +
                '.' + self.opts.namespace + '_label {' +
                '    background: #09c;' +
                '    border-radius: 2px;' +
                '    color: #fff;' +
                '    font: bold 12px/12px Helvetica, sans-serif;' +
                '    padding: 4px 6px;' +
                '    position: absolute;' +
                '    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.25);' +
                '    z-index: 1001;' +
                '    pointer-events: none;' +
                '}' +
                '.' + self.opts.namespace + '_box {' +
                '    background: rgba(0, 153, 204, 0.5);' +
                '    position: absolute;' +
                '    z-index: 999;' +
                '    pointer-events: none;' +
                '}';

            writeStylesheet(css);
            self.initialized = true;
        }
    }

    function createOutlineElements(selected) {
        var element = {};
        if (selected) {
	        element.label = jQuery('<div></div>').addClass(self.opts.namespace + '_label').appendTo('body');
	        element.top = jQuery('<div></div>').addClass(self.opts.namespace + '_selected').appendTo('body');
	        element.bottom = jQuery('<div></div>').addClass(self.opts.namespace + '_selected').appendTo('body');
	        element.left = jQuery('<div></div>').addClass(self.opts.namespace + '_selected').appendTo('body');
	        element.right = jQuery('<div></div>').addClass(self.opts.namespace + '_selected').appendTo('body');
        } else {
	        element.label = jQuery('<div></div>').addClass(self.opts.namespace + '_label').appendTo('body');
	        element.top = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
	        element.bottom = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
	        element.left = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
	        element.right = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
        }

        element.box = jQuery('<div>').addClass(self.opts.namespace + '_box').appendTo('body');

        return element;
    }

    function removeOutlineElements(element) {
        jQuery.each(element, function(name, value) {
            if (name != "target") {
                value.remove();
            }
        });
    }

    function removeAllOutlineElements() {
        var element = self.element;
        while (element != null) {
            removeOutlineElements(element);
            element = self.elements.pop();
        }
    }

    function compileLabelText(element, width, height) {
        var label = element.tagName.toLowerCase();
        if (element.id) {
            label += '#' + element.id;
        }
        if (element.className) {
            label += ('.' + jQuery.trim(element.className).replace(/ /g, '.')).replace(/\.\.+/g, '.');
        }
        return label + ' (' + Math.round(width) + 'x' + Math.round(height) + ')';
    }

    function getScrollTop() {
        if (!self.window) {
            self.window = jQuery(window);
        }
        return self.window.scrollTop();
    }

    function updateOutlinePositions(target, element) {
    	if (!target) {
    		return;
    	}

    	if (target == pub.element) {
    		if ($(target).closest("[DomOutline-selected]").length != 0) {
    			element.top.css({"display":"none"});
    			element.bottom.css({"display":"none"});
    			element.left.css({"display":"none"});
    			element.right.css({"display":"none"});
    			element.box.css({"display":"none"});
    			return;
    		} else {
    			element.top.css({"display":"block"});
    			element.bottom.css({"display":"block"});
    			element.left.css({"display":"block"});
    			element.right.css({"display":"block"});
    			element.box.css({"display":"block"});
	    	}
    	}

        var b = self.opts.borderWidth;
        var scroll_top = getScrollTop();
        var pos = target.getBoundingClientRect();
        var top = pos.top + scroll_top;
        var label_text = '';
        var label_top = 0;
        var label_left = 0;

        label_text = compileLabelText(target, pos.width, pos.height);
        target.label = label_text;
        if (self.opts.label) {
            label_top = Math.max(0, top - 20 - b, scroll_top);
            label_left = Math.max(0, pos.left - b);
            element.label.css({
                top: label_top,
                left: label_left
            }).text(label_text);
        }

        if (self.opts.border) {
            element.top.css({
                top: Math.max(0, top - b),
                left: pos.left - b,
                width: pos.width + b,
                height: b
            });
            element.bottom.css({
                top: top + pos.height,
                left: pos.left - b,
                width: pos.width + b,
                height: b
            });
            element.left.css({
                top: top - b,
                left: Math.max(0, pos.left - b),
                width: b,
                height: pos.height + b
            });
            element.right.css({
                top: top - b,
                left: pos.left + pos.width,
                width: b,
                height: pos.height + (b * 2)
            });
        } else {
            element.box.css({
                top: pos.top,
                left: pos.left,
                width: pos.width,
                height: pos.height
            });
        }
    }

    function updateAllOutlinePositions(e) {
        if (e.type != 'resize') {
            if (e.target.className && e.target.className.indexOf(self.opts.namespace) !== -1) {
                return;
            }
            if (self.opts.filter) {
                if (!jQuery(e.target).is(self.opts.filter)) {
                    return;
                }
            }
            pub.element = e.target;
            updateOutlinePositions(pub.element, self.element);
        } else {
            if (pub.element) {
                updateOutlinePositions(pub.element, self.element);
            }
            for (var i in self.elements) {
                updateOutlinePositions(self.elements[i].target, self.elements[i]);
            }
        }
    }

    function stopOnEscape(e) {
        if (e.keyCode === self.keyCodes.ESC || e.keyCode === self.keyCodes.BACKSPACE || e.keyCode === self.keyCodes.DELETE) {
            pub.stop();
        }

        return false;
    }

    function clickHandler(e) {
        if (self.opts.filter) {
            if (!jQuery(pub.element).is(self.opts.filter)) {
                return false;
            }
        }

        if (!self.opts.realtime) {
            updateOutlinePositions(pub.element, self.element);
        }

        if (self.opts.multiple) {
        	var target = e.target;
        	var closest = $(target);
        	if (closest.attr("DomOutline-selected") == undefined) {
        		closest = $(target).closest("[DomOutline-selected]");
        	}
        	if (!closest.attr("DomOutline-selected")) {
        		$(target).find("[DomOutline-selected]").each(function() {
        			for (var i in self.elements) {
        				if (this == self.elements[i].target) {
        					removeOutlineElements(self.elements[i]);
        					self.elements.splice(i, 1);
        					$(this).removeAttr("DomOutline-selected");
        					break;
        				}
        			}
        		});
	            element = createOutlineElements(true);
	            element.target = target;
	            self.elements.push(element);
	            updateOutlinePositions(target, element);
	            $(e.target).attr("DomOutline-selected", true);
	        } else {
    			for (var i in self.elements) {
    				if (closest[0] == self.elements[i].target) {
    					removeOutlineElements(self.elements[i]);
    					self.elements.splice(i, 1);
    					closest.removeAttr("DomOutline-selected");
    					break;
    				}
    			} 
	        }
        }

        self.opts.onClick.call(pub.element, e);

        return false;
    }

    pub.start = function() {
        initStylesheet();
        if (self.active !== true) {
            self.active = true;
            self.element = createOutlineElements(false);
            if (self.opts.realtime) {
                jQuery('body').on('mousemove.' + self.opts.namespace, updateAllOutlinePositions);
            }
            jQuery(window).on('resize.' + self.opts.namespace, updateAllOutlinePositions);
            jQuery('body').on('keyup.' + self.opts.namespace, stopOnEscape);
            if (self.opts.onClick) {
                setTimeout(function() {
                    jQuery('body').on('click.' + self.opts.namespace, function(e) {
                        if (self.opts.filter) {
                            if (!jQuery(e.target).is(self.opts.filter)) {
                                return false;
                            }
                        }
                        clickHandler.call(this, e);
                    });
                }, 50);
            }
        }
    };

    pub.stop = function() {
        self.active = false;
        removeAllOutlineElements();
        jQuery('body').off('mousemove.' + self.opts.namespace)
            .off('keyup.' + self.opts.namespace)
            .off('click.' + self.opts.namespace);
        jQuery(window).off('resize.' + self.opts.namespace);
    };

    return pub;
};
