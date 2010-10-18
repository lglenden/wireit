/**
 * A Service is a subclass of WireIt's FormContainer class that represents a
 * SORASCS service while on the canvas (layer).  The major difference here
 * is that the DataService creates and repositions its terminals dynamically, unlike
 * a normal container in which the terminal information is passed into it and
 * constructed statically.  Wireable properties fields will probably also happen
 * in this class.
 * 
 * @class Service
 * @namespace wfeditor
 * @extends WireIt.FormContainer
 * 
 * @author Laura
 * 
 */

/**
 * Constructor.  Calls the parent class constructor, builds the terminals, and
 * finally builds the animator used for the execution progress.
 * 
 * @constructor
 * @param {Object} options Options for constructing the service.
 * @param {WireIt.Layer} layer The layer on which the service is being placed.
 */
wfeditor.Service = function(options, layer) {
	/**
	 * This property holds all the terminals that are for wireable fields (parameters) for the
	 * service.
	 * 
	 * @property fieldTerminals
	 * @type {Array}
	 */
	this.fieldTerminals = [];
	
    // Call the parent class's constructor.
    wfeditor.Service.superclass.constructor.call(this, options, layer);

    // Create the terminals.
    this.createTerminals();

	// The form that will be displayed in the right column.
	this.containerForm = null;
    
    // Build the animator.
    /**
     * This property is a YUI animator that is used to highlight this servive during
     * the execution progress.
     * 
     * @property {YAHOO.util.ColorAnim} animator
     */
    this.animator = new YAHOO.util.ColorAnim(this.bodyEl, {
        backgroundColor: { to: this.options.animateTo }
    });
    this.animator.el = this.bodyEl;
    this.animator.animateTo = this.options.animateTo;
    this.animator.animateFrom = this.options.animateFrom;
    this.animator.onComplete.subscribe(function() {
        if(this.stopAnimating) {
            WireIt.sn(this.el, {}, {backgroundColor: this.animateFrom});
        } else {
           this.attributes.backgroundColor.to =
               (this.attributes.backgroundColor.to == this.animateTo) ?
               this.animateFrom : this.animateTo; 
           this.animate();
        }
    });
    
    if(this.dd && this.fieldTerminals.length > 0) {
    	this.dd.setTerminals(this.terminals.concat(this.fieldTerminals));
    }
    
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
    
    //We set the correct handlers for the service.
    this.setHandlers();
};


/********************* PSUEDO-STATIC METHODS ***********************/
/* These methods are "pseudo-static" in that JavaScript doesn't    */
/* have true static methods, but I tried to emulate this behavior. */
/*******************************************************************/

/**
 * This method is a "pseudo-static" method.  This is because both Service and
 * DataService want to use these methods but they aren't in the same inheritance
 * hierarchy.
 * It uses the service's inputPorts and outputPorts to create the WireIt terminals
 * and position them accordingly.
 * 
 * @static
 * @namespace wfeditor.Service
 * @method createTerminals
 * @param {wfeditor.Service || wfeditor.DataService} service The service that this
 * method is operating on.
 */
wfeditor.Service.createTerminals = function(service) {
    var i;
    var config;
    var port;
    var term;

    // Create input ports.
    for(i = 0; i < service.options.inputPorts.length; i++) {
        port = service.options.inputPorts[i];
        config = {
            name: port.name,
            direction: [0, -1],
            ddConfig: {
                type: port.type,
                allowedTypes: port.allowedTypes
            },
            editable: port.editable
        };
        term = service.addTerminal(config);
        WireIt.sn(term.el, null, {position: "absolute", top: "-15px"});
    }
    
    // Create output ports.
    for(i = 0; i < service.options.outputPorts.length; i++) {
        port = service.options.outputPorts[i];
        config = {
            name: port.name,
            direction: [0, 1],
            ddConfig: {
                type: port.type,
                allowedTypes: port.allowedTypes
            },
            editable: port.editable,
            alwaysSrc: true
        };
        term = service.addTerminal(config);
        WireIt.sn(term.el, null, {position: "absolute", bottom: "-15px"});
    }

    service.positionTerminals();
        
    // Declare the new terminals to the drag'n drop handler (so the wires
    // are moved around with the container)
    if(service.dd) {
    	service.dd.setTerminals(service.terminals);
    }
};

