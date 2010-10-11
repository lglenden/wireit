/**
 * A MultiPortService is a subclass of WireIt's Container class that has multiple ports,
 * along with (+) and (-) icons to let the user add and remove ports.
 * 
 * @class MultiPortService
 * @namespace wfeditor
 * @extends WireIt.Container
 * 
 * @author Laura
 * 
 */

/**
 * Constructor.  Calls the parent class constructor and then builds the object.
 * 
 * @constructor
 * @param {Object} options Options for constructing the service.
 * @param {WireIt.Layer} layer The layer on which the service is being placed.
 */
wfeditor.MultiPortService = function(options, layer) {
	/**
	 * This property is an array of the terminals for the top (or left) ports.
	 * 
	 * @property topPorts
	 * @type {Array}
	 */
    this.topPorts = [];
    
    /**
     * This property is an array of the terminals for the bottom (or right) ports.
     * 
     * @property bottomPorts
     * @type {Array}
     */
    this.bottomPorts = [];
    
    // Call the parent class's constructor.
    wfeditor.MultiPortService.superclass.constructor.call(this, options, layer);
    
    // Set up move command.
    if(this.dd) {
        var that = this;
        this.dd.on("startDragEvent", function(ev) {
            wfeditor.util.onServiceStartDrag(that);
        });
        this.dd.on("dragDropEvent", function(ev) {
            wfeditor.util.onServiceDragDrop(that);
        });
    }
};

