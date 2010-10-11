/**
 * Perspective is the JavaScript class that represents, at a basic level, a "tab"
 * in the workflow tool.  The name and idea for the perspective comes from Eclipse
 * which has multiple perspectives that you can open.  The idea is that we abstract
 * out things that are common to all perspectives in this class and leave the
 * individual rendering and specialization to the children classes.
 * 
 * Right now, what is common to all perspectives is some common functionality
 * (such as having a reference to the parent WorkflowEditor for methods like
 * "info", "alert", etc.) and some layout structuring.  To be more specific, the
 * Perspective class assumes that all of its children are going to be using a
 * YUI layout internally, and so it does much of the work to setup the layout and
 * leaves it up to the children to define the top, left, center, etc. pieces as
 * they please.  In this way, a Perspective can be rendered by the parent
 * WorkflowEditor without needing to know the specifics of the child class's GUI.
 * 
 * @class Perspective
 * @namespace wfeditor
 * 
 * @author Laura
 *
 */

/**
 * Constructor.  This method first sets the options (using defaults for any values
 * that have not been passed in) and then builds the HTML content of the perspective.
 * 
 * @constructor
 * @param {Object} options Options for constructing the perspective.
 * @param {wfeditor.WorkflowEditor} editor The parent workflow editor.
 */
wfeditor.Perspective = function(options, editor) {
	/**
	 * The parent WorkflowEditor object.
	 * 
	 * @property {wfeditor.WorkflowEditor} editor
	 */
	this.editor = editor;
	
	// Set options
	this.options = {};
	this.setOptions(options || {});
	
	// Build the HTML content
	this.buildContent();
};

