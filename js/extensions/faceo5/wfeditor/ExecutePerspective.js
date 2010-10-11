/**
 * The execute perspective is the GUI object that handles workflow execution.
 * Right now it is basically just a read-only layer that handles callbacks from the
 * backend to show execution progress.  In the future, if we work on debugging and
 * step-by-step execution, this class will become more hefty.
 * 
 * @class ExecutePerspective
 * @namespace wfeditor
 * @extends wfeditor.Perspective
 * 
 * @author Laura
 *
 */

/**
 * Constructor.  For more information, see the Perspective class's constructor as
 * well as the description of the properties. 
 * 
 * @constructor
 * @param {Object} options Options for constructing the perspective.
 * @param {wfeditor.WorkflowEditor} editor The parent workflow editor.
 * @param {wfeditor.ComposePerspective} compose The compose perspective that this
 * execution perspective is associated with.  This is used to copy the workflow from
 * the compose's layer to this layer.
 */
wfeditor.ExecutePerspective = function(options, editor, compose) {
	/**
	 * Compose perspective that is associated with this execution perspective.
	 * 
	 * @property compose
	 * @type {wfeditor.ComposePerspective}
	 */
	this.compose = compose;
	
	/**
	 * This property is used to keep track of exposed ports so that the user
	 * can be prompted to enter values for them.
	 * 
	 * @property exposedPorts
	 * @type {Array}
	 */
	this.exposedPorts = [];
	
	/**
	 * This property is used to check whether we're currently executing or not.
	 */
	this.isExecuting = false;
	
	// Call parent constructor.
    wfeditor.ExecutePerspective.superclass.constructor.call(this, options, editor);
    
    // The total amount of breakpoints, this will be used to enable or disable the
    // "Run to breakpoint" button.
    this.totalBreakPoints = 0;
};

