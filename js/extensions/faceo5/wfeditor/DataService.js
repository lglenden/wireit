/**
 * A DataService is a subclass of WireIt's ImageContainer class that represents
 * a SORASCS data service while on the canvas (layer).  The major difference here
 * is that the DataService creates and repositions its terminals dynamically, unlike
 * a normal container in which the terminal information is passed into it and
 * constructed statically.
 * 
 * @class DataService
 * @namespace wfeditor
 * @extends WireIt.ImageContainer
 * 
 * @author Laura
 * 
 */

/**
 * Constructor.  Calls the parent class constructor and then builds the terminals.
 * 
 * @constructor
 * @param {Object} options Options for constructing the data service.
 * @param {WireIt.Layer} layer The layer on which the data service is being placed.
 */
wfeditor.DataService = function(options, layer) {
	// Call the parent class.
    wfeditor.DataService.superclass.constructor.call(this, options, layer);
    
    // Create the terminals
    this.createTerminals();
    
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

YAHOO.lang.extend(wfeditor.DataService, WireIt.ImageContainer, {
	
	/**
     * Sets the options for constructing this object, using defaults if none
     * are passed in.  For more information, see the superclass's setOptions
     * method and the properties of this class.
     * Overrides the parent class.
     * 
     * @method setOptions
     * @param {Object} options
     */
    setOptions: function(options) {
    	// Call the parent class.
        wfeditor.DataService.superclass.setOptions.call(this, options);
        
        // Input and output ports
        this.options.inputPorts = options.inputPorts;
        this.options.outputPorts = options.outputPorts;
        this.options.userServiceName = options.userServiceName;
        
        // Service URL.  Used to uniquely identify the service.
        this.options.url = options.url;
        
        // Set the xType so that this class will be called when loading a saved
        // workflow.
        this.options.xtype = "wfeditor.DataService";
        
        // The classname for the info button.
        this.options.infoClassName = options.infoClassName || "serviceInfo";
        
        // The image location for the info button.
        this.options.infoImgSrc = options.infoImgSrc || "../images/icons/help.png";
        
        // Whether the user can write to this data.  In other words, if it's an
        // input, this flag indicates whether it can also be used as an output.
        this.options.canWrite = (YAHOO.lang.isUndefined(options.canWrite)) ? false : options.canWrite;
        
        // Image locations.
        this.options.inputImg = options.inputImg || "../images/icons/database.png";
        this.options.outputImg = options.outputImg || "../images/icons/database_green.png";
        
        // Image locations for the switch images.
        this.options.inputSwitchImg = options.inputSwitchImg || "../images/icons/database_icon.png";
        this.options.outputSwitchImg = options.outputSwitchImg || "../images/icons/database_green_icon.png";
        
        // The classname for the switch button.
        this.options.switchClassName = options.switchClassName || "switch";
        
        // Figure out if it's an input or an output
        this.options.isInput = this.options.type == "source";
        
        // Read-only flag
        this.options.readOnly = (YAHOO.lang.isUndefined(options.readOnly)) ? false : options.readOnly;
        
        // Cylinder image class
        this.options.imageClassName = options.imageClassName || "cylinder";
    },

   /**
    * Instantiate the terminal from the class pointer "xtype."  We are overriding
    * this method from ImageContainer to create terminals of type TerminalExt by
    * default.
    * 
    * @method addTerminal
    * @return {WireIt.Terminal} terminal Created terminal
    */
    addTerminal: function(terminalConfig) {
    	// Set the terminal configuration's xtype to TerminalExt, if it hasn't
    	// been set already.
    	terminalConfig.xtype = terminalConfig.xtype || "WireIt.TerminalExt";
    	
    	// Call and return parent method.
    	return wfeditor.DataService.superclass.addTerminal.call(this, terminalConfig);
    },

    /**
     * This method is just a call to the "pseudo-static" createTerminals method.
     * 
     * @method createTerminals
     */
    createTerminals: function() {
		wfeditor.Service.createTerminals(this);
	},
	
	/**
     * This method is just a call to the "pseudo-static" positionTerminals method.
     * 
     * @method positionTerminals
     */
	positionTerminals: function() {
		var offset = 23;
		if(this.switchEl) {
			offset += 8;
		}
		wfeditor.Service.positionTerminals(this, null, null, offset);
	},
	
	/**
	 * Overrides ImageContainer's render method.  The main difference here is that
	 * we add the label of the data service.
	 * 
	 * @method render
	 */
	render: function() {
		// Don't call ImageContainer's render(), but do call Container's render()
		//wfeditor.DataService.superclass.render.call(this);
		WireIt.ImageContainer.superclass.render.call(this);	

		// Build and append image element		
		this.imgEl = WireIt.cn("img", {
			src: this.options.image,
			className: this.options.imageClassName}, null);
        this.bodyEl.appendChild(this.imgEl);
		
		// Build and append info element
        this.infoEl = WireIt.cn("img", {
            src: this.options.infoImgSrc,
            className: this.options.infoClassName,
            title: "Information for service '" + this.options.title + "'"
        });
        this.bodyEl.appendChild(this.infoEl);
        YAHOO.util.Event.addListener(this.infoEl, "click", this.onClickInfo, this, true);
		
        // Build and append switch element
        if(!this.options.readOnly && (!this.options.isInput || this.options.canWrite)) {
            this.switchEl = WireIt.cn("img", {
                className: this.options.switchClassName,
                title: "Click here to switch between input/output."
            });
            this.switchEl.src = this.options.isInput ?
                this.options.outputSwitchImg : this.options.inputSwitchImg;
            this.bodyEl.appendChild(this.switchEl);
            YAHOO.util.Event.addListener(this.switchEl, "click", this.onClickSwitch, this, true);
        }
		
		// Build label element
		this.labelEl = WireIt.cn('div', {className: 'DataService-Label'});
		this.labelSpan = WireIt.cn('span');
		
		// Set the title.
        wfeditor.util.setTitle(this);
        
		this.labelEl.appendChild(this.labelSpan);
		
		this._appendLabelEl();
	},
	
	/**
	 * This method appends the label either before or after the image element
	 * depending on if it's a source or a sink.
	 * 
	 * @method _appendLabelEl
	 */
	_appendLabelEl : function() {
		// Put it after the image for a sink, before for a source
        if(this.options.type == "sink") {
            this.el.appendChild(this.labelEl);
        } else {
            this.el.insertBefore(this.labelEl, this.bodyEl);
        }
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
     * service by the given multiplication factor.  It scales the image width and
     * the label font size, then repositions the terminals, and finally moves the
     * position.
     * 
     * @method rescale
     * @param {Number} mult The multiplication factor by which to rescale the service.
     * @param alsoMove {boolean || null} A flag to indicate whether the service should
     * also be moved when it is scaled.
     */
    rescale: function(mult, alsoMove) {
    	// Resize image element
        wfeditor.Service.scaleValue(this.imgEl, 'width', mult);
        // the height scales automatically!
        //wfeditor.Service.scaleValue(this.imgEl, 'height', mult);
        
        // Resize help icon
        wfeditor.Service.scaleValue(this.infoEl, 'width', mult);
        
        // Resize text label
        wfeditor.Service.scaleValue(this.labelSpan, 'font-size', mult);
        
        // reposition terminals
        this.positionTerminals();
        
        // Move position
        if(alsoMove == null || alsoMove) {
            wfeditor.Service.scaleValue(this.el, 'left', mult);
            wfeditor.Service.scaleValue(this.el, 'top', mult);
        }
    },
    
    /**
     * This method calls the pseudo-static onClickInfo function.
     * 
     * @method onClickInfo
     */
    onClickInfo : function() {
        wfeditor.Service.onClickInfo(this);
    },
    
    /**
     * This method is called when the user clicks the image to switch between a
     * source and a sink.
     * 
     * @method onClickSwitch
     */
    onClickSwitch : function() {
    	// input -> output
    	if(this.options.isInput) {
    		this.options.type = "sink";
    		this.imgEl.src = this.options.outputImg;
    		this.switchEl.src = this.options.inputSwitchImg;
            this.options.inputPorts = this.options.outputPorts.slice(0);
            this.options.outputPorts = [];
    		
        // output -> input
    	} else {
    		this.options.type = "source";
    		this.imgEl.src = this.options.inputImg;
    		this.switchEl.src = this.options.outputSwitchImg;
            this.options.outputPorts = this.options.inputPorts.slice(0);
            this.options.inputPorts = [];
    	}

        // switch flag
    	this.options.isInput = !this.options.isInput;
    	
    	// move label
    	this._appendLabelEl();
    	
    	// re-create terminals
    	this.removeAllTerminals();
    	this.createTerminals();
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
    }
});