wfeditor.Perspective.prototype = {
	
	/*********************** CONVENIENCE METHODS ***********************/
    /* These methods are "convenience" methods that just call the      */
    /* relevant methods in the parent WorkflowEditor object.           */
    /*******************************************************************/
	
	/**
	 * This method is just a call to the relevant method in the parent
	 * WorkflowEditor object.  This is so that children can call "this.showWait"
	 * more easily.  See the WorkflowEditor's showWait method for more information.
	 * 
	 * @method showWait
	 */
	showWait: function() { this.editor.showWait(); },
	
	/**
     * This method is just a call to the relevant method in the parent
     * WorkflowEditor object.  This is so that children can call "this.hideWait"
     * more easily.  See the WorkflowEditor's hideWait method for more information.
     * 
     * @method hideWait
     */
    hideWait: function() { this.editor.hideWait(); },
	
	/**
     * This method is just a call to the relevant method in the parent
     * WorkflowEditor object.  This is so that children can call "this.prompt"
     * more easily.  See the WorkflowEditor's prompt method for more information.
     * 
     * @method prompt
     * @param {Object} options The prompt options.
     */
	prompt: function(options) { this.editor.prompt(options); },
	
    /**
     * This method is just a call to the relevant method in the parent
     * WorkflowEditor object.  This is so that children can call "this.confirm"
     * more easily.  See the WorkflowEditor's confirm method for more information.
     * 
     * @method confirm
     * @param {Object} options The confirmation options.
     */
	confirm: function(options) { this.editor.confirm(options); },
	
	/**
	 * This method is just a call to the relevant method in the parent
	 * WorkflowEditor object.  This is so that children can call "this.alert"
	 * more easily.  See the WorkflowEditor's alert method for more information.
	 * 
	 * @method alert
	 * @param {String} msg The alert message (body).
	 * @param {String || null} header The alert header (the top of the panel).  If
	 * null, a default is used.
	 * @param {String || null} iconType Which icon to use, or null to use none.
	 * The iconType should be the name of a file in the ../images/icons/alerts folder.
	 * For example, an iconType of "foo" will look for "../images/icons/alerts/foo.png".
	 * In this way we can flexibly assign icons to alerts as needed.
	 */
	alert: function(msg, header, iconType) { this.editor.alert(msg, header, iconType); },
	
	/**
	 * This method is just a call to the relevant method in the parent
     * WorkflowEditor object.  This is so that children can call "this.error"
     * more easily.  See the WorkflowEditor's error method for more information.
     * 
     * @method error
     * @param {String} msg The error message (body).
     * @param {String || null} header The alert header (the top of the panel).  If
     * null, a default is used.
	 */
	error: function(msg, header) { this.editor.error(msg, header); },
	
	/**
     * This method is just a call to the relevant method in the parent
     * WorkflowEditor object.  This is so that children can call "this.warn"
     * more easily.  See the WorkflowEditor's warn method for more information.
     * 
     * @method warn
     * @param {String} msg The warning message (body).
     * @param {String || null} header The alert header (the top of the panel).  If
     * null, a default is used.
     */
	warn: function(msg, header) { this.editor.warn(msg, header); },
	
	/**
     * This method is just a call to the relevant method in the parent
     * WorkflowEditor object.  This is so that children can call "this.info"
     * more easily.  See the WorkflowEditor's info method for more information.
     * 
     * @method info
     * @param {String} msg The information message (body).
     * @param {String || null} header The alert header (the top of the panel).  If
     * null, a default is used.
     */
	info: function(msg, header) { this.editor.info(msg, header); },
	
	/**
     * This method is just a call to the relevant method in the parent
     * WorkflowEditor object.  This is so that children can call "this.okay"
     * more easily.  See the WorkflowEditor's okay method for more information.
     * 
     * @method okay
     * @param {String} msg The message (body).
     * @param {String || null} header The alert header (the top of the panel).  If
     * null, a default is used.
     */
	okay: function(msg, header) { this.editor.okay(msg, header); },
	
	
	/********************** INSTANTIATION METHODS **********************/
    /* These methods are run when the perspective is instantiated.     */
    /* The options are set, then the HTML is built.                    */
    /*******************************************************************/
	
	/**
     * Sets the options for constructing this object, using defaults if none
     * are passed in.  For more information, see properties of this class.
     * This method should probably be overridden by children to set their own
     * default options.
     * 
     * @method setOptions
     * @param {Object} options
     */
	setOptions : function(options) {
		/**
		 * The "title" of this perspective.  Conceptually this can be thought of
		 * as the text that's in the tab header for this object.  Defaults to
		 * "Perspective" if none are given.
		 * 
		 * @property {String} options.title
		 */
		this.options.title = options.title || "Perspective";
		
		/**
		 * The HTML ID of this perspective.  This corresponds to the ID in the <div>
		 * that is generated to hold the content of this perspective.  It MUST be
		 * unique within the application.  If an ID is not given, one is generated
		 * using YAHOO.util.Dom.generateId().
		 * 
		 * @property {String} options.id
		 */
		this.options.id = options.id || YAHOO.util.Dom.generateId();
		
		/**
		 * The HTML ID of the "top" <div> of ths perspective.  It MUST be unique
		 * within the application.  If an idTop is not given, it is generated
		 * by appending "Top" to the overall perspective ID.
		 * 
		 * @property {String} options.idTop
		 */
		this.options.idTop = options.idTop || this.options.id + "Top";
		
		/**
         * The HTML ID of the "left" <div> of ths perspective.  It MUST be unique
         * within the application.  If an idLeft is not given, it is generated
         * by appending "Left" to the overall perspective ID.
         * 
         * @property {String} options.idLeft
         */
        this.options.idLeft = options.idLeft || this.options.id + "Left";
        
        /**
         * The HTML ID of the "center" <div> of ths perspective.  It MUST be unique
         * within the application.  If an idCenter is not given, it is generated
         * by appending "Center" to the overall perspective ID.
         * 
         * @property {String} options.idCenter
         */
		this.options.idCenter = options.idCenter || this.options.id + "Center";
		
		/**
         * The HTML ID of the "right" <div> of ths perspective.  It MUST be unique
         * within the application.  If an idRight is not given, it is generated
         * by appending "Right" to the overall perspective ID.
         * 
         * @property {String} options.idRight
         */
		this.options.idRight = options.idRight || this.options.id + "Right";
		
		/**
         * The HTML ID of the "bottom" <div> of ths perspective.  It MUST be unique
         * within the application.  If an idBottom is not given, it is generated
         * by appending "Bottom" to the overall perspective ID.
         * 
         * @property {String} options.idBottom
         */
		this.options.idBottom = options.idBottom || this.options.id + "Bottom";
		
		/**
         * The HTML ID of the layer <div> of ths perspective.  It MUST be unique
         * within the application.  If an idLayer is not given, it is generated
         * by appending "Layer" to the overall perspective ID.  The layer is
         * probably in the center of the layout, but that's not necessary.
         * 
         * @property {String} options.idLayer
         */
		this.options.idLayer = options.idLayer || this.options.id + "Layer";
		
		/**
         * The HTML ID of the "layer map" <div> of ths perspective.  It MUST be unique
         * within the application.  If an idLayerMap is not given, it is generated
         * by appending "Map" to the perspective's layer ID.
         * 
         * @property {String} options.idLayerMap
         */
		this.options.idLayerMap = options.idLayerMap || this.options.idLayer + "Map";
		
		/**
		 * If there is a classname to apply to the perspective <div>, it should be
		 * given here.  It will be applied to the options.id element.  If not given,
		 * it defaults to "tabDiv".
		 * 
		 * @property {String} options.className
		 */
		this.options.className = options.className || "tabDiv";
		
		/**
		 * If there is a classname to apply to buttons in this perspective, it should
		 * be given here.  It not given, it defaults to "perspectiveButton."
		 * 
		 * @property {String} options.buttonClass
		 */
		this.options.buttonClass = options.buttonClass || "perspectiveButton";
		
		/**
		 * Options to pass to the YUI layout.  See YAHOO.widget.Layout constructor.
		 * 
		 * @property {Object} options.layoutOptions
		 */
		this.options.layoutOptions = options.layoutOptions || {};
		
		/**
		 * Options to pass to the YUI tab widget.  See YAHOO.widget.Tab constructor.
		 * 
		 * @property {Object} options.tabOptions
		 */
		this.options.tabOptions = {
			label: this.options.title
		};
		YAHOO.lang.augmentObject(this.options.tabOptions, options.tabOptions || {});
		
		/**
		 * Options to pass to the WireIt layer object.  See WireIt.Layer constructor.
		 * 
		 * @property {Object} options.layerOptions
		 */
		this.options.layerOptions = {
			parentEl: this.options.idLayer
		};
		YAHOO.lang.augmentObject(this.options.layerOptions, options.layerOptions || {});
		YAHOO.lang.augmentObject(this.options.layerOptions, {
			layerMap: false,
			layerMapOptions: {
				parentEl: this.options.idLayerMap
			}
		});
	},
	
	/**
	 * This method is called in the constructor.  It builds the HTML content of
	 * the perspective by calling the children's implementations of the
	 * buildContentLeft, buildContentTop, etc. methods.  If these children methods
	 * are not defined (or return null) then that element is not used in the layout.
	 * Finally, the YUI tab is built.
	 * This method should probably not be overridden by children unless absolutely
	 * necessary.
	 * 
	 * @method buildContent
	 */
	buildContent : function() {
		/**
		 * This property holds the HTML element that is the outer-most, top-level
		 * element for this perspective.  All other elements are children to this
		 * element.
		 * 
		 * @property {HTMLElement} el
		 */
		this.el = WireIt.cn("div",
		      {id: this.options.id, className: this.options.className});
		
		// Build up the units to pass to the layout
		var units = [];
		
		// Call the children's implementation of buildContentTop, and if there is
		// something built, add it to the layout.
		var top = this.buildContentTop();
		if(top) {
			this.el.appendChild(top);
			top = {
				position: 'top',
                body: this.options.idTop
			};
			YAHOO.lang.augmentObject(top, this.options.topUnitOptions);
			units.push(top);
		}
		
		// Call the children's implementation of buildContentLeft, and if there is
        // something built, add it to the layout.
		var left = this.buildContentLeft();
		if(left) {
			this.el.appendChild(left);
			left = {
                position: 'left',
                body: this.options.idLeft
            };
            YAHOO.lang.augmentObject(left, this.options.leftUnitOptions);
            units.push(left);
		}
		
		// Call the children's implementation of buildContentCenter, and if there is
        // something built, add it to the layout.
		var center = this.buildContentCenter();
		if(center) {
			this.el.appendChild(center);
            center = {
                position: 'center',
                body: this.options.idCenter
            };
            YAHOO.lang.augmentObject(center, this.options.centerUnitOptions);
            units.push(center);
		}
		
		// Call the children's implementation of buildContentRight, and if there is
        // something built, add it to the layout.
		var right = this.buildContentRight();
		if(right) {
			this.el.appendChild(right);            
            right = {
                position: 'right',
                body: this.options.idRight
            };
            YAHOO.lang.augmentObject(right, this.options.rightUnitOptions);
            units.push(right);
		}
		
		// Call the children's implementation of buildContentBottom, and if there is
        // something built, add it to the layout.
		var bottom = this.buildContentBottom();
		if(bottom) {
			this.el.appendChild(bottom);
            bottom = {
                position: 'bottom',
                body: this.options.idBottom
            };
            YAHOO.lang.augmentObject(bottom, this.options.bottomUnitOptions);
            units.push(bottom);
		}
		
		// Construct the layout options.
		var layoutOptions = {units: units};
		YAHOO.lang.augmentObject(layoutOptions, this.options.layoutOptions);
		this.options.layoutOptions = layoutOptions;

        // Construct the tab.
        this.options.tabOptions.contentEl = this.el;

        /**
         * The YUI tab that the parent uses to put in the tab view.
         * 
         * @property {YAHOO.widget.Tab} tab
         */
        this.tab = new YAHOO.widget.Tab(this.options.tabOptions);
	},
	
	/**
	 * This method should be overridden by any child class that has content for
	 * the top part of the layout.
	 * 
	 * @method buildContentTop
	 * @return {HTMLElement || null} The built element or null if there's nothing
	 * on the top.
	 */
	buildContentTop : function() { },
	
	/**
     * This method should be overridden by any child class that has content for
     * the left part of the layout.
     * 
     * @method buildContentLeft
     * @return {HTMLElement || null} The built element or null if there's nothing
     * on the left.
     */
	buildContentLeft : function() { },
	
	/**
     * This method should be overridden by any child class that has content for
     * the center part of the layout.  This method should probably be overridden
     * because the center is the main part of the layout.
     * 
     * @method buildContentCenter
     * @return {HTMLElement || null} The built element or null if there's nothing
     * on the center.
     */
	buildContentCenter : function() { },
	
	/**
     * This method should be overridden by any child class that has content for
     * the right part of the layout.
     * 
     * @method buildContentRight
     * @return {HTMLElement || null} The built element or null if there's nothing
     * on the right.
     */
	buildContentRight : function() { },
	
	/**
     * This method should be overridden by any child class that has content for
     * the bottom part of the layout.
     * 
     * @method buildContentBottom
     * @return {HTMLElement || null} The built element or null if there's nothing
     * on the bottom.
     */
	buildContentBottom : function() { },
	
	/**
	 * This method is similar to createButton, except that it creates a split button.
	 * See the documentation for createButton for most of the options.  The new
	 * options are menu, which should be an array of objects that have "label",
	 * "clickFn", and "clickFnScope."
	 * 
	 * @method createSplitButton
	 * @return {YAHOO.widget.Button} The created button.
	 */
	createSplitButton : function(options) {
		var scope = options.clickFnScope || this;
		
		// Set up menu from options
		var menu = [];
		if(!options.menu) options.menu = [];
		for(var i = 0; i < options.menu.length; i++) {
			menu.push({
				text: options.menu[i].label || "Menu",
				value: i + 1,
				onclick: {
					fn: options.menu[i].clickFn,
					scope: options.menu[i].clickFnScope || scope
				}
			});
		}
		
		// Set up button
		var id = options.label || "Button";
		var label = id;
		if(options.img) {
			label = "<img src='" + options.img
			 + "' class='buttonImg' /><span class='buttonImgTxt'>" + label
			 + "</span>";
		}
		
		var config = {
            type: "split",
            label: label,
            menu: menu,
            id: options.id || this.options.id + "-" + id.split(' ').join('') + "Button",
            container: options.container || this.options.idTop
        };
        config.name = config.id;
        
        if(options.clickFn) {
        	config.onclick = { fn: options.clickFn, scope: scope };
        }
        
		var button = new YAHOO.widget.Button(config);
		
		// Add CSS class, if in this.options
        if(this.options.buttonClass) {
            //button.addClass(this.options.buttonClass);
        }
        
        return button;
	},
	
	/**
	 * This method is a helper method for children to create a button in the toolbar.
	 * See wfeditor.util.createButton documentation.
	 * 
	 * @method createButton
	 * @param {Object} options See wfeditor.util.createButton documentation.
	 * @return {YAHOO.widget.Button} See wfeditor.util.createButton documentation.
	 */
	createButton : function(options) {
		// Set some useful defaults for perspectives
		if(!options.id) {
			var id = options.label || "Button";
			options.id = this.options.id + "-" + id.split(' ').join('') + "Button";
		}
		if(this.options.buttonClass && !options.buttonClass) {
			options.buttonClass = this.options.buttonClass;
		}
		if(!options.container) {
			options.container = this.options.idTop;
		}
		if(!options.clickFnScope) {
			options.clickFnScope = this;
		}
		
		return wfeditor.util.createButton(options);
	},
	
	
	/************************ RENDERING METHODS ************************/
    /* These methods are run AFTER the perspective is instantiated     */
    /* (i.e., the HTML has been built).  They build and render the YUI */
    /* objects that are used to render interactive, dynamic content.   */
    /*******************************************************************/
	
	/**
	 * This method renders the perspective.  It is called AFTER the HTML content
	 * has been built (buildContent()).  It should probably be overridden by any
	 * children classes (but the children MUST still call this implementation in their
	 * overridden method).  It first creates and renders the YUI layout, and then
	 * creates and sets up the WireIt layer.
	 * 
	 * @method render
	 */
	render: function() {
		// Build and render the layout
		/**
		 * This property holds the YUI layout for this perspective.  It is built
		 * to render in this.options.id with layout options given in
		 * this.options.layoutOptions.
		 * 
		 * @property {YAHOO.widget.Layout} layout
		 */
        this.layout = new YAHOO.widget.Layout(this.options.id, this.options.layoutOptions);
		this.layout.render();
		
		this.layout.on('beforeResize', this.editor.resizeTabs, this.editor, true);
		
		// Upload layer options and build
		this.options.layerOptions.parentEl = YAHOO.util.Dom.get(this.options.layerOptions.parentEl);
		
		/**
		 * This property holds the WireIt layer for this perspective.  It is built
		 * with layer options given in this.options.layerOptions.
		 * 
		 * @property {WireIt.Layer} layer
		 */
        this.layer = new WireIt.Layer(this.options.layerOptions);
        this.layer.editor = this;
		
		// Watch the layer for changes
		this.layer.eventChanged.subscribe(this.onLayerChanged, this, true);
	},
	
	
	/************************** LAYER METHODS **************************/
    /* These methods are related to interacting with the WireIt Layer  */
    /* (the execution canvas).                                         */
    /*******************************************************************/
	
	/**
     * This method is the event handler for when something on the layer changes.
     * The default implementation does nothing.  It should be overridden by children
     * classes IF they care about layer changing events.
     * 
     * @method onLayerChanged
     */
	onLayerChanged : function() { },
	
	
	/*************************** TAB METHODS ***************************/
    /* These methods are related to handling tab events.               */
    /*******************************************************************/
    
    /**
     * This method is called whenever this perspective is selected in the parent
     * WorkflowEditor's tab view.
     * It should be overridden by any child class that cares about this event.
     * 
     * @method onTabSelected
     * @prevTabIndex the index of the tab that was selected before the switch happened.
     */
    onTabSelected : function(prevTabIndex) {
    	// If it's okay, do some resizing magic..
    	if(YAHOO.env.ua.ie > 0) {
    		this.layout.resize();
    	}

        // Show wait panel
        this.showWait();
        
        this.preventLayerChangedEvent = true;

        if(prevTabIndex != null) {
            var prevPerspective = this.editor.perspectives[prevTabIndex];
            // Set properties
            this.setProperties(prevPerspective.getPropertiesValue());
            // Copy containers and wires: do in each perspective (controll "readonly" or not)

            // Set other properties
            this.setInitialRootWorkflowName(prevPerspective.initialRootWorkflowName);
            this.isRootWorkflow = prevPerspective.isRootWorkflow;
            this.canvasReadOnly = prevPerspective.canvasReadOnly;
            this.composepermission = prevPerspective.composepermission;
            this.executepermission = prevPerspective.executepermission;
            
            if(prevPerspective.isSaved()) {
                this.markSaved();
            } else {
                this.markUnsaved();
            }
    
            this.setModuleCounter(prevPerspective.moduleCounter);
            if(prevPerspective.workflowId != null && prevPerspective.workflowId != "") {
                this.setWorkflowId(prevPerspective.workflowId);
            }
            this.workflowName = prevPerspective.workflowName;
        }

        this.preventLayerChangedEvent = false;
        
        // Hide wait panel
        this.hideWait();
    },
    
    /**
     * This method is called whenever this perspective is unselected in the parent
     * WorkflowEditor's tab view.  In other words, if the tab is selected and then
     * another tab is selected.
     * It should be overridden by any child class that cares about this event.
     * 
     * @method onTabSelected
     */
    onTabUnselected : function() { },
    
    /**
     * This method is called when the parent WorkflowEditor's resizeTabs
     * method is called.  The child classes can override this method if they
     * want to do something on this event.
     * 
     * @method onTabResized
     */
    onTabResized : function() { },
    
    
    /********************* WORKFLOW CHOOSER METHODS ********************/
    /* These methods are related to the workflow chooser on the side.  */
    /*******************************************************************/
    
    /**
     * This method is called whenever the user switches which workflow is opened
     * using the chooser on the left.
     * It should be overridden by children.
     * 
     * @method onWorkflowChanged
     * @param {Object} newWorkflow
     */
    onWorkflowChanged : function(newWorkflow) { 
        // Show wait panel
        this.showWait();
        
        this.preventLayerChangedEvent = true;

        // Set properties
        this.setProperties(newWorkflow.properties);

        // Copy containers and wires: do in each perspective (controll "readonly" or not)

        // Set other fields
        this.setInitialRootWorkflowName(newWorkflow.initialRootWorkflowName);
        this.isRootWorkflow = newWorkflow.isRootWorkflow;
        this.canvasReadOnly = newWorkflow.canvasReadOnly;
        this.composepermission = newWorkflow.composepermission;
        this.executepermission = newWorkflow.executepermission;

        if(newWorkflow.markSaved) {
            this.markSaved();
        } else {
            this.markUnsaved();
        }

        this.setModuleCounter(newWorkflow.moduleCounter);
        if(newWorkflow.workflowId != null && newWorkflow.workflowId != "") {
            this.setWorkflowId(newWorkflow.workflowId);
        }
        this.workflowName = newWorkflow.workflowName;

        this.preventLayerChangedEvent = false;
        
        // Hide wait panel
        this.hideWait();
    },
    
    /**
     * This method preserves the properties.
     * 
     * @method setProperties
     * @properties the workflow's properties.
     */
    setProperties: function(properties) {
        this.properties = properties;
    },

    /**
     * This method returns the workflow's name.
     * 
     * @method getName
     */
    getName: function() {
        return this.WorkflowName;
    },
    
    /**
     * This method returns the properties value.
     * 
     * @method getPropertiesValue
     */
    getPropertiesValue: function() {
        return this.properties;
    },
    
    /**
     * This method returns whether this workflow is saved or not.
     * 
     * @method isSaved
     */
    isSaved: function() {
        return this.saved;
    },

    /**
     * This method marks the workflow as "saved."
     * 
     * @method markSaved
     */
    markSaved: function() {
        this.saved = true;
    },
    
    /**
     * This method marks the workflow as "unsaved."
     * 
     * @method markUnsaved
     */
    markUnsaved: function() {
        this.saved = false;
    },

    /**
     * This method returns the initialRootWorkflowName.
     * 
     * @method getInitialRootWorkflowName
     */
    getInitialRootWorkflowName: function() {
        return this.initialRootWorkflowName;
    },

    /**
     * This method sets the initialRootWorkflowName.
     * 
     * @method setInitialRootWorkflowName
     * @param name The name of rootworkflow when it is loaded or created.
     */
    setInitialRootWorkflowName: function(name) {
        this.initialRootWorkflowName = name;
    },

    /**
     * This method returns the workflow's id on the canvas.
     * 
     * @method getWorkflowId
     */
    getWorkflowId: function() {
        return this.workflowId;
    },

    /**
     * This method sets the workflow's id on the canvas.
     * 
     * @method setWorkflowId
     * @param name The id of rootworkflow when it is loaded or created.
     */
    setWorkflowId: function(id) {
        this.workflowId = id;
    },

    /**
     * This method returns the workflow's current moduleCounter.
     * 
     * @method getModuleCounter
     */
    getModuleCounter: function() {
        return this.moduleCounter;
    },

    /**
     * This method sets the moduleCounter of the workflow on the canvas.
     * 
     * @method setModuleCounter
     * @param ctr The moduleCounter of workflow.
     */
    setModuleCounter: function(ctr) {
        this.moduleCounter = ctr;
    },
    
    /**
     * This method returns the currently set name for the workflow on the canvas.
     * 
     * @method getName
     * @return {String} The currently set name for the workflow.
     */
    getName: function() {
        return this.workflowName;
    },
    
    
    
    /************************ CANVAS API METHODS ***********************/
    /* These methods are related to the API to the middle tier for     */
    /* providing access to changing the visual appearnce of the canvas.*/
    /*******************************************************************/
    
    /**
     * This method is available to the backend.  It highlights the container on
     * the canvas with the given color.
     * 
     * @method highlightService
     * @param {Number} serviceModuleId The module ID of the service to highlight.
     * @param {String} color The color to highlight the service.
     */
    highlightService: function(serviceModuleId, color) {
    	if(serviceModuleId >= 0 && serviceModuleId < this.layer.containers.length) {
    		var container = this.layer.containers[serviceModuleId];
    		container.bodyEl.style.backgroundColor = color;
    	}
    },
    
    /**
     * This method is available to the backend.  It highlights the port with the
     * given name on the container on the canvas with the given color.
     * 
     * @method highlightPort
     * @param {Number} serviceModuleId The module ID of the service to highlight.
     * @param {String} portName The name of the port to highlight.
     * @param {String} color The color to highlight the service.
     */
    highlightPort: function(serviceModuleId, portName, color) {
    	if(serviceModuleId >= 0 && serviceModuleId < this.layer.containers.length) {
            var container = this.layer.containers[serviceModuleId];
            var term;
            for(var i = 0; i < container.terminals.length; i++) {
            	term = container.terminals[i];
            	if(term.options.name == portName) {
            		term.el.style.backgroundColor = color;
            		break;
            	}
            }
        }
    },
    
    /**
     * This method is available to the backend.  It turns on error highlighting on
     * the port with the given name on the container on the canvas.
     * 
     * @method errorHighlightPort
     * @param {Number} serviceModuleId The module ID of the service to highlight.
     * @param {String} portName The name of the port to highlight.
     */
    errorHighlightPort: function(serviceModuleId, portName) {
        if(serviceModuleId >= 0 && serviceModuleId < this.layer.containers.length) {
            var container = this.layer.containers[serviceModuleId];
            var term;
            for(var i = 0; i < container.terminals.length; i++) {
                term = container.terminals[i];
                if(term.options.name == portName) {
                    term.setErrorHighlight(true);
                    break;
                }
            }
        }
    },
    
    /**
     * This method is available to the backend.  It clears all the highlights on the services
     * and ports in this perspective.  It resets the containers' backgrounds to white and the
     * ports' backgrounds to transparent.
     * 
     * @method clearHighlights
     */
    clearHighlights: function() {
    	var container;
    	var term;
    	for(var i = 0; i < this.layer.containers.length; i++) {
    		container = this.layer.containers[i];
    		container.bodyEl.style.backgroundColor = "";
    		
    		for(var j = 0; j < container.terminals.length; j++) {
    			term = container.terminals[j];
    			term.el.style.backgroundColor = "transparent";
    			term.setErrorHighlight(false);
    		}
    	}
    },
    

    /************************ DRILLDOWN METHODS **************************/
    /* These methods are related to the workflow drilldown.              */
    /*********************************************************************/
    
    /**
     * This method is called when the user drilled down a workflow on the canvas.
     * 
     * @method drillDownWorkflow
     * @arg uniqueId: the workflow's uniqueId
     *      originalWorkflowId: the workflow's originalWorkflowId (set when drag-and-dropped)
     */
    drillDownWorkflow: function(arg) {
        this.editor.newChildWorkflowTab( {
            openWorkflowIndex: this.editor.openWorkflowsList.getIndex(),
            workflowId: arg.uniqueId,
            canvasReadOnly: this.canvasReadOnly
        });

        // Show wait panel
        this.showWait();
        this.editor.adapter.getWorkflowByIds(arg, {
            success: this.drillDownWorkflowSuccess,
            scope: this
        });
    },

    /**
     * This method is a callback when the backend process of drilldown succeeded.
     * 
     * @method drillDownWorkflowSuccess
     * @result the workflow's information from backend
     */
    drillDownWorkflowSuccess: function(result) {
        this.loadWorkflow(result);
    },

    /**
     * This method loads the workflow on canvas. Used when loading/drilling down.
     * 
     * @method loadWorkflow
     * @result the workflow's information in json format
     */
    loadWorkflowCommon: function(result, readonly) {
        // Show wait panel
        this.showWait();
        
        // Temporary flag to ignore "layer changed" events.
        this.preventLayerChangedEvent = true;

        // Clear the layer, workflow properties, and package name.
        this.layer.clear();

        var workflow = result.working;

        // Set properties
        this.setProperties(workflow.properties);
        
        // Add the containers
        this.addModulesAndWiresToLayer([workflow, readonly]);

        // Add modules to openWorkflows
        var idx = this.editor.openWorkflowsList.getIndex();
        var wf = this.editor.openWorkflows.getOpenWorkflow(idx);
        wf.modules = workflow.modules;
        // Add wires to openWorkflows
        wf.wires = workflow.wires;

        this.preventLayerChangedEvent = false;
        
        // Resizing the package container if needed.
        if(this.packageContainer != null) {
            this.packageContainer.onLayerChanged();
        }

        // Hide wait panel
        this.hideWait();
    },

    /**
     * This method is called to copy the modules/wires on the layer (canvas).
     * 
     * @method addModulesAndWiresToLayer
     * @arg arg: an array of workflow (with modules/wires) and readOnly flag
     */
    addModulesAndWiresToLayer: function(arg) {
        // Clear the layer
        this.layer.clear();

        workflow = arg[0];
        readonly = arg[1];
        // Add modules
        if(YAHOO.lang.isArray(workflow.modules)) {
            for(var i = 0; i < workflow.modules.length; i++) {
                var m = workflow.modules[i];
                
                // Get the module from the parent object's list of modules, if it's there.
                var baseContainerConfig = {};
                if(this.editor.modulesByName[m.name]) {
                    // Get the "base" configuration for the container from the list of modules...
                    var baseContainerConfig = this.editor.modulesByName[m.name].container;
                }
                    
                // ...then augment it with the configuration stored in the workflow.
                YAHOO.lang.augmentObject(m.config, baseContainerConfig); 
                m.config.title = m.name;
                m.config.originalWorkflowId = m.originalWorkflowId;
                m.config.uniqueId = m.uniqueId;
                m.config.type = m.type;
                m.config.userServiceName = m.userServiceName;
                    
                // Add the container to the layer.
                var container = wfeditor.util.addContainer(m.config, this.layer, readonly);
                YAHOO.util.Dom.addClass(container.el,
                this.options.containerClassPrefix + "-" + (m.name.split(' ').join('')));
                container.setValue(m.value);
            }
        }

        // Add the wires
        if(YAHOO.lang.isArray(workflow.wires)) {
            for(var i = 0; i < workflow.wires.length; i++) {
                // I don't know what this comment is saying -- it was from WireIt -- but
                // it looks sophisticated so I'm leaving it :P
                // On doit chercher dans la liste des terminaux de chacun des modules l'index des terminaux...
                this.layer.addWire(workflow.wires[i]);
            }
        }
    },

    /**
     * This method is called when the user drilled down a service on the canvas.
     * 
     * @method drillDownWorkflow
     * @arg url: the service's url
     */
    drillDownService: function(arg) {
        this.editor.newChildWorkflowTab( {
            openWorkflowIndex: this.editor.openWorkflowsList.getIndex(),
            canvasReadOnly: true
        });

        // Show wait panel
        this.showWait();
        this.editor.adapter.getWorkflowByURL(arg, {
            success: this.drillDownWorkflowSuccess,
            scope: this
        });
    }        
};