YAHOO.lang.extend(wfeditor.MultiPortService, WireIt.Container, {
    
    /**
     * This method overrides the parent class.  It sets configuration options while
     * building this object.
     * 
     * @method setOptions
     * @param {Object} options The configuration options.
     */
    setOptions : function(options) {
        // Set options
        options.resizable = false;
        
        // Call the parent class.
        wfeditor.MultiPortService.superclass.setOptions.call(this, options);
        
        /**
         * The options property has the following properties related to the ForkService
         * class:
         * - topBottom: whether the ports are on the top/bottom (true) or left/right (bottom).
         *              Defaults to true.
         * - nTopPorts and nBottomPorts: the (fixed) number of top (or left) ports and bottom
         *   (or right) ports.  Defaults to 1.
         * - minBottomPorts: the minimum number of bottom (or right) ports.  Defaults to 1.
         * - topType and bottomType: the type of the indicated ports.  Defaults to "anyType".
         * - topAllowedTypes and bottomAllowedTypes: the allowed types of the indicated ports.  Defaults to ["anyType"].
         * - addImg and removeImg: the images for the add and remove port buttons.  Defaults to
         *   "../images/add_port.png" and "../images/remove_port.png"
         * - addClass and removeClass: the classes for the add and remove prot buttons.  Defaults to
         *   "MultiPortService-Add" and "MultiPortService-Remove".
         * - type: the type that's passed in from the backend.  (No default.)
         * - selectedPortClass: the CSS class for selected ports.  (Defaults to "selectedPort".)
         * 
         * @property options
         * @type {Object}
         */
        
        this.options.className += " MultiPortService";
        
        this.options.topBottom = !YAHOO.lang.isUndefined(options.topBottom) ?
                                 options.topBottom : true;
                                 
        this.options.nTopPorts = !YAHOO.lang.isUndefined(options.nTopPorts) ?
                                 options.nTopPorts : 1;
        this.options.nBottomPorts = !YAHOO.lang.isUndefined(options.nBottomPorts) ?
                                    options.nBottomPorts : 1;
        this.options.minBottomPorts = !YAHOO.lang.isUndefined(options.minBottomPorts) ?
                                      options.minBottomPorts : 1;
        if(this.options.nBottomPorts < this.options.minBottomPorts) {
        	this.options.nBottomPorts = this.options.minBottomPorts;
        }
        
        this.options.height = 30;
        this.options.width = 80;
        if(this.options.topBottom) {
        	this.options.width += Math.max(this.options.nTopPorts, this.options.nBottomPorts) * 25;
        } else {
        	this.options.height += Math.max(this.options.nTopPorts, this.options.nBottomPorts) * 25;
        }
        
        this.options.topType = options.topType || "anyType";
        this.options.topAllowedTypes = options.topAllowedTypes || [ "anyType" ];
        
        this.options.bottomType = options.bottomType || "anyType";
        this.options.bottomAllowedTypes = options.bottomAllowedTypes || [ "anyType" ];
        
        this.options.addImg = options.addImg || "../images/add_port.png";
        this.options.removeImg = options.addImg || "../images/remove_port.png";
        
        this.options.addClass = options.addClass || "MultiPortService-Add";
        this.options.removeClass = options.removeClass || "MultiPortService-Remove";
        
        this.options.type = options.type;
        
        this.options.selectedPortClass = options.selectedPortClass || "selectedPort";
        this.options.userServiceName = options.userServiceName;
        
        this.options.readOnly = (YAHOO.lang.isUndefined(options.readOnly)) ? false : options.readOnly;
        
        // The classname for the info button.
        this.options.infoClassName = options.infoClassName || "serviceInfo";
        
        // The image location for the info button.
        this.options.infoImgSrc = options.infoImgSrc || "../images/icons/help.png";
    },
    
    /**
     * This method overrides the parent render method.  It adds a call to renderPorts.
     * 
     * @method render
     */
    render : function() {
        // Call the parent class.
        wfeditor.MultiPortService.superclass.render.call(this);
        wfeditor.util.setTitle(this);
        
        // Make info button
        this.infoEl = WireIt.cn("img", {
            src: this.options.infoImgSrc,
            className: this.options.infoClassName,
            title: "Information for service '" + this.options.title + "'"
        });
        this.bodyEl.appendChild(this.infoEl);
        YAHOO.util.Event.addListener(this.infoEl, "click", this.onClickInfo, this, true);

        if(!this.options.readOnly) {
            // Add add/remove images
            /**
             * This property is a reference to the "remove port" button, so that we can
             * show/hide it as needed.
             * 
             * @property removeImg
             * @type {HTMLImgElement}
             */
            this.removeImg = WireIt.cn("img",
                {src: this.options.removeImg, className: this.options.removeClass,
                title: "Click here to remove extraneous ports"},
                {display: "none"});
            this.bodyEl.appendChild(this.removeImg);
            YAHOO.util.Event.addListener(this.removeImg, "click", this.onRemovePort, this, true);
        
            var addImg = WireIt.cn("img", {src: this.options.addImg, className: this.options.addClass,
                title: "Click here to add more ports"});
            this.bodyEl.appendChild(addImg);
            YAHOO.util.Event.addListener(addImg, "click", this.onAddPort, this, true);
        }

        this.renderPorts();
    },
    
    /**
     * This method renders the initial ports based on this.options.nTopPorts and
     * this.options.nBottomPorts.
     * 
     * @method renderPorts
     */
    renderPorts : function() {    	
    	// Render top/left ports
    	for(var i = 0; i < this.options.nTopPorts; i++) {
    		this.topPorts.push(this.createPort("input[" + i + "]", true, this.options.readOnly));
    	}
    	
    	// Render bottom/right ports
    	for(var i = 0; i < this.options.nBottomPorts; i++) {
    		this.bottomPorts.push(this.createPort("output[" + i + "]", false, this.options.readOnly));
    	}
    	
    	// Position them correctly
    	this.repositionPorts();
    	this._showOrHideRemoveImg();
    },
    
    /**
     * This method is used to create and return a port terminal, given its properties.
     * 
     * @method createPort
     * @param {String} name The name of the terminal/port.
     * @param {boolean} isInput Whether it's an input or an output.
     * @param {boolean || null} nonEditable If true, makes the terminal non-editable.
     */
    createPort : function(name, isInput, nonEditable) {
    	var dir = [0, isInput ? -1 : 1];
    	if(!this.options.topBottom) {
    		dir[0] = isInput ? -1 : 1;
    		dir[1] = 0;
    	}
    	
    	var config = {
            name: name,
            direction: dir,
            ddConfig: {
                type: isInput ? this.options.topType : this.options.bottomType,
                allowedTypes: isInput ? this.options.topAllowedTypes : this.options.bottomAllowedTypes
            },
            editable: !nonEditable,
            xtype: "WireIt.TerminalExt"
        };
        
        if(!isInput) {
        	config.alwaysSrc = true;
        }
        
        term = this.addTerminal(config);
        
        var style = {position: "absolute"};
        if(isInput && this.options.topBottom) {
        	style.top = "-15px";
        } else if(isInput) {
            style.left = "-15px";
        } else if(!isInput && this.options.topBottom) {
        	style.bottom = "-55px"; // ??
        } else {
        	style.right = "-15px";
        }
        
        WireIt.sn(term.el, null, style);
        
        // Add listener to select ports
        if(!isInput) {
            YAHOO.util.Event.addListener(term.el, "click", this.onPortClick, this, true);
        }
        
        return term;
    },
    
    /**
     * This method repositions the position of the top and bottom ports based on
     * the current height and width and number of ports.
     * 
     * @method repositionPorts
     */
    repositionPorts : function() {
    	var width = this.el.style.width, height = this.el.style.height;
    	width = width.substr(0, width.length - 2);
    	height = height.substr(0, height.length - 2);
    	
    	var n = this.topPorts.length;
    	var interval = this.options.topBottom ?
    	               Math.floor(width / (n + 1)) : Math.floor(height / (n + 1));
    	               
    	var val;
    	var tem;
    	for(var i = 0; i < n; i++) {
    		val = interval * (i + 1);
    		if(this.options.topBottom) {
    			val -= 15;
    		} else {
    			val += 5;
    		}
    		
    		term = this.topPorts[i];
    		YAHOO.util.Dom.setStyle(term.el, this.options.topBottom ? "left" : "top", val + "px");
        
            for(var j = 0; j < term.wires.length; j++) {
            	term.wires[j].redraw();
            }
    	}
    	
    	n = this.bottomPorts.length;
    	interval = this.options.topBottom ?
                   Math.floor(width / (n + 1)) : Math.floor(height / (n + 1));
        
        for(var i = 0; i < n; i++) {
            val = interval * (i + 1);
            if(this.options.topBottom) {
                val -= 15;
            } else {
                val += 5;
            }
            
            term = this.bottomPorts[i];
            YAHOO.util.Dom.setStyle(term.el, this.options.topBottom ? "left" : "top", val + "px");
            
            for(var j = 0; j < term.wires.length; j++) {
                term.wires[j].redraw();
            }
        }
    },
    
    /**
     * This method is the listener for when the user clicks the add port button.
     * It adds a new port to the service.
     * 
     * @method onAddPort
     * @param {Boolean || null} holdEvent Whether to hold the undo/redo event or not.
     */
    onAddPort : function(holdEvent) {
    	// Make the service bigger
    	if(this.options.topBottom) {
    		this.options.width += 25;
    		this.el.style.width = this.options.width + "px";
    	} else {
    		this.options.height += 30;
    		this.el.style.height = this.options.height + "px";
    	}
    	
    	// Add the new port
    	var index = this.bottomPorts.length;
    	this.bottomPorts.push(this.createPort("output[" + index + "]", false, this.options.readOnly));
    	this.options.nBottomPorts++;
    	this.repositionPorts();
    	
    	this._showOrHideRemoveImg();
    	
    	// Send to undo/redo event system
    	if(!YAHOO.lang.isBoolean(holdEvent) || !holdEvent) {
            var command = new wfeditor.command.CommandChangeDynamicPorts(this, true);
            editor.getCommandStack().execute(command);
            
            // Trigger the layer's "changed" event so that the workflow is marked as unsaved
            if(this.layer) {
                this.layer.eventChanged.fire(this.layer);
            }
    	}
    },
    
    /**
     * This method is the listener for when the user clicks the remove port button.
     * It removes the first un-connected port on the service.
     * 
     * @method onRemovePort
     * @param {Boolean || null} holdEvent Whether to hold the undo/redo event or not.
     */
    onRemovePort : function(holdEvent) {
    	// Find the port to remove -- first check if any have been selected
    	var term;
    	var index = 0;
    	for(; index < this.bottomPorts.length; index++) {
    		term = this.bottomPorts[index];
    		if(YAHOO.util.Dom.hasClass(term.el, this.options.selectedPortClass)) {
                break;
    		}
    	}
    	
    	// If no ports were selected, we need to find the port to remove --
    	// the first unconnected one
    	if(index == this.bottomPorts.length) {
    	   for(index = 0; index < this.bottomPorts.length; index++) {
    		  if(this.bottomPorts[index].wires.length == 0) {
    			 break;
    		  }
    	   }
    	}
    	
    	// Remove the port
    	term = this.bottomPorts[index];
    	this.options.nBottomPorts--;
    	this.bottomPorts.splice(index, 1);
    	for(var i = 0; i < this.terminals.length; i++) {
    		if(this.terminals[i] == term) {
    			this.terminals.splice(i, 1);
    			break;
    		}
    	}
    	term.remove();
    	
    	// Make the service smaller
        if(this.options.topBottom) {
            this.options.width -= 25;
            this.el.style.width = this.options.width + "px";
        } else {
            this.options.height -= 30;
            this.el.style.height = this.options.height + "px";
        }
        
        // Add the new port
        this.repositionPorts();
        this._showOrHideRemoveImg();
        
        // Send to undo/redo event system
        if(!YAHOO.lang.isBoolean(holdEvent) || !holdEvent) {
            var command = new wfeditor.command.CommandChangeDynamicPorts(this, false);
            editor.getCommandStack().execute(command);
            
            // Trigger the layer's "changed" event so that the workflow is marked as unsaved
            if(this.layer) {
            	this.layer.eventChanged.fire(this.layer);
            }
        }
    },
    
    /**
     * This method overrides the parent method.  It adds the number of top and
     * bottom ports to the configuration object.
     * 
     * @method getConfig
     * @returns {Object} The configuration object.
     */
    getConfig : function() {
    	// Call the parent class.
        var config = wfeditor.MultiPortService.superclass.getConfig.call(this);
        
        // Add our own.
        config.nTopPorts = this.options.nTopPorts;
        config.nBottomPorts = this.options.nBottomPorts;
        
        return config;
    },
    
    /**
     * This method overrides the parent.  It hides or shows the "remove port" button
     * as needed.
     * 
     * @method onAddWire
     */
    onAddWire : function(event, args) {    	
    	// Call the parent class.
        wfeditor.MultiPortService.superclass.onAddWire.call(this, event, args);
        
        this._showOrHideRemoveImg();
    },
    
    /**
     * This method overrides the parent.  It hides or shows the "remove port" button
     * as needed.
     * 
     * @method onRemoveWire
     */
    onRemoveWire : function(event, args) {     
        // Call the parent class.
        wfeditor.MultiPortService.superclass.onRemoveWire.call(this, event, args);
        
        this._showOrHideRemoveImg();
    },
    
    /**
     * This method shows or hides the "remove port" button based on how many ports there
     * are and whether they're filled in or not.
     * 
     * @method _showOrHideRemoveImg
     */
    _showOrHideRemoveImg : function() {
    	// Don't do this if we're in read only mode
    	if(this.options.readOnly) {
    		return;
    	}
    	
    	// Hide if we've reach the minimum number of bottom ports
    	if(this.bottomPorts.length == this.options.minBottomPorts) {
    		this.removeImg.style.display = "none";
    		this.clearPortSelection();
    		return;
    	}
    	
    	// If at least one of the bottom ports are unfilled, show the (-) icon...
        for(var i = 0; i < this.bottomPorts.length; i++) {
            if(this.bottomPorts[i].wires.length == 0) {
                this.removeImg.style.display = "";
                return;
            }
        }
        
        // ..otherwise, hide it.
        this.removeImg.style.display = "none";
        this.clearPortSelection();
    },
    
    /**
     * This method is just a call to the "pseudo-static" setScale method.
     * 
     * @method setScale
     * @param {real} scaleFactor The scale factor.
     * @param alsoMove {boolean || null} A flag to indicate whether the service should
     * also be moved when it is scaled.
     */
    setScale: function(scaleFactor, alsoMove) {
        wfeditor.Service.setScale(this, scaleFactor, alsoMove);
    },
    
    /**
     * This method is called by the "setScale" method to actually rescale this
     * service by the given multiplication factor.  It scales the element width,
     * body height and font size, drag-and-drop handle's height and font size,
     * repositions the terminals, and finally moves the position on the canvas.
     * 
     * @method rescale
     * @param {Number} mult The multiplication factor by which to rescale the service.
     * @param alsoMove {boolean || null} A flag to indicate whether the service should
     * also be moved when it is scaled.
     */
    rescale: function(mult, alsoMove) {
    	// Resize body
        wfeditor.Service.scaleValue(this.el, 'width', mult);
        
        // Resize ddhandle
        wfeditor.Service.scaleValue(this.ddHandle, 'font-size', mult);
        wfeditor.Service.scaleValue(this.ddHandle, 'height', mult);
        
        // Resize icon
        if(!this.imgEl) {
            /**
             * This property keeps a reference to the service's icon element.
             * 
             * @property imgEl
             * @type {HTMLElement}
             */
            this.imgEl = YAHOO.util.Dom.getElementBy(function(node) {
                return true;
                }, "img", this.ddHandle);
        }
        wfeditor.Service.scaleValue(this.imgEl, 'width', mult);
        
        // Reposition terminals
        this.repositionPorts();
        
        // Move position
        if(alsoMove == null || alsoMove) {   
            wfeditor.Service.scaleValue(this.el, 'left', mult);
            wfeditor.Service.scaleValue(this.el, 'top', mult);
        }
    },
    
    /**
     * This method catches the event when the user clicks on a port.  It highlights
     * the clicked port so that it can be deleted.
     * 
     * @method onPortClick
     * @param {Object} event The event object.
     */
    onPortClick : function(event) {
    	// Only select if delete button is visible
    	if(this.removeImg.style.display == "none") {
    		return;
    	}
    	
    	var el = event.target;
    	if(YAHOO.lang.isUndefined(el)) {
    		el = event.srcElement; // why, IE, why??
    	}
    	
    	if(YAHOO.util.Dom.hasClass(el, this.options.selectedPortClass)) {
    		YAHOO.util.Dom.removeClass(el, this.options.selectedPortClass);
    	} else {
    		// Only allow one selection at a time
    		YAHOO.util.Dom.addClass(el, this.options.selectedPortClass);
    		this.clearPortSelection(el);
    	}
    },
    
    /**
     * This method clears the selected ports on the container.  If an "exceptForEl" is
     * given, that one is not cleared.
     * 
     * @method clearPortSelection
     * @param {HTMLElement || null} exceptForEl Element to exclude (optional).
     */
    clearPortSelection : function(exceptForEl) {
    	var e;
        for(var i = 0; i < this.bottomPorts.length; i++) {
            e = this.bottomPorts[i].el;
            if(!exceptForEl || e != exceptForEl) {
            	YAHOO.util.Dom.removeClass(e, this.options.selectedPortClass);
            }
        }
    },
    
    /**
     * This method overrides the parent to use the command to remove the service.
     * 
     * @method onCloseButton
     * @param {Object} e See Container.onCloseButton.
     * @param {Array} args See Container.onCloseButton.
     */
    onCloseButton: function(e, args) {
        wfeditor.util.onServiceCloseButton(this, e, args);
    },
    
    /**
     * This method calls the pseudo-static onClickInfo function.
     * 
     * @method onClickInfo
     */
    onClickInfo : function() {
        wfeditor.Service.onClickInfo(this);
    }
});