/**
 * This method is a "pseudo-static" method.  This is because both Service and
 * DataService want to use these methods but they aren't in the same inheritance
 * hierarchy.
 * It uses the service's inputPorts and outputPorts to dynamically reposition the
 * WireIt terminals based on its current dimensions (height and width).
 * 
 * @static
 * @namespace wfeditor.Service
 * @method positionTerminals
 * @param {wfeditor.Service || wfeditor.DataService} service The service that this
 * method is operating on.
 */
wfeditor.Service.positionTerminals = function(service, inputs, outputs, leftOffset) {
	var width = YAHOO.util.Dom.getStyle(service.el, "width");
	if(width == "auto") {
		// special case for IE...I dunno
		width = service.el.clientWidth;
	} else {
	   if(width.length > 2 && width.substr(width.length - 2) == "px") {
		  width = width.substr(0, width.length - 2), 10;
	   }
	   width = parseInt(width);
	}
    
    var nIn = service.options.inputPorts.length;
    var nOut = service.options.outputPorts.length;
    
    var inInt = Math.floor(width / (nIn + 1));
    var outInt = Math.floor(width / (nOut + 1));
        
    var i, j;
    var term;
    //var leftOffset = 15;
    if(YAHOO.lang.isUndefined(leftOffset)) {
    	leftOffset = 15;
    }
    
    if(!inputs) {
    	inputs = service.terminals.slice(0, nIn);
    }
    
    if(!outputs) {
    	outputs = service.terminals.slice(nIn);
    }
    
    // Position input terminals
    for(i = 0; i < nIn; i++) {
        term = inputs[i];
        YAHOO.util.Dom.setStyle(term.el, "left", (inInt * (i + 1)) - leftOffset + "px");
            
        for(j = 0; j < term.wires.length; j++) {
            term.wires[j].redraw();
        }
    }
    
    // Position output terminals
    for(i = 0; i < nOut; i++) {
        term = outputs[i];
        YAHOO.util.Dom.setStyle(term.el, "left", (outInt * (i + 1)) - leftOffset + "px");
		//YAHOO.util.Dom.setStyle(term.el, "top", (service.form.clientHeight) + "px");
            
        for(j = 0; j < term.wires.length; j++) {
            term.wires[j].redraw();
        }
    }
};

/**
 * This method is a "pseudo-static" method.  This is because both Service and
 * DataService want to use these methods but they aren't in the same inheritance
 * hierarchy.
 * It is used to rescale the service by the given scale factor.  It calcultates the
 * multiplcation factor and then calls the service's "rescale" method.
 * 
 * @static
 * @namespace wfeditor.Service
 * @method setScale
 * @param {wfeditor.Service || wfeditor.DataService} service The service that this
 * method is operating on.
 * @param {real} scaleFactor The scale factor (1.0 is "normal", 0.5 is half size,
 * etc.).
 * @param alsoMove {boolean || null} A flag to indicate whether the service should
 * also be moved when it is scaled.
 */
wfeditor.Service.setScale = function(service, scaleFactor, alsoMove) {
    if(!service.scaleFactor) { // the first time, it's 1.0
        service.scaleFactor = 1.0;
    }

    if(service.scaleFactor == scaleFactor) {
    	// scale factor is the same, don't need to do anything
    	return;
    }

    var mult = scaleFactor / service.scaleFactor;
    service.scaleFactor = scaleFactor;
    
    service.rescale(mult, alsoMove);
};

/**
 * This method is a "pseudo-static" method.  This is because both Service and
 * DataService want to use these methods but they aren't in the same inheritance
 * hierarchy.
 * It is a helper method that scales the given attribute by a given multiplicative
 * factor on the given element.
 * 
 * @static
 * @namespace wfeditor.Service
 * @method scaleValue
 * @param {HTMLElement} element The element to scale the value for.
 * @param {String} attribute The attribute to scale the value for.
 * @param {real} mult The multiplicative factor by which the value should be scaled.
 */
wfeditor.Service.scaleValue = function(element, attribute, mult) {
    var val = YAHOO.util.Dom.getStyle(element, attribute);
        
    // check for 'px' or 'pt' at end
    var pxOrPt;
    if(val.length > 2 && val.substr(val.length - 2, 2) == 'px') {
    	val = val.substr(0, val.length - 2);
    	pxOrPt = 'px';
    } else if(val.length > 2 && val.substr(val.length - 2, 2) == 'pt') {
        val = val.substr(0, val.length - 2);
        pxOrPt = 'pt';
    }

    // set new value
    val = mult * val;
    if(pxOrPt) {
    	val += pxOrPt;
    }
    YAHOO.util.Dom.setStyle(element, attribute, val);

};

/**
 * This method is called when the user clicks the service info button.  It finds the
 * associated module and then calls the parent WorkflowEditor's serviceInfo method.
 * 
 * @method onClickInfo
 * @param {Container} service
*/
wfeditor.Service.onClickInfo = function(service) {
    if(service.layer) {
        var editor = service.layer.editor.editor;
        var module = editor.modulesByName[service.options.title];
        editor.serviceInfo(module.name, module.description, module.url, module.createdBy);
    }
};

/*********************** NON-STATIC METHODS ************************/
/* These methods are normal non-static methods.                    */
/*******************************************************************/