YAHOO.lang.extend(wfeditor.ExecutePerspective, wfeditor.Perspective, {
	
	/********************** INSTANTIATION METHODS **********************/
    /* These methods are run when the perspective is instantiated.     */
    /* The options are set, then the HTML is built.                    */
    /*******************************************************************/
	
	/**
     * Sets the options for constructing this object, using defaults if none
     * are passed in.  For more information, see the superclass's setOptions
     * method and the properties of this class.
     * Overrides the parent class.
     * 
     * @method setOptions
     * @param {Object} options
     */
	setOptions : function(options) {
		// Set the default title of the perspective.
        // Used in the tab label.
        if(!options.title) {
            options.title = "Execute";
        }
		
		// Call parent setOptions.
		wfeditor.ExecutePerspective.superclass.setOptions.call(this, options);
		
		// Set layout's top unit options to defaults.
        // Used to instantiate the YUI layout.
        this.options.topUnitOptions = options.topUnitOptions || {};
        YAHOO.lang.augmentObject(this.options.topUnitOptions, {
            height: '40px',
            gutter: '5px'
        });
        
        // Set layout's center unit options to defaults.
        // Used to instantiate the YUI layout.
        this.options.centerUnitOptions = options.centerUnitOptions || {};
        YAHOO.lang.augmentObject(this.options.centerUnitOptions, {
        	header: 'Workflow to Execute',
            gutter: '5px'
        });
        
        // Set layout's bottom unit options to defaults.
        // Used to instantiate the YUI layout.
        this.options.bottomUnitOptions = options.bottomUnitOptions || {};
        YAHOO.lang.augmentObject(this.options.bottomUnitOptions, {
            height: '300px',
            resize: true,
            animate: true,
            gutter: '5px',
            collapse: true,
            header: 'Intermediate Results',
            scroll: true
        });
	},
	
	/**
     * Builds and returns the HTML content for the top part of the layout.
     * Overrides the parent class.
     * 
     * @method buildContentTop
     * @return {HTMLElement} The top element to be used in the layout.
     */
	buildContentTop : function() {
		// Create top <div> element
		var top = WireIt.cn("div", {id: this.options.idTop});
		
		// Create "View" button
		/**
		 * We keep a reference to the "view" button so that we can tell if it's
		 * checked or not.
		 * 
		 * @property viewButton
		 * @type YAHOO.widget.Button
		 */
		this.viewButton = this.createButton({
			type: "checkbox",
			label: "Mark Viewpoint",
			img: "../images/buttons/view.png",
			clickFn: this.onViewClick
		});
		
		// Create "Run" button
        this.createButton({
            label: "Run",
            img: '../images/buttons/execute.png',
            clickFn: this.onGoClick
        });
        
        // Create Step button and menu
        this.stepButton = this.createSplitButton({
        	label: "Step",
        	img: "../images/buttons/step.png",
        	clickFn: this.onClickStep,
        	menu: [
               {label: "Step In", img: "../images/buttons/step_in.png", clickFn: this.onClickStepIn},
               {label: "Step Out",img: "../images/buttons/step_out.png", clickFn: this.onClickStepOut}
            ]
        });
        
        // Create breakpoint button and menu
        this.breakpointButton = this.createSplitButton({
        	label: "Set Breakpoint",
        	img: "../images/buttons/debug.png",
        	clickFn: this.onClickSetBreakpoints,
        	menu: [
               {label: "Clear All Breakpoints", clickFn: this.onClickClearBreakpoints}
            ]
        });
        
        // This variable will have the current state for breakpoint mode.
        this.breakPointState = false;
        
        // Create "Run to Breakpoint" button
        /**
         * We keep a reference to this button so that we can enable it when
         * the workflow has breakpoints.
         * 
         * @property runToBreakpointButton
         * @type YAHOO.widget.Button
         */
        this.runToBreakpointButton = this.createButton({
        	label: "Run to Breakpoint",
        	img: "../images/buttons/run_to_breakpoint.png",
        	clickFn: this.onRunToBreakpointClick
        });
        
        // Disable "run to breakpoint" button to begin with
        this.runToBreakpointButton.set("disabled", true);
        
        // Create "Pause" button
        this.createButton({
            label: "Pause",
            img: '../images/buttons/pause.png',
            clickFn: this.onClickPause
        });
        
        // Create "Terminate" button
        this.createButton({
            label: "Terminate",
            img: '../images/buttons/stop.png',
            clickFn: this.onClickTerminate
        });

		
		return top;
	},
	
    /**
     * Builds and returns the HTML content for the center part of the layout.
     * Overrides the parent class.
     * 
     * @method buildContentCenter
     * @return {HTMLElement} The center element to be used in the layout.
     */
	buildContentCenter : function() {
		// Create center <div> element
		var center = WireIt.cn("div", {id: this.options.idCenter}, {height: "100%"});
		
		// Create the center layer -- just build the container for now, we will
        // instantiate it later.
		center.appendChild(WireIt.cn("div", {id: this.options.idLayer}, {height: "100%"}));
		
		return center;
	},
	
	/**
     * Builds and returns the HTML content for the bottom part of the layout.
     * Overrides the parent class.
     * 
     * @method buildContentBottom
     * @return {HTMLElement} The cottom element to be used in the layout.
     */
	buildContentBottom: function() {
		// Create and return the bottom <div>.
		/**
		 * This property is a reference to the footer HTML element, so that we can
		 * show intermediate results there.
		 * 
		 * @property footerEl
		 * @type {HTMLElement}
		 */
		this.footerEl = WireIt.cn("div", {id: this.options.idBottom}, {},
		  "This area contains intermediate results from executions.");
		return this.footerEl;
	},
	
	
	/************************ RENDERING METHODS ************************/
    /* These methods are run AFTER the perspective is instantiated     */
    /* (i.e., the HTML has been built).  They build and render the YUI */
    /* objects that are used to render interactive, dynamic content.   */
    /*******************************************************************/
	
	/**
     * Renders the content in this perspective, after it has been built.
     * Overrides the parent class.
     * In the execute perspective, it closes the footer panel and then sets up
     * the layer.
     * 
     * @method render
     */
	render: function() {
		// Call the parent class.
		wfeditor.ExecutePerspective.superclass.render.call(this);
		
		// Do CSS magic to get split buttons to show up properly
        this.layout.getUnitByPosition("top").addClass("hasSplitButtons");
		
		// "Hack" the layout clip to add text when it's collapsed
        wfeditor.util.hackLayoutClip(this.layout, 'bottom',
            this.options.bottomUnitOptions.header);
		
		// Close footer panel
        this.layout.getUnitByPosition('bottom').collapse();
        
        // Override the layer's add wire method.
        this.layer.oldAddWire = this.layer.addWire;
        this.layer.addWire = function(wire) {
            this.editor.overrideAddWire(wire);
        };
	},
	
	
	/************************* "GO" METHODS ****************************/
    /* These methods are related to when the user clicks "go."        */
    /*******************************************************************/
	
	/**
     * This method is called when the user clicks the "go" button.
     * It checks whether the workflow is saved and then copies over the containers
     * and wires from the compose perspective onto the execute layer.  It also makes
     * them non-editable.  Finally, it shows an initialization panel.  This panel
     * goes away when we get a message from the back-end letting us know that the
     * execution has started.
     * 
     * @method onGoClick
     */
	onGoClick: function() {
		// We verify that there's something on the canvas.
		if (YAHOO.lang.isUndefined(this.layer.containers) || this.layer.containers.length < 1) {
            this.error("No workflow loaded, please load a workflow to execute.",
                "Execution Error");
            return;
        }
		
		// Check that the user has saved the workflow in the associated "compose"
		// perspective.
		if(!this.compose.isSaved()) {
            this.error("Cannot execute an unsaved workflow!<br />Please save first.", "Execution Error");
            return;
        }
        
        // If the workflow is packaged, prompt the user for values.
        if(this.exposedPorts.length > 0) {
        	var fields = [];
        	for(var i in this.exposedPorts) {
        		var port = this.exposedPorts[i];
        		fields.push({type: "string", inputParams: {
        			name: WireIt.indexOf(port.container, this.layer.containers) + "." + port.options.name,
        			label: port.container.options.title + ": " + port.options.name,
        			typeInvite: "Enter value for exposed port",
        			required: true
        		}});
        	}        	
        	this.editor.packagePrompt(fields, this._execute, this);
        } else {
        	this._execute();
        }
	},
	
	/**
	 * This is a helper method to do the execution logic.
	 * 
	 * @method _execute
	 * @param packagedParameterValues {Array || null} The given values for any
	 * packaged ports, or null if there are none.
	 */
	_execute: function(packagedParameterValues) {
		// This is the value that we will pass in to the back-end.
        var value = {};
        
        // Add the workflow name
        value.workflowName = this.compose.getName();
        value.workflowId = this.compose.getWorkflowId();
        
        // Also send in the "view intermediate results" points
        var viewIntermResults = [];
        //  This array will have the list of services that have a breakpoint in it.
        var breakPoints = [];
        
        /**
         * This property holds references to the "view intermediate results" terminal elements.
         * It is used to link the terminal and the message so that the user can hover and see
         * which ones are linked.
         * 
         * @property this.viewTermEls
         * @type {Array}
         */
        this.viewTermEls = [];
        
        /**
         * This property holds references to the "view intermediate results" message elements.
         * It is used to link the terminal and the message so that the user can hover and see
         * which ones are linked.
         * 
         * @property this.viewMesgEls
         * @type {Array}
         */
        this.viewMesgEls = [];
        
        for(var i in this.layer.containers) {
            var container = this.layer.containers[i];
            for(var j in container.terminals) {
                var term = container.terminals[j];
                if(YAHOO.util.Dom.hasClass(term.el, "viewModeSelectedTerm")) {
                    viewIntermResults.push({moduleId: i, port: term.options.name});
                    
                    // Add to the "viewTermEls" list
                    if(!this.viewTermEls[i]) {
                    	this.viewTermEls[i] = {};
                    	this.viewMesgEls[i] = {};
                    }
                    
                    this.viewTermEls[i][term.options.name] = term.el;
                }
            }
            
            // We now look for the breakpoints in the different container, a breakpoint is set if
            // the breakpoint image is part of it.
            var containerId = container.options.id;
			var breakPointImg = document.getElementById("breakPoint-" + containerId);

			// If the container has the breakpoint image, then we added as a breakpoint.
 			if (breakPointImg) {
 				breakPoints.push({moduleId: i, moduleName: container.options.title});
 			}
        }

        value.viewIntermediateResults = viewIntermResults;
        value.breakPoint = breakPoints;
        
        // Add the parameter values, if there are any
        if(!packagedParameterValues) packagedParameterValues = {};
        value.packagedParameterValues = [];
        
        for(var i in packagedParameterValues) {
        	var ind = i.indexOf(".");
        	var moduleId = i.substr(0, ind) - 0;
        	var port = i.substr(ind + 1);
        	value.packagedParameterValues.push({
        		moduleId: moduleId, port: port, value: packagedParameterValues[i]
            });
        }
        
        // Disable the appropriate buttons
        var unclick = this.viewButton.get("checked");
        this.viewButton.set("checked", false);
        if(unclick) {
            this.onViewClick();
        }
        this.viewButton.set("disabled", true);
        
        // Show the waiting panel.
        this.showWait();
        
        // Set flags and reset progress indicators
        this.isExecuting = true;
        for(var i = 0; i < this.layer.containers.length; i++) {
        	var container = this.layer.containers[i];
        	container.hasExecuted = false;
        	if(container.animator) {
        	   WireIt.sn(container.bodyEl, {}, {backgroundColor: "#FFFFFF"});
        	   container.animator.stopAnimating = false;
        	}
        }
        
        this.editor.adapter.executeWorkflow(value, {
          success: this.executeWorkflowSuccess,
          scope: this
        });
	},
	
	
	/************************** LAYER METHODS **************************/
    /* These methods are related to interacting with the WireIt Layer  */
    /* (the execution canvas).                                         */
    /*******************************************************************/
	
    /**
     * This method is used to override the WireIt.Layer.addWire method.  We check
     * if the new wire is used for packaging.  If it is, for now we just ignore it
     * because we don't do anything special with packaging wires in the execution
     * perspective.
     * 
     * @method overrideAddWire
     * @param {Object} wire The configuration for wire that's been added.
     */
	overrideAddWire: function(wire) {
        var src = wire.src;
        var tgt = wire.tgt;
        
        if(src.moduleId == -1) {
            // Packaging wire -- add to exposed ports list
            var container = this.layer.containers[tgt.moduleId];
            
            var found = false;
            for(var i in container.terminals) {
            	var term = container.terminals[i];
            	if(term.options.name == tgt.terminal) {
            		this.exposedPorts.push(term);
            		
            		// Add the "exposed" classname
            		YAHOO.util.Dom.addClass(term.el, "WireIt-ExposedTerminal");
            		YAHOO.util.Dom.addClass(term.el, "WireIt-Terminal-connected");
            		
            		found = true;
            		
            		break;
            	}
            }
            
            if(!found) {
            	// Look in field terminals
            	for(var i in container.fieldTerminals) {
                    var term = container.fieldTerminals[i];
                    if(term.options.name == tgt.terminal) {
                        this.exposedPorts.push(term);
                    
                        // Add the "exposed" classname
                        YAHOO.util.Dom.addClass(term.el, "WireIt-ExposedTerminal");
                        YAHOO.util.Dom.addClass(term.el, "WireIt-Terminal-connected");
                        break;
                    }
            	}
            }
        } else if(src.field || tgt.field) {
        	var type = eval(wire.xtype || "WireIt.Wire");
            
            var terminal1 = src.field ?
               this.layer.containers[src.moduleId].getFieldTerminal(src.field) :
               this.layer.containers[src.moduleId].getTerminal(src.terminal);
            var terminal2 = tgt.field ?
               this.layer.containers[tgt.moduleId].getFieldTerminal(tgt.field) :
               this.layer.containers[tgt.moduleId].getTerminal(tgt.terminal);
            
            var w = new type(terminal1, terminal2, this.layer.el, wire);
            w.redraw();
            
            return w;
        } else {
            return this.layer.oldAddWire(wire);
        }
    },
    
    
    /************************* BACKEND METHODS *************************/
    /* These methods are related to interacting with the backend.      */
    /*******************************************************************/
    
    /**
     * This method is called by the backend to update the execution progress in the
     * GUI.  It is given the module ID of the currently executing service, and then
     * the method makes everything look pretty.
     * 
     * @method updateExecuteProgress
     * @param {int} serviceModuleID The ID of the service that's currently executing
     * in the backend.
     */
    updateExecuteProgress: function(serviceModuleID) {    	
    	// Hide the load panel if it's being shown.
        this.hideWait();
        
        // Find the container that matches the given ID
        for(var i = 0; i < this.layer.containers.length; i++) {
            var container = this.layer.containers[i];
            if(i == serviceModuleID) {
            	// Mark it as executed
                container.hasExecuted = true;
                this.containerIsExecuting(container);
                
            } else if(container.hasExecuted) {
            	
            	// Mark all the containers that have already executed.
                this.containerHasExecuted(container);
            }
        }
    },
    
    /**
     * This method is called on the container that represents the service that is
     * currently being executed.  It turns on that container's animator.
     * 
     * @method containerIsExecuting
     * @param {WireIt.Container} container The currently executing container.  Should
     * be either a Service or a DataService container.
     */
    containerIsExecuting: function(container) {
        if(container.animator) {
        	if(this.isExecuting) {
                container.animator.animate();
        	} else {
        		// this shouldn't happen, but for some reason SORASCS sends this message
        		// after it sends the "workflow finished" event so we sometimes get it
        		// out of order...
        		this.containerHasExecuted(container);
        	}
        }
    },
    
    /**
     * This method is called on any containers that have already executed (and are
     * no longer executing).  It turns off the container's animator.
     * 
     * @method containerHasExecuted
     * @param {WireIt.Container} container The container that has executed.  Should
     * be either a Service or a DataService container.
     */
    containerHasExecuted: function(container) {
        if(container.animator && container.animator.isAnimated()) {
            container.animator.stopAnimating = true;
            container.animator.stop(true);
        } else if(container.animator) {
        	 WireIt.sn(container.animator.el, {}, {backgroundColor: container.animator.animateFrom});
        }
    },
    
    /**
     * This method is called by the backend when the workflow has successfully
     * completed its execution.  It displays any message that the backend has, and
     * then updates the containers that have executed.
     * 
     * @method executeWorkflowSuccess
     * @param {String} o The output message to display (if any).
     */
    executeWorkflowSuccess: function(o) {
    	// Ignore any subsequent "updateExecuteProgress" messages that SORASCS sends
    	// out of order.
    	this.isExecuting = false;
    	
    	// Make sure wait panel is hidden (shouldn't happen)
    	this.hideWait();
    	
    	// Enable the appropriate buttons
    	this.viewButton.set("disabled", false);
    	
    	// If the backend returned a message, show that.  Otherwise show a
    	// "No output reported." message.
        this.okay(o ? o : "No output reported.", "Execution Success!");
        
        // Mark all executed containers.
        for(var i = 0; i < this.layer.containers.length; i++) {
            var container = this.layer.containers[i];
            if(container.hasExecuted) {
                this.containerHasExecuted(container);
            }
        }
    },
    
    /**
     * This method is called by the backend if something went wrong during the
     * workflow's execution.  It displays any message that the backend has, and
     * then updates the containers that have executed.
     * 
     * @method executeWorkflowFailure
     * @param {String} o The output message to display (if any).
     */
    executeWorkflowFailure: function(o) {
    	// Ignore any subsequent "updateExecuteProgress" messages that SORASCS sends
        // out of order.
        this.isExecuting = false;
    	
    	// Make sure wait panel is hidden (shouldn't happen)
        this.hideWait();
        
        // Enable the appropriate buttons
        this.viewButton.set("disabled", false);
    	
        
        // Mark all executed containers.
        for(var i = 0; i < this.layer.containers.length; i++) {
            var container = this.layer.containers[i];
            if(container.hasExecuted) {
                this.containerHasExecuted(container);
            }
        }
        
        this.isExecuting = false;
    },
    
    /**
     * This method appends the given message to the footer of this perspective.
     * It adds a horizontal rule above and below the message.
     * 
     * @method appendToFooter
     * @param {String} msg The message to append.
     * @param {Number || null} moduleId The ID of the service that the message is associated with, if any.
     * @param {String || null} port The name of the port that the message is associated with, if any.
     */
    appendToFooter: function(msg, moduleId, port) {
    	this.layout.getUnitByPosition('bottom').expand();
    	
    	var div = WireIt.cn("div", null, null, msg);
    	this.footerEl.appendChild(WireIt.cn("hr"));
    	this.footerEl.appendChild(div);
    	this.footerEl.appendChild(WireIt.cn("hr"));
    	
    	// Add a listener for when we hover
    	if(!YAHOO.lang.isUndefined(moduleId) && !YAHOO.lang.isUndefined(port)) {
            this.viewMesgEls[moduleId][port] = div;
            YAHOO.util.Event.addListener(div, "mouseover", function(e) {
                this.viewResultHover(moduleId, port);
            }, this, true);
            YAHOO.util.Event.addListener(div, "mouseout", function(e) {
                this.viewResultUnhover(moduleId, port);
            }, this, true);
            
            var el = this.viewTermEls[moduleId][port];
            YAHOO.util.Event.addListener(el, "mouseover", function(e) {
            	this.viewResultHover(moduleId, port);
            }, this, true);
            YAHOO.util.Event.addListener(el, "mouseout", function(e) {
            	this.viewResultUnhover(moduleId, port);
            }, this, true);
    	}
    },
    
    /**
     * This method is called when the user hovers over a terminal or message associated with a
     * "view intermediate result" item.  It turns the backgrounds yellow.
     * 
     * @method viewResultHover
     * @param {Number} moduleId The index in the array of the module.
     * @param {String} port The name of the port.
     */
    viewResultHover: function(moduleId, port) {
    	this.viewTermEls[moduleId][port].style.backgroundColor = "yellow";
    	this.viewMesgEls[moduleId][port].style.backgroundColor = "yellow";
    },
    
    /**
     * This method is called when the user un-hovers over a terminal or message associated with a
     * "view intermediate result" item.  It turns the backgrounds transparent.
     * 
     * @method viewResultUnhover
     * @param {Number} moduleId The index in the array of the module.
     * @param {String} port The name of the port.
     */
    viewResultUnhover: function(moduleId, port) {
        this.viewTermEls[moduleId][port].style.backgroundColor = "transparent";
        this.viewMesgEls[moduleId][port].style.backgroundColor = "transparent";
    },
    
    
    /*************************** TAB METHODS ***************************/
    /* These methods are related to handling tab events.               */
    /*******************************************************************/
    
    /**
     * This method is called whenever this perspective is selected in the parent
     * WorkflowEditor's tab view.  It overrides the parent's method.
     * It updates the layer to reflect the latest workflow on the related compose
     * tab.
     * 
     * @method onTabSelected
     * @prevTabIndex the index of the tab that was selected before the switch happened.
     */
    onTabSelected : function(prevTabIndex) {
    	// Call parent class
        wfeditor.ExecutePerspective.superclass.onTabSelected.call(this, prevTabIndex);
    	
    	if(!this.isExecuting) {
    		// Show wait panel
    		this.showWait();
    		
    		// Clear out the "exposed ports" list.
    		this.exposedPorts = [];
    		
    		if(prevTabIndex != null) {
                // Get the previous tab's perspective
                var prevPerspective = this.editor.perspectives[prevTabIndex];
                wfeditor.util.copyWorkflow(this.editor, prevPerspective.layer, this.layer, true);
    		} else {
                wfeditor.util.copyWorkflow(this.editor, this.compose.layer, this.layer, true);
            }
    	   
    	    // if we're in view mode, we want to set the wire classes appropriately
    	    if(this.viewButton.get("checked")) this.onViewClick();
    	    
    	    // Hide wait panel
    	    this.hideWait();
    	}
    },
    
    /**************************** "LOAD" METHODS **************************/
    /* These methods are related to load the workflow, e.g. load the      
     * drilled down workflow, set the properties when drilldown/tab-switch
     * happens.                                                           */
    /**********************************************************************/
    
    /**
     * This method loads the workflow on canvas. Used when loading/drilling down.
     * Just call the superclass function with "readonly" mode.
     * 
     * @method loadWorkflow
     * @result the workflow's information in json format
     */
    loadWorkflow: function(result) {
        wfeditor.ExecutePerspective.superclass.loadWorkflowCommon.call(this, result, true);
    },

    /**
     * This method preserves the properties by calling the superclass's method
     * as well as fires the onWorkflowNameChanged event to change the workflow's
     * name on the left workflow tab.
     * 
     * @method setProperties
     * @properties the workflow's properties.
     */
    setProperties: function(properties) {
        wfeditor.ExecutePerspective.superclass.setProperties.call(this, properties);
        
        var name = properties.name;
        if(name == null || name == "") {
            name = "New Workflow";
        }
        this.editor.onWorkflowNameChanged(name);
    },
    
    /********************* WORKFLOW CHOOSER METHODS ********************/
    /* These methods are related to the workflow chooser on the side.  */
    /*******************************************************************/
    
    /**
     * This method is called whenever the user switches which workflow is opened
     * using the chooser on the left.  It overrides the parent method.
     * IMPORTANT: assumes that the onWorkflowChanged has been called on the compose
     * perspective first.
     * 
     * @method onWorkflowChanged
     * @param {Object} newWorkflow
     */
    onWorkflowChanged : function(newWorkflow) {
    	if(!this.isExecuting) {
            wfeditor.ExecutePerspective.superclass.onWorkflowChanged.call(this, newWorkflow);
            this.onTabSelected();
    	}
    },

    /******************* INTERMEDIATE RESULTS METHODS ******************/
    /* These methods are related to viewing intermediate results in    */
    /* the execute perspective.                                        */
    /*******************************************************************/
    
    /**
     * This method is called when the user clicks "view."  It allows the user
     * to specify where they want to have intermediate results.
     * 
     * @method onViewVlick
     */
    onViewClick : function() {
    	// First, we disasble setting breakpoints, change the color of the button and remove events
    	// from the containers.
    	if (this.breakPointState) {
    		this.breakPointState = false;
    		this.breakpointButton.removeClass("yui-checkbox-button-checked");
    		this.setBreakPointEvents();
    	}
    	var view = this.viewButton.get("checked");
    	
    	var container;
    	var term;
    	for(var i in this.layer.containers) {
    		container = this.layer.containers[i];
    		for(var j in container.terminals) {
    			term = container.terminals[j];
    			var el = term.el;
                
                // Only deal with output ports and not of data services
                if(term.options.direction[1] == "-1" || term.container.options.type == "source"
                   || term.container.options.type == "sink") {
                	continue;
                }
                
                if(view) {
                    YAHOO.util.Dom.addClass(el, "viewModeTerm");
                    YAHOO.util.Event.addListener(el, "click", this.viewModeTermClicked, this, true);
                } else {
                    YAHOO.util.Dom.removeClass(el, "viewModeTerm");
                    YAHOO.util.Event.removeListener(el, "click", this.viewModeTermClicked);
                }
                
    		}
    	}
    },
    
    /**
     * This method is called when the user clicks a terminal while in "Mark Viewpoint" mode.
     * It toggles the state of the terminal element.
     * 
     * @method viewModeTermClicked
     * @param {Object} e The click event parameter.
     */
    viewModeTermClicked: function(e) {
    	var target = e.target;
    	if(YAHOO.lang.isUndefined(target)) {
    		target = e.srcElement; // why, IE, why??
    	}
    	
    	var isClicked = YAHOO.util.Dom.hasClass(target, "viewModeSelectedTerm");
    	if(isClicked) {
            YAHOO.util.Dom.removeClass(target, "viewModeSelectedTerm");
    	} else {
    		YAHOO.util.Dom.addClass(target, "viewModeSelectedTerm");
    	}
    },
    
    
    /************************ BREAKPOINT METHODS ***********************/
    /* These methods are related to the breakpoint mode of the execute */
    /* perspective.                                                    */
    /*******************************************************************/
    
    /**
     * This method will be called when the user clicks on the "run to breakpoint" button.
     * This will communicate to the backend to run to the next breakpoint that the user has
     * set.
     * 
     * @method onRunToBreakpointClick
     */
    onRunToBreakpointClick : function() {
    	// TODO
    	this.info('This feature is not implemented in this release');
    },
    
    /**
     * This method will be called when the user click on the "set breakpoint" button. This will
     * cause that the button change it's presentation (active or inactive) and that the list of
     * services will be able to handle some events like clicking on it to set the breakpoints.
     * 
     * @method onClickSetBreakpoints
     */
    onClickSetBreakpoints : function() {
    	// If we are in view results mode, we change it to off.
    	if (this.viewButton.get("checked")) {
    		this.viewButton.set("checked", false);
    		this.onViewClick();
    	}

		// Everytime we are called, we toggle the state of the breakpoints.
		this.breakPointState = !this.breakPointState;

		// Changing the presentation of the set breakpoint button.
		if (this.breakPointState) {
			this.breakpointButton.addClass("yui-checkbox-button-checked");
		}
		else {
			this.breakpointButton.removeClass("yui-checkbox-button-checked");
		}
		
		// We set the events to handle the breakpoint setting.
		this.setBreakPointEvents();
 	},
 	
 	/**
 	 */
 	 onClickStep : function(){
 	 	// TODO
    	this.info('This feature is not implemented in this release');
 	 },
 	 
 	  	/**
 	 */
 	 onClickStepIn : function(){
 	 	// TODO
    	this.info('This feature is not implemented in this release');
 	 },
 
  	/**
 	 */
 	 onClickStepOut : function(){
 	 	// TODO
    	this.info('This feature is not implemented in this release');
 	 },
 	 
 	 /**
 	 */
 	 onClickPause : function(){
 	 	// TODO
    	this.info('This feature is not implemented in this release');
 	 },
 	 
 	 /**
 	 */
 	 onClickTerminate : function(){
 	 	// TODO
    	this.info('This feature is not implemented in this release');
 	 },
 	
 	
 	/**
 	 * This method will iterate over all the containers in the canvas and set (services only) the
 	 * event handlers and styles to set breakpoints.
 	 * 
 	 * @method setBreakPointEvents
 	 */
 	setBreakPointEvents: function() {
		for(var i in this.layer.containers) {
    		var container = this.layer.containers[i];
    		containerId = container.options.id;

    		// We will only modify those services that are not data related ones.
    		var type = container.options.type;
    		if (type == "source" || type == "sink") {
    			continue;
    		}

            if(this.breakPointState) {
                YAHOO.util.Dom.addClass(container.el, "breakHover");
                YAHOO.util.Event.addListener(container.el, "click", this.setBreakpoint, container, this);
            } else {
                YAHOO.util.Dom.removeClass(container.el, "breakHover");
                YAHOO.util.Event.removeListener(container.el, "click", this.setBreakpoint);
            }
    	}
 	},

 	/**
 	 * This method will be called when the user is in breakpoint mode and clicks over a service. The
 	 * result of this will be an image in the upper right column of the service. If the service
 	 * already had a breakpoint, then the image is removed.
 	 * Depending on the amount of breakpoints in the canvas the button Run to breakpoint will be
 	 * enabled or disabled.
 	 * 
 	 * @method setBreakpoint
 	 * @param e the event that is sent by default by YUI (not used in the method)
 	 * @param container the container that was clicked. 
 	 */
 	setBreakpoint: function(e, container) {
 		var serviceId = container.options.id;
 		var handlerEl = container.el.children[0];
 		
 		// We look for the breakpoint image for this service.
 		var breakPointImg = document.getElementById("breakPoint-"+serviceId);
 		
 		// If the service has the breakpoint image, then we are removing a breakpoint
 		// If it doesn't have we are going to add it. 
 		if (breakPointImg) {
 			handlerEl.removeChild(breakPointImg);
 			this.totalBreakPoints--;
 		}
 		else {
	 		var breakImgEl = WireIt.cn('img', {"src": '../images/buttons/debug.png', "class": "breakSet", "id": "breakPoint-"+serviceId} );
	 		handlerEl.appendChild(breakImgEl);
	 		this.totalBreakPoints++;
 		} 		
 		
 		// Enabling the "go to breakpoint" button.
 		this.runToBreakpointButton.set("disabled", (this.totalBreakPoints < 1));
 	},
    
    /**
     * This method will remove all breakpoint in the services. This will iterate over the containers
     * and remove the breakpoint image from it.
     * 
     * @method onClickClearBreakpoints
     */
    onClickClearBreakpoints : function() {
    	// We walk all the containers and remove the breakpoint image if it exists.
    	for(var i in this.layer.containers) {
    		var container = this.layer.containers[i];
    		var handlerEl = container.el.children[0];
    		var serviceId = container.options.id;
    	
    		// We look for the breakpoint image	
    		var breakPointImg = document.getElementById("breakPoint-"+serviceId);
    		
    		// If it exists, we remove it. 
 			if (breakPointImg) {
 				handlerEl.removeChild(breakPointImg);
 			}
    	}
    	
    	// Set the counter of breakpoints to 0 and disable the go to breakpoint button.
    	this.totalBreakPoints = 0;
    	this.runToBreakpointButton.set("disabled", true);
    }
});