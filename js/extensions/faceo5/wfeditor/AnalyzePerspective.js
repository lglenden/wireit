/**
 * The analyze perspective is the GUI object that handles workflow analysis.
 * 
 * @class AnalyzePerspective
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
 * analysis perspective is associated with.  This is used to copy the workflow from
 * the compose's layer to this layer.
 */
wfeditor.AnalyzePerspective = function(options, editor, compose) {
    
    /**
     * Compose perspective that is associated with this analysis perspective.
     * 
     * @property compose
     * @type {wfeditor.ComposePerspective}
     */
    this.compose = compose;
    
    // Call parent constructor.
    wfeditor.AnalyzePerspective.superclass.constructor.call(this, options, editor);
};

YAHOO.lang.extend(wfeditor.AnalyzePerspective, wfeditor.Perspective, {
    
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
            options.title = "Analyze";
        }
        
        // Call parent setOptions.
        wfeditor.AnalyzePerspective.superclass.setOptions.call(this, options);
        
        // Set layout's left unit options to defaults.
        // Used to instantiate the YUI layout.
        this.options.leftUnitOptions = options.leftUnitOptions || {};
        YAHOO.lang.augmentObject(this.options.leftUnitOptions, {
            header: 'Available Analyses',
            width: '200px',
            resize: true,
            gutter: '5px',
            collapse: true,
            collapseSize: 25,
            scroll: true,
            animate: true
        });
                
        // Set layout's center unit options to defaults.
        // Used to instantiate the YUI layout.
        this.options.centerUnitOptions = options.centerUnitOptions || {};
        YAHOO.lang.augmentObject(this.options.centerUnitOptions, {
        	header: 'Analysis to Run',
            gutter: '5px'
        });
        
        this.options.idAnalysis = options.idAnalysis || this.options.idCenter + "Analysis";
        this.options.idAnalysisHeader = options.idAnalysisHeader || this.options.idAnalysis + "Header";
        this.options.idAnalysisDesc = options.idAnalysisDesc || this.options.idAnalysis + "Desc";
        this.options.idAnalysisCreator = options.idAnalysisCreator || this.options.idAnalysis + "Creator";
        this.options.idAnalysisParams = options.idAnalysisParams || this.options.idAnalysis + "Params";
        this.options.idAnalysisButtons = options.idAnalysisButtons || this.options.idAnalysis + "Buttons";
        
        // Set layout's bottom unit options to defaults.
        // Used to instantiate the YUI layout.
        this.options.bottomUnitOptions = options.bottomUnitOptions || {};
        YAHOO.lang.augmentObject(this.options.bottomUnitOptions, {
            header: 'Results',
            height: '500px',
            resize: true,
            animate: true,
            gutter: '5px',
            collapse: true
        });
    },
    
    /**
     * Builds and returns the HTML content for the left part of the layout.
     * Overrides the parent class.
     * 
     * @method buildContentLeft
     * @return {HTMLElement} The left element to be used in the layout.
     */
    buildContentLeft : function() {
    	// Create left <div> element
    	var left = WireIt.cn("div", {id: this.options.idLeft});
    	
    	return left;
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
        
        // Create the analysis panel
        var analysis =  WireIt.cn("div", {id: this.options.idAnalysis}, {height: "100%", width: "50%", position: "absolute", left: '0px', top: '0px'});
        analysis.appendChild(WireIt.cn("div", {id: this.options.idAnalysisHeader}));
        analysis.appendChild(WireIt.cn("div", {id: this.options.idAnalysisDesc}, null, "Click an analysis for more information."));
        analysis.appendChild(WireIt.cn("div", {id: this.options.idAnalysisCreator}));
        analysis.appendChild(WireIt.cn("div", null, null, "<br />Analysis Parameters:"));
        analysis.appendChild(WireIt.cn("div", {id: this.options.idAnalysisParams}));
        
        temp = WireIt.cn("div", {id: this.options.idAnalysisButtons});
        
        this.createButton({
        	label: "Run Test",
        	id: this.options.id + "RunButton",
        	clickFn: this.runAnalysis,
        	clickFnScope: this,
        	container: temp
        });
        
        analysis.appendChild(temp);
        
        center.appendChild(analysis);

        // Create the center layer -- just build the container for now, we will
        // instantiate it later.
        center.appendChild(WireIt.cn("div", {id: this.options.idLayer},
            {height: "100%", width: "50%", position: "absolute", right: '0px', top: '0px'}));
        
        return center;
    },
    
    /**
     * Builds and returns the HTML content for the bottom part of the layout.
     * Overrides the parent class.
     * 
     * @method buildContentBottom
     * @return {HTMLElement} The bottom element to be used in the layout.
     */
    buildContentBottom: function() {
    	// Create bottom <div> element
    	var bottom = WireIt.cn("div", {id: this.options.idBottom});
        
        return bottom;
    },
    
    
    /************************ RENDERING METHODS ************************/
    /* These methods are run AFTER the perspective is instantiated     */
    /* (i.e., the HTML has been built).  They build and render the YUI */
    /* objects that are used to render interactive, dynamic content.   */
    /*******************************************************************/
    
    /**
     * This method overrides the parent class in order to do custom rendering for this
     * perspective.
     * 
     * @method render
     */
    render : function() {
    	// Call the parent class.
        wfeditor.AnalyzePerspective.superclass.render.call(this);
        
        // "Hack" the layout clip to add text when it's collapsed
        wfeditor.util.hackLayoutClip(this.layout, 'left',
            this.options.leftUnitOptions.header);
        wfeditor.util.hackLayoutClip(this.layout, 'bottom',
            this.options.bottomUnitOptions.header);
        
        // Close footer panel
        this.layout.getUnitByPosition('bottom').collapse();
        
        // Override the layer's add wire method.
        this.layer.oldAddWire = this.layer.addWire;
        this.layer.addWire = function(wire) {
            this.editor.overrideAddWire(wire);
        };
        
        /**
         * This property holds the list of analyses.
         * 
         * @property analysesList
         * @type {wfeditor.util.ListUtil}
         */
        this.analysesList = new wfeditor.util.ListUtil({
            parentEl: this.options.idLeft
        });
        this.analysesList.onItemChanged.subscribe(this.showAnalysis, this, true);
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
        	var container = this.layer.containers[tgt.moduleId];
        	
            var found = false;
            for(var i in container.terminals) {
                var term = container.terminals[i];
                if(term.options.name == tgt.terminal) {
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
            this.layer.oldAddWire(wire);
        }
    },
    
    
    /************************** SETUP METHODS **************************/
    /* These methods are related to setting up the perspective.        */
    /*******************************************************************/
    
    /**
     * This method is called by the backend to update the analyses that are
     * available to run.
     * 
     * @method updateAnalyses
     * @param {Array} analyses The analyses that are available.
     */
    updateAnalyses : function(analyses) {
    	if(!analyses || analyses.length == 0) {
    		return;
    	}
    	
    	this.analyses = analyses;
    	
    	// TODO fix ugly hack -- replace html characters..
    	for(var i = 0; i < this.analyses.length; i++) {
    		this.analyses[i].description = wfeditor.util.replaceHTMLChars(this.analyses[i].description);
    	}
    	
    	for(var i = 0; i < analyses.length; i++) {
    		// Add to the GUI list
    		this.analysesList.addItem(analyses[i].name, false);
    		
    		// Get the parameters
    		this.editor.adapter.getAnalysisParameters(i, this.analyses[i].url, {
    			success: this.onParametersReceived,
    			scope: this
    		});
    	}
    },
    
    /**
     * This method is the callback for getting the parameters for the indicated analysis.
     * 
     * @method onParametersReceived
     * @method {Number} index The index of the analysis that we received the parameters for.
     * @method {Object} parameters The parameters that we received.
     */
    onParametersReceived : function(index, parameters) {
    	var fields = [];
    	
    	for(var i = 0; i < parameters.length; i++) {
    		var param = parameters[i];
    		fields.push({
    			type: param.fieldType,
    			inputParams: {
    				name: param.fieldName,
    				label: param.fieldName,
    				selectOptions: param.fieldOptions,
    				selectValues: param.fieldOptions
    				//value: param.fieldOptions ? param.fieldOption
    			}
    		});
    	}
    	
    	this.analyses[index].fields = fields;
    },
    
    
    /************************ ANALYSIS METHODS ************************/
    /* These methods are related to calling analyses.                 */
    /******************************************************************/
    
    /*
     * This method is an event handler for when the user clicks an item in the
     * analyses list.
     * 
     * @method showAnalysis
     * @param {String} The event type (not used).
     * @param {Array} The arguments from the event (not used).
     */
    showAnalysis: function(type, args) {
    	// Find the index of the clicked item
    	var index = this.analysesList.getIndex();
    	var analysis = this.analyses[index];
    	this.analysisToRun = analysis;
    	
    	// Now update the panel to show it
    	YAHOO.util.Dom.get(this.options.idAnalysisHeader).innerHTML = analysis.name;
    	YAHOO.util.Dom.get(this.options.idAnalysisDesc).innerHTML = "<em>Description</em>:<br />" +
    	   analysis.description;
    	YAHOO.util.Dom.get(this.options.idAnalysisCreator).innerHTML = "<em>Created by</em>: " +
    	   analysis.createdBy;
    	 
        var parentEl = YAHOO.util.Dom.get(this.options.idAnalysisParams);
    	if(this.paramForm) {
    	   // Clear out old form            
           parentEl.innerHTML = "";
    	}
    	 
    	/**
    	 * This method holds the parameters form for the selected analysis.
    	 */
    	this.paramForm = new inputEx.Group({
    	   parentEl: parentEl,
    	   fields: this.analyses[index].fields
    	});
    },
    
    /**
     * This method is the event handler for when the user clicks "run".  It sends the
     * information to the backend and handles callbacks.
     * 
     * @method runAnalysis
     */ 
    runAnalysis: function() {
        // We verify that there's something on the canvas.
        if (YAHOO.lang.isUndefined(this.layer.containers) || this.layer.containers.length < 1) {
            this.error("No workflow loaded, please load a workflow first to analyse its properties.",
                "Analysis Error");
            return;
        }

    	if(!this.analysisToRun) {
    		this.error("Please first select an analysis to run from the list.", "Analysis Error");
    		return;
    	}
    	
    	if(!this.compose.isSaved()) {
    		this.error("Cannot analyze an unsaved workflow!<br />Please save and then try again.", "Analysis Error");
    		return;
    	}
    	
    	// Show waiting panel
        this.showWait();
    	
    	// Get parameters that the middle tier is expecting.
    	var url = this.analysisToRun.url;
    	var workflowName = this.compose.getName();
        var workflowJson = this.compose.getValue().working;
        
    	var params = this.paramForm.getValue();
    	// Put parameters in the form the backend is expecting
    	var parameters = [];
    	for(var name in params) {
    		parameters.push({name: name + '', value: params[name]});
    	}
    	
    	var obj = {
    		url: url,
    		parameters: parameters,
    		workflowName: workflowName,
    		workflowJson: workflowJson
    	};
    	
    	// call the backend and call showResults when it's done
    	this.editor.adapter.analyze(obj, {
    		success: this.showResults,
    		scope: this
    	});
    },
    
    /**
     * This method shows the given results in the bottom panel.  It replaces the HTML of the
     * bottom panel with the string.
     * 
     * @method showResults
     * @param {String} str The HTML results to show.
     */
    showResults : function(results) {
    	this.layout.getUnitByPosition('bottom').expand();
    	YAHOO.util.Dom.get(this.options.idBottom).innerHTML = results.htmlResult;
    	this.hideWait();
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
    	wfeditor.AnalyzePerspective.superclass.onTabSelected.call(this, prevTabIndex);
    	
    	// Show wait panel
    	this.showWait();
    	
    	if(prevTabIndex != null) {
            // Get the previous tab's perspective
            var prevPerspective = this.editor.perspectives[prevTabIndex];
            wfeditor.util.copyWorkflow(this.editor, prevPerspective.layer, this.layer, true);
    	} else {
            wfeditor.util.copyWorkflow(this.editor, this.compose.layer, this.layer, true);
    	}
        
        // Hide wait panel
        this.hideWait();
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
        wfeditor.AnalyzePerspective.superclass.loadWorkflowCommon.call(this, result, true);
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
        wfeditor.AnalyzePerspective.superclass.setProperties.call(this, properties);

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
        wfeditor.ExecutePerspective.superclass.onWorkflowChanged.call(this, newWorkflow);

        wfeditor.util.copyContainersWires(this.editor, newWorkflow.containers, newWorkflow.wires, this.layer, true);

    	this.onTabSelected();
    }
});