YAHOO.lang.extend(wfeditor.Service, WireIt.FormContainer, {
	
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
		// Call parent class.
		wfeditor.Service.superclass.setOptions.call(this, options);

		
		// Add the CSS class "Service"
		this.options.className += " Service";

        // Set up form options
		this.options.legend = options.legend; 
		this.options.collapsible = options.collapsible;
		this.options.collapsed = options.collapsed;
		this.options.fields = options.fields;
		this.options.id = options.id;
		
		// Make fields wirable
		for(var i in this.options.fields) {
			this.options.fields[i].inputParams.wireable = true;
			this.options.fields[i].inputParams.type = this.options.fields[i].type;
			this.options.fields[i].inputParams.container = this;
		}
		
		
		if(!this.options.fields) {
			this.options.height = 200;
		}
		//if options.width not set, default to be 200px
		if(!options.width) {
            this.options.width = 200;
		}
		//get container body height
		this.options.bodyHeight = options.bodyHeight;

        // Set oritinalWorkflowId and uniqueId. Different logic for drag & drop and load.
        if(options.originalWorkflowId == null) {
        	// drag and drop
        	if(options.type == "workflow") {
                this.options.originalWorkflowId = options.uniqueId;
                this.options.uniqueId = options.temporalUniqueId;
        	} else {
                this.options.originalWorkflowId = "DEFAULT_ORIGINAL_WORKFLOW_ID";
                this.options.uniqueId = "DEFAULT_UNIQUE_ID";
        	}
        	// unique Id is already set in ComposePerspective.addModule
        } else {
        	// load
        	this.options.originalWorkflowId = options.originalWorkflowId;
        	this.options.uniqueId = options.uniqueId;
        }
		
		// List the parameter that will be shown in the container
		if(options.propertiesfields) {
			// Go through them and take out any circular references before deep copy.. :[			
			for(var i in options.propertiesfields) {
				var field = options.propertiesfields[i];
				if(field.inputParams && field.inputParams.container) {
					field.inputParams.container = null;
				}
			}
		}
		this.options.propertiesfields = wfeditor.util.cloneObject(options.propertiesfields);
		
		// update propertiesfields' value using options.value
		for(var i = 0; i < this.options.propertiesfields.length; i++) {
		    var key = this.options.propertiesfields[i].key;
		    if(options.value && options.value[key] != null) {
                this.options.propertiesfields[i].inputParams.value = options.value[key];
		    }
		}
		
		// The name of the container. Default faceo5Components
		// TODO this should be passed in from the ComposePerspective when
		// creating the service
		this.options.propsBoxed = options.propsBoxed || "composeServiceProperties";
		this.options.url = options.url;
		this.options.type = options.type;


		this.options.workflowTemporalId = options.workflowTemporalId;
		this.options.displayTitle = (options.displayTitle)
			? options.displayTitle
			: options.title;
		this.options.userServiceName = options.userServiceName;
		
		this.options.inputPorts = options.inputPorts;
		this.options.outputPorts = options.outputPorts;
		
		// Set default options for the form animator.
		this.options.animateFrom = options.animateFrom || "#99CCFF";
		this.options.animateTo = options.animateTo || "#336699";
        this.options.workflowDrillDownButtonClassName = options.workflowDrillDownButtonClassName || "WireIt-Container-workflowdrilldownbutton";
        this.options.serviceDrillDownButtonClassName = options.serviceDrillDownButtonClassName || "WireIt-Container-servicedrilldownbutton";

        // Set the xtype so that in the future we instantiate this class.
		this.options.xtype = "wfeditor.Service";

		// The adapter to connect to the backend.
		this.adapter = wfeditor.adapters.DWRAdapter;
		
		// The classname for the info button.
		this.options.infoClassName = options.infoClassName || "serviceInfo";
		
		// The image location for the info button.
		this.options.infoImgSrc = options.infoImgSrc || "../images/icons/help.png";
	},

    /**
     * This method overrides the parent class to do custom rendering.  It sets the title and adds
     * the info button.
     * 
     * @method render
     */
	render: function() {
		wfeditor.Service.superclass.render.call(this);

        wfeditor.util.setTitle(this);

        // Make info button
        this.infoEl = WireIt.cn("img", {
         	src: this.options.infoImgSrc,
         	className: this.options.infoClassName,
         	title: "Information for service '" + this.options.title + "'"
        });
        YAHOO.util.Dom.insertBefore(this.infoEl, YAHOO.util.Dom.getFirstChild(this.bodyEl));
        YAHOO.util.Event.addListener(this.infoEl, "click", this.onClickInfo, this, true);
        
        // If this is a workflow/composite service, display a drill down button.
        if(this.options.type == "workflow") {
           this.drillDownButton = WireIt.cn('div', {className: this.options.workflowDrillDownButtonClassName} );
           this.el.appendChild(this.drillDownButton);
           YAHOO.util.Event.addListener(this.drillDownButton, "click", this.onWorkflowDrillDownButton, this, true);
        } else if(this.options.type == "composite") {
           this.drillDownButton = WireIt.cn('div', {className: this.options.serviceDrillDownButtonClassName} );
           this.el.appendChild(this.drillDownButton);
           YAHOO.util.Event.addListener(this.drillDownButton, "click", this.onServiceDrillDownButton, this, true);
        }
        
        //draw container body with stored body height
        var bodyHeightProp = (this.options.bodyHeight)
            ? {height: this.options.bodyHeight+"px"}
            : null;
        WireIt.sn(this.bodyEl, null, bodyHeightProp);
	},
	
	/**
	 * This method will set the right handlers for the service. In IE, it happens that when a resize
	 * and an dd handler are in the same service, we need to indicate what elements are not going to
	 * behave as resize handlers.
	 * 
	 * @method setHandlers
	 */
	setHandlers: function() {     
        // We will mark the span and img inside the DD handle to avoid it to behave as a resize
        // Handle.
        var spanTitle = YAHOO.util.Selector.query('span', this.ddHandle, true);
        if (spanTitle) {
            this.ddResize.addInvalidHandleId(spanTitle);
        }
        
        var imgService = YAHOO.util.Selector.query('img', this.ddHandle, true);
        if (imgService) {
            this.ddResize.addInvalidHandleId(imgService);
        }
	},
	
	/**
	 * This method will render the form that holds the service properties.
	 * It overrides the parent class's method.
	 * 
	 * @method renderForm
	 */
	renderForm: function() {
        this.setBackReferenceOnFieldOptionsRecursively(this.options.fields);
        var groupParams = {parentEl: this.bodyEl, fields: this.options.fields, legend: this.options.legend, collapsible: this.options.collapsible};
        this.form = new GroupExt(groupParams);

        // Listen for changes
        this.oldFormValue = this.form.getValue();
        this.form.updatedEvt.subscribe(this.onConfigParamsChanged, this, true);

		this.form.setCallBackService(this);
		
		// Have to do this manually because FormContainer doesn't propogate the
		// collapsed option to inputEx.
		if(this.options.collapsible && this.options.collapsed) {
			this.form.toggleCollapse();
		}
		
		// Register for the toggle event
		YAHOO.util.Event.addListener(this.form.legend, "click",
		  this.onFieldLegendToggled, this, true);

		// Add tooltip with title
		WireIt.sn(this.ddHandle, {title: this.options.displayTitle}, null);
	},

	/*
	 * This method will draw all those properties that are planned to be shown
	 * in the box on the right column.
	 * It overrides the parent class's function.
	 * 
	 * @method renderPropertiesForm
	 */
	renderPropertiesForm: function() {
		propertiesEl = document.getElementById(this.options.propsBoxed);

		// If the element exist in HTML, we put the parameters there.
		if (!YAHOO.lang.isUndefined(propertiesEl)) {
			propertiesEl.innerHTML = "";
			if (this.options.propertiesfields) {
				// Fix getElementById
				this.setBackReferenceOnFieldOptionsRecursively(this.options.propertiesfields);

				var groupParams = {parentEl: propertiesEl, fields: this.options.propertiesfields, legend: this.options.title, collapsible: false};
				this.containerForm = new GroupExt(groupParams);
				this.containerForm.updatedEvt.subscribe(this.onConfigParamsChanged, this, true);
				this.containerForm.setCallBackService(this);
			}
		}
	},

	/**
	 * This method will remove the service form from the right column.
	 * 
	 * @method removePropertiesForm
	 */
	removePropertiesForm: function() {
		propertiesEl = document.getElementById(this.options.propsBoxed);

		// If the element exist in HTML, we remove the form.
		if (!YAHOO.lang.isUndefined(propertiesEl)) {
			propertiesEl.innerHTML = "";
		}
	},
	
	/**
	 * Overrides Container's removeAllTerminals method to also remove the
	 * field terminals.
	 */
	removeAllTerminals: function() {
		wfeditor.Service.superclass.removeAllTerminals.call(this);
		
		for(var i = 0; i < this.fieldTerminals.length; i++) {
            this.fieldTerminals[i].remove();
        }
        this.fieldTerminals = [];
	},

	/**
	 * This method will be called once there's and update in any field in the
	 * form.
	 * 
	 * @method fieldUpdate
	 * @param {Array} value the value changed [0], the element that change[1]
	 */
	fieldUpdate: function(value) {
		// Get values from array.
		var valueSet = value[0];

		// We need to determine if hiddenEl exists, this field will exists when
		// the update cames from a checkbox, on other types, we won't have that
		// field listed.
		var element = (value[1].el.type == "checkbox")
			? value[1].hiddenEl.name
			: value[1].el.name;
			
		this.form.inputsNames[element].setValue(valueSet, false);
		this.containerForm.inputsNames[element].setValue(valueSet, false);

		// Set the property.
		// If the property is not set, then we need to save the value, this
		// will be used when the form is redrawn.
		var numField = 0;
		for (var field in this.form.inputs) {
			var formField = this.form.inputs[field];
			var elementName = (formField.el.type == "checkbox")
				? formField.hiddenEl.name
				: formField.el.name;

			if (elementName == element) break;
			numField ++;
		}
		this.options.propertiesfields[numField].inputParams.value = valueSet;
		//this.options.fields[numField].inputParams.value = valueSet;
	},

    /**
     * This method is called when the user clicked the "drilldown" button
     * on a workflow on canvas.
     * 
     * @method onWorkflowDrillDownButton
     */
    onWorkflowDrillDownButton: function() {
        if(this.layer) {
            var perspective = this.layer.editor.editor.getCurrentPerspective();
            perspective.drillDownWorkflow( {
                uniqueId: this.options.uniqueId,
                originalWorkflowId: this.options.originalWorkflowId
            });
        }
    },

    /**
     * This method is called when the user clicked the "drilldown" button
     * on a composite service on canvas.
     * 
     * @method onWorkflowDrillDownButton
     */
    onServiceDrillDownButton: function() {
        if(this.layer) {
            var perspective = this.layer.editor.editor.getCurrentPerspective();
            perspective.drillDownService( {
                url: this.options.url
            });
        }
    },

	/**
	 * This method is called when the close button (the little X on the top right corner of the 
	 * service) has been clicked. We just call the parent class.
	 * 
	 * @method onCloseButton
	 * @param {Object} e The event object in this call.
	 * @args {Array} args The arguments of this event.
	 */
    onCloseButton: function(e, args) {
    	wfeditor.Service.superclass.onCloseButton.call(this, e, args);
    },

	/**
	 * Overrides the parent class's method to render the form as needed.
	 * 
	 * @method setFocus
	 */
	setFocus: function() {
		wfeditor.Service.superclass.setFocus.call(this);
		if(this.layer) {
			this.renderPropertiesForm();
		}
		
		// Add css style to customize the look&feel of the selected container
		YAHOO.util.Dom.addClass(this.el, "Service-Container-focused");
	},

	/**
	 * Overrides the parent class's method to remove the properties form
	 * as needed.
	 * 
	 * @method removeFocus
	 */
	removeFocus: function() {
		wfeditor.Service.superclass.removeFocus.call(this);
		if(this.layer) {
			this.removePropertiesForm();
		}
		
		// Remove css style
		YAHOO.util.Dom.removeClass(this.el, "Service-Container-focused");
	},

	/**
	 * Overrides the parent class's method.
	 * When the service gets removed we need to remove the form from the right column.
	 * 
	 * @method remove
	 */
	remove: function() {
		wfeditor.Service.superclass.remove.call(this);
		if(this.layer) {
			this.removePropertiesForm();
		}
	},

   /**
    * Instantiate the terminal from the class pointer "xtype."  We are overriding
    * this method from FormContainer to create terminals of type TerminalExt by
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
        return wfeditor.Service.superclass.addTerminal.call(this, terminalConfig);
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
		wfeditor.Service.positionTerminals(this);
	},
	
	/**
	 * This method is called when the container is resized.  We are overriding it
	 * to implement custom behavior here
	 *  
	 * @method onResize
	 * @param {Object} e This object is assigned automatically by YUI.
	 * @param {Array} args ??
	 */
	onResize: function(e, args) {
		// Compensate for sizing weirdness in Container.js		
		// wfeditor.Service.superclass.onResize.call(this, e, args);
		//console.log(e);
		
		// TODO don't hard-code in value
		var newHeight = args[0][1];//this.el.height;
		/*
		console.log("The other");
		console.log(this.bodyEl);
		*/
        WireIt.sn(this.bodyEl, null, {height: (newHeight - 39) + "px"});
		
		// TODO check the height of the form part of the container and
		// truncate it as needed with a scrollbar?
		
		//set new width and new body height
		this.options.width = args[0][0];
        this.options.bodyHeight = newHeight - 39;
		
        this.positionTerminals();
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
		/*
		console.log("We have a form of: ");
		console.log(this.form);
		*/
		if (!this.form) return;

		// Resize body
		wfeditor.Service.scaleValue(this.el, 'width', mult);
		wfeditor.Service.scaleValue(this.bodyEl, 'font-size', mult);

		/*
		console.log("Tenemos en el height cuando se hace resize");
		console.log(this.form.divEl.clientHeight);
		*/
		var newHeight = this.form.divEl.clientHeight;
		WireIt.sn(this.bodyEl, null, {height: (newHeight) + "px"});
		//wfeditor.Service.scaleValue(this.bodyEl, 'height', mult);
        
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
        
        // Resize help icon
        wfeditor.Service.scaleValue(this.infoEl, 'width', mult);
        
        // Reposition terminals
        this.positionTerminals();
        
        // Move position
        if(alsoMove == null || alsoMove) {   
            wfeditor.Service.scaleValue(this.el, 'left', mult);
            wfeditor.Service.scaleValue(this.el, 'top', mult);
        }
	},

    /**
     * This method is called when the form is collapsed or expanded. The purpose is to set the right
     * height for the containing div one it's expanded so the collapse minimize (make it smaller)
     * the service.
     * 
     * @method resizeMe
     */
	resizeMe: function() {
		// If this service doesn't have a form, we return.
		if (!this.form) return;
		
		// We get the height and width of the div containing the form.
		var newHeight = this.form.divEl.clientHeight;
		var newWidth = this.form.divEl.clientWidth;

        // If we have a terminal in this service we reposition the terminals.
		if (this.terminals && this.terminals.length > 0) {
			this.positionTerminals();
		}
	},
	
	/**
	 * This method is called whenever the properties form is toggled.  It updates
	 * the options.collapsed flag and redraws the wires.
	 * 
	 * @method onFieldLegendToggled
	 */
	onFieldLegendToggled : function() {
		// update collapsed option
		this.options.collapsed = !YAHOO.util.Dom.hasClass(this.form.fieldset, 'inputEx-Expanded');
		
		// disable collapsing if the field terminals are connected.
		// ideally we would disable the collapsable option on the inputEx form, but
		// there's no easy way to do this now, so just "re-toggle" it.
		if(this.options.collapsed) {
			var hasFieldWire = false;
			for(var i = 0; !hasFieldWire && i < this.fieldTerminals.length; i++) {
				if(this.fieldTerminals[i].wires && this.fieldTerminals[i].wires.length > 0) {
					hasFieldWire = true;
				}
			}
			
			if(hasFieldWire) {
				this.form.toggleCollapse();
				this.options.collapsed = false;
				return;
			}
		}
		
		// redraw wires
		for(var i in this.terminals) {
			var wires = this.terminals[i].wires;
			for(var j in wires) {
				wires[j].redraw();
			}
		}
		
		for(var i in this.fieldTerminals) {
			var wires = this.fieldTerminals[i].wires;
			for(var j in wires) {
				wires[j].redraw();
			}
		}
	},
	
	/**
	 * This method returns the field terminal with the given name, or null if
	 * there are none.
	 * 
	 * @method getFieldTerminal
	 * @param {String} name The name of the field terminal to get.
	 * @return {WireIt.TerminalExt || null} The field terminal with the given name.
	 */
	getFieldTerminal : function(name) {
        var term;
        for(var i in this.fieldTerminals) {
            term = this.fieldTerminals[i];
            if(term.options.name == name) {
                return term;
            }
        }
        return null;
	},
	
	/**
	 * This method overrides the default WireIt.Container.getConfig.  It adds the
	 * "collapsed" flag to the configuration.
	 * 
	 * @method getConfig
	 * @return {Object} The configuration of the parent plus the collapsed flag.
	 */
	getConfig : function() {
		// Call the parent class's constructor.
        var config = wfeditor.Service.superclass.getConfig.call(this);
        
        // Add the "collapsed" flag.
        if(!YAHOO.lang.isUndefined(this.options.collapsed)) {
            config.collapsed = this.options.collapsed;
        }
        
        // Add "width" and "bodyHeight" as container's stored attributes
        config.width = this.options.width;
        config.bodyHeight = this.options.bodyHeight;
        
        return config;
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
     * This method is called whenever the value for the properties form is changed.  It sends
     * the event to the undo/redo system.
     * 
     * @method onConfigParamsChanged
     */
    onConfigParamsChanged : function() {
    	var newValue = this.form.getValue();
    	
    	var command = new wfeditor.command.CommandChangeParameter(this,
    	   this.oldFormValue, newValue);
    	editor.getCommandStack().execute(command);
    	
    	this.oldFormValue = newValue;
    }
});
