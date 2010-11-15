/**
 * The compose perspective is the GUI object that handles workflow composition.
 * It closely follow's WireIt's "WiringEditor" class but does not directly inherit
 * from it.
 * 
 * @class ComposePerspective
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
 */
wfeditor.ComposePerspective = function(options, editor) {
	/**
	 * This property holds the instantiated palette for the perspective.
	 * 
	 * @property palette
	 * @type {wfeditor.Palette}
	 */
	this.palette = null;

    // Used for unique workflow id of new workflows    
    this.globalCounter = 0;
    this.packageChangedFlg = false;
    
    /**
     * Data creator widget.
     * 
     * @property dataCreator
     * @type {wfeditor.DataCreator}
     */
    this.dataCreator = null;

	// Call parent constructor.
	wfeditor.ComposePerspective.superclass.constructor.call(this, options, editor);
};

YAHOO.lang.extend(wfeditor.ComposePerspective, wfeditor.Perspective, {
	
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
			options.title = "Compose";
		}

        // Call parent setOptions.
		wfeditor.ComposePerspective.superclass.setOptions.call(this, options);
		
		
		/* TOP OPTIONS */
		
		// Set layout's top unit options to defaults.
		// Used to instantiate the YUI layout.
		this.options.topUnitOptions = options.topUnitOptions || {};
		YAHOO.lang.augmentObject(this.options.topUnitOptions, {
			height: '40px',
			gutter: '5px'
		});
		
		
		/* LEFT OPTIONS */
		
		// Set layout's left unit options to defaults.
        // Used to instantiate the YUI layout.
		this.options.leftUnitOptions = options.leftUnitOptions || {};
        YAHOO.lang.augmentObject(this.options.leftUnitOptions, {
            width: '215px',
            resize: true,
            gutter: '5px',
            collapse: true,
            collapseSize: 25,
            header: 'Palette',
            scroll: true,
            animate: true
        });
		
		// Set the drag-and-drop group that is used to drag-and-drop a module onto the
		// layer (canvas).
		this.options.ddModuleGroup = options.ddModuleGroup || "module";
		
		// Palette xtype.
		this.options.paletteXtype = "wfeditor.Palette";
		
		
		/* CENTER OPTIONS */
		
		// Set layout's center unit options to defaults.
        // Used to instantiate the YUI layout.
		this.options.centerUnitOptions = options.centerUnitOptions || {};
        YAHOO.lang.augmentObject(this.options.centerUnitOptions, {
            gutter: '5px'
        });
        
        // Set the ID and image of the center icon.
        // Used to display the "package" icon above the canvas.
        this.options.idCenterIcon = options.idCenterIcon || this.options.idCenter + "Icon";
        this.options.centerIcon = options.centerIcon || "../images/icons/application_go.png";
        
        // Set the ID of the center title.
        // Used to display the workflow name above the canvas in the "package" border.
        this.options.idCenterTitle = options.idCenterTitle || this.options.idCenter + "Title";
        
        // Set the ID of the package container
        this.options.idPackageContainer = options.idPackageContainer || this.options.idCenter + "PackageContainer";
        
        // Set the layer options.
        // Used to instantiate the WireIt Layer.
        this.options.layerOptions.packageEl = this.options.idCenter;
        this.options.layerOptions.layerMap = true;
        
        // The prefix for the class name to add to the containers.
        // It will be the prefix + the name of the module (without spaces).
        this.options.containerClassPrefix = options.containerClassPrefix || "WiringEditor-module";
        
        
        /* RIGHT OPTIONS */
        
        // Set layout's right unit options to defaults.
        // Used to instantiate the YUI layout.
        this.options.rightUnitOptions = options.rightUnitOptions || {};
        YAHOO.lang.augmentObject(this.options.rightUnitOptions, {
            width: '250px',
            resize: true,
            gutter: '5px',
            collapse: true,
            header: 'Properties',
            scroll: true,
            animate: true
        });
        
        // Set the id of the accordion.
        // Used to build and render the AccordionView.
        this.options.idRightAccordian = options.idRightAccordian || this.options.idRight + "Accordian";
        
        // Set the accordion properties.
        // Used to instantiate the AccordionView.
        this.options.accordionViewParams = options.accordionViewParams || {};
        YAHOO.lang.augmentObject(this.options.accordionViewParams, {
            collapsible: true,
            expandable: true, // remove this parameter to open only one panel at a time
            width: 'auto',
            expandItem: 0,
            animationSpeed: '0.3', 
            animate: true, 
            effect: YAHOO.util.Easing.easeBothStrong
        });
        
        // Set the id of the <divs> that hold the service and workflow properties
        this.options.idServiceProperties = options.idServiceProperties || this.options.id + "ServiceProperties";
        this.options.idWorkflowProperties = options.idWorkflowProperties || this.options.id + "WorkflowProperties";
        
        // Set the fields that are shown in the workflow properties.
        // Used to instantiate the inputEx form group.
        this.options.propertiesFields = options.propertiesFields || [
        	{"type": "string", inputParams: {"name": "name", label: "Title", typeInvite: "Enter a title", maxLength: 255, regexp: /^[\w\d\s\._]*$/ } },
            {"type": "text", inputParams: {"name": "description", label: "Description", cols: 30, rows: 4, typeInvite: "Enter a description"} }
        ];
        
        this.options.nPropertiesFields = this.options.propertiesFields.length;
        
        this.options.idDataProperties = options.idDataProerties || this.options.id + "DataProperties";
	},
	
	/**
	 * Builds and returns the HTML content for the top part of the layout.
	 * Overrides the parent class.
	 * 
	 * @method buildContentTop
	 * @return {HTMLElement} The top element to be used in the layout.
	 */
	buildContentTop : function() {
		// Create top <div> element.
        var top = WireIt.cn("div", {id: this.options.idTop});
        
        // Create new button
        this.createButton({
            label: "New",
            img: '../images/buttons/new.png',
            clickFn: this.onClickNew
        });
        
        // Create open button
        this.openButton = this.createSplitButton({
        	label: "Open",
        	img: '../images/buttons/open.png',
        	clickFn: this.onClickOpen,
        	menu: [
        	   {label: "Open and Replace", clickFn: this.onClickOpenReplace}
        	]
        });
        
        // Create save button
        /**
         * Save button.  We keep a reference to it so that we can update it when
         * the workflow is saved and unsaved.
         *
         * @property saveButton
         * @type YAHOO.widget.Button
         */
        this.saveButton = this.createSplitButton({
        	label: "Save",
        	img: "../images/buttons/save.png",
        	clickFn: this.onClickSave,
        	menu: [
        	   {label: "Save As", clickFn: this.onClickSaveAs},
        	   {label: "Save All", clickFn: this.onClickSaveAll}
        	]
        });
        
        // Create close button
        this.createSplitButton({
            label: "Close",
            clickFn: this.onClickClose,
            img: "../images/buttons/close.png",
            menu: [
               {label: "Close and Replace", clickFn: this.onClickCloseReplace},
               {label: "Close All", clickFn: this.onClickCloseAll}
            ]
        });
        
        // Create delete button
        this.deleteButton = this.createSplitButton({
            img: "../images/buttons/delete.png",
            label: 'Delete',
            clickFn: this.onClickDelete,
            menu: [
               {label: "Delete and Replace", clickFn: this.onClickDeleteReplace}
            ]
        });
        
        // Create validate button
        this.validateButton = this.createButton({
            label: "Validate",
            img: '../images/buttons/validate.png',
            clickFn: this.onValidateClick
        });
        
        // Create new Undo
        this.undoButton = this.createButton({
            label: "Undo",
            img: '../images/buttons/undo.png',
            clickFn: this.onClickUndo
        });
        this.undoButton.set("disabled", true);
        var undo = this.undoButton;
        
        // Create new Redo
        this.redoButton = this.createButton({
            label: "Redo",
            img: '../images/buttons/redo.png',
            clickFn: this.onClickRedo
        });
        this.redoButton.set("disabled", true);
        var redo = this.redoButton;
        
        // Subscribe to undo/redo available events
        this.editor.commandStack.onCanUndo.subscribe(function(type, args) {
            undo.set("disabled", !args[0]);
        });
        this.editor.commandStack.onCanRedo.subscribe(function(type, args) {
            redo.set("disabled", !args[0]);
        });
        
        // Create top slider HTML.
        // See YUI slider documentation for more.
        var slider = WireIt.cn("div", {
            id: "slider-bg",
            className: "yui-h-slider",
            tabindex: "-1",
            title: "Zoom Slider"});
        var sliderThumb = WireIt.cn("div", {id: "slider-thumb", className: "yui-slider-thumb"});
        sliderThumb.appendChild(WireIt.cn("img", {
            src: "../wireit-lib/yui/slider/assets/thumb-n.gif"}));
        slider.appendChild(sliderThumb);
        top.appendChild(slider);
        
        // Create top slider buttons
        var temp = WireIt.cn("div", {id: "zoom-out-button"});
        var zoomButton = WireIt.cn("img", {src: "../images/zoom_out.png", title: "Zoom Out"});
        YAHOO.util.Event.addListener(zoomButton, "click", function(e) {
        	this.zoomSlider.setValue(this.zoomSlider.getValue() + 25);
        }, this, true);
        temp.appendChild(zoomButton);
        top.appendChild(temp);
        
        temp = WireIt.cn("div", {id: "zoom-in-button", title: "zoom-in"});
        zoomButton = WireIt.cn("img", {src: "../images/zoom_in.png", title: "Zoom In"});
        YAHOO.util.Event.addListener(zoomButton, "click", function(e) {
            this.zoomSlider.setValue(this.zoomSlider.getValue() - 25);
        }, this, true);
        temp.appendChild(zoomButton);
        top.appendChild(temp);
        
        temp = WireIt.cn("div", {id: "zoom-reset-button"});
        zoomButton = WireIt.cn("img", {src: "../images/zoom_reset.png", title: "Reset Zoom"});
        YAHOO.util.Event.addListener(zoomButton, "click", function(e) {
            this.zoomSlider.setValue(100);
        }, this, true);
        temp.appendChild(zoomButton);
        top.appendChild(temp);
        
        return top;
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
		
		// We will instantiate the palette later...
		
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
		// Create the center <div> element
		var center = WireIt.cn("div", {id: this.options.idCenter});
		
		// Create the center icon
		var icon = WireIt.cn("div", {id: this.options.idCenterIcon});
		icon.appendChild(WireIt.cn("img", {src: this.options.centerIcon}));
		center.appendChild(icon);
		
		// Create the center title
		center.appendChild(WireIt.cn("div", {id: this.options.idCenterTitle}, null, "New Workflow"));
		
		// Create the center layer -- just build the container for now, we will
		// instantiate it later.
		center.appendChild(WireIt.cn("div", {id: this.options.idLayer}));
		
		return center;
	},
	
    /**
     * Builds and returns the HTML content for the right part of the layout.
     * Overrides the parent class.
     * 
     * @method buildContentRight
     * @return {HTMLElement} The right element to be used in the layout.
     */
	buildContentRight : function() {
		// Create the right <div> element
		var right = WireIt.cn("div", {id: this.options.idRight});
		
		// Create the accordion -- just build the container for now, we will
		// instantiate it later.
		var accordian = WireIt.cn("ul", {id: this.options.idRightAccordian});
		
		// Create the minimap -- just build the container for now, we will
		// instantiate it later.
		var li = WireIt.cn("li");
		li.appendChild(WireIt.cn("h2", null, null, "Minimap"));		
		var temp = WireIt.cn("div", null, {position: 'relative'});		
		temp.appendChild(WireIt.cn("div", {id: this.options.idLayerMap}));
		li.appendChild(temp);
		accordian.appendChild(li);
		
		// Create the service properties
		li = WireIt.cn("li");
		li.appendChild(WireIt.cn("h2", null, null, "Service Properties"));
		temp = WireIt.cn("div");
		temp.appendChild(WireIt.cn("div", {id: this.options.idServiceProperties}, null,
		      "Click on a component to show extra properties."));
		li.appendChild(temp);
		accordian.appendChild(li);
		
		// Create the workflow properties -- just build the container for now, we
		// will instantiate it later.
		li = WireIt.cn("li");
		li.appendChild(WireIt.cn("h2", null, null, "Workflow Properties"));
		temp = WireIt.cn("div");
		temp.appendChild(WireIt.cn("div", {id: this.options.idWorkflowProperties}));
		li.appendChild(temp);
		accordian.appendChild(li);
		
		// ADDED BY NINA //
		// Create the data properties -- just build the container for now, we
		// will instantiate it later.
		li = WireIt.cn("li");
		li.appendChild(WireIt.cn("h2", null, null, "Data Properties"));
		temp = WireIt.cn("div");
		temp.appendChild(WireIt.cn("div", {id: this.options.idDataProperties}));
		li.appendChild(temp);
		accordian.appendChild(li);
		
		right.appendChild(accordian);
		return right;
	},
	
	
	/************************ RENDERING METHODS ************************/
    /* These methods are run AFTER the perspective is instantiated     */
    /* (i.e., the HTML has been built).  They build and render the YUI */
    /* objects that are used to render interactive, dynamic content.   */
    /*******************************************************************/
	
	/**
     * Renders the content in this perspective, after it has been built.
     * Overrides the parent class.
     * In the compose perspective, it builds the palette tree, the properties
     * accordion, packaging drag-and-drop target, zoom slider, and it overrides
     * the layer's addWire method to account for the packaging.
     * 
     * @method render
     */
	render: function() {
		// Call the parent class.
        wfeditor.ComposePerspective.superclass.render.call(this);
        
        // Do CSS magic to get split buttons to show up properly
        this.layout.getUnitByPosition("top").addClass("hasSplitButtons");
        
        // "Hack" the layout clip to add text when it's collapsed
        wfeditor.util.hackLayoutClip(this.layout, 'left',
            this.options.leftUnitOptions.header);
        wfeditor.util.hackLayoutClip(this.layout, 'right',
            this.options.rightUnitOptions.header);
        
        // Instantiate the palette with callbacks
        var callbacks = {
        	makeModuleEl: this.makeModuleElCallback,
        	makeModuleElScope: this,
        	search: this.searchCallback,
        	searchScope: this,
        	categorize: this.categorizeCallback,
        	categorizeScope: this,
        	favorites: this.favoritesCallback,
        	favoritesScope: this
        };
        
        var paletteType = eval(this.options.paletteXtype);
        this.palette = new paletteType(callbacks, {
        	id: this.options.idLeft
        });
        
        // Instantiate properties accordion.
        /**
         * Accordion view widget for the properties.
         * 
         * @property accordionView
         * @type {YAHOO.widget.AccordionView}
         */
        this.accordionView = new YAHOO.widget.AccordionViewExt(
            this.options.idRightAccordian, this.options.accordionViewParams);
            
        // Open the three panels.
        this.accordionView.openPanel(0);
        this.accordionView.openPanel(1);
        this.accordionView.openPanel(2);
        this.accordionView.openPanel(3);
            
        // Make the layer a drag drop target for the "modules" group.
        /**
         * Drag-and-drop canvas of the layer to drop a module on.
         * 
         * @property ddTarget
         * @type {YAHOO.util.DDTarget}
         */
        this.ddTarget = new YAHOO.util.DDTarget(this.layer.el, this.options.ddModuleGroup);
        this.ddTarget._layer = this.layer;
        
        // Do not instantiate the workflow properties form here: do that in updateTags.
        
        // Instantiate the zoom slider.
        /**
         * The slider widget that controls the zooming of the canvas.
         * 
         * @property zoomSlider
         * @type {YAHOO.widget.Slider}
         */
        this.zoomSlider = new YAHOO.widget.Slider.getHorizSlider('slider-bg',
            'slider-thumb', 0, 200, 20); // go from 0 - 200 in increments of 20
        this.zoomSlider.setValue(100); // Start out in the middle        
        this.zoomSlider.getRealValue = function() {
            return (200 - this.getValue()) / 100;
        };
        
        // When the zoom slider is movd, scale the layer with the given value.
        this.zoomSlider.subscribe("change", function(offsetFromStart) {
            var val = this.zoomSlider.getRealValue();
            if(val == 0) { // Having 0 screws things up...
                val = 0.00001;
            }
            this.scaleLayer(val);
        }, this, true);
        
        /**
         * Instantiate the Data Uploader
         */
         
        this.dataCreator = new wfeditor.DataCreator(this.options.idDataProperties, {});
        
        // Get rid of the border around the compose "package"
        // -- in the future, find a more elegant way to do this...
        var tempEl = YAHOO.util.Dom.getAncestorByClassName(
            YAHOO.util.Dom.get(this.options.idCenter), "yui-layout-bd");
        WireIt.sn(tempEl, null, {border: 'none'});
        
        // Set up layer for packaging
        this.layer.exposedTerminals = {
            inputs: [],
            outputs: []
        };
        
        // Override the layer's add wire method.
        this.layer.oldAddWire = this.layer.addWire;
        this.layer.addWire = function(wire) {
            this.editor.overrideAddWire(wire);
        };
        
        // Watch for resize events from the layer
        YAHOO.util.Event.addListener(this.layer.el, "resize", this.onLayerResize, this, true);
        
        /**
         * This is our "packaging container."  It handles the exposed ports and
         * wires.
         * 
         * @property packageContainer
         * @type {wfeditor.PackageContainer}
         */
        this.packageContainer = new wfeditor.PackageContainer({
        	elId: this.options.idPackageContainer
        }, this.layer);
        this.packageContainer.eventAddWire.subscribe(this.layer.onAddWire, this.layer, true);
        this.packageContainer.eventRemoveWire.subscribe(this.layer.onRemoveWire, this.layer, true);
        this.packageContainer.onLayerChanged();
        
        this.packageContainer.onPackageChanged.subscribe(function() {this.packageChangedFlg = true;}, this, true);
        
        // Subscribe to the add and remove wire functions
        this.layer.eventRemoveWire.subscribe(this.onRemoveWire, this, true);
    },
    
    
    /*************************** TAB METHODS ***************************/
    /* These methods are related to handling tab events.               */
    /*******************************************************************/

    /**
     * This method is called whenever this perspective is selected in the parent
     * WorkflowEditor's tab view.  It overrides the parent's method.
     * It updates the layer to reflect the latest workflow.
     * 
     * @method onTabSelected
     */
    onTabSelected : function(prevTabIndex) {
        // Call parent class
        wfeditor.ComposePerspective.superclass.onTabSelected.call(this, prevTabIndex);
        
        // Show wait panel
        this.showWait();
        
        this.preventLayerChangedEvent = true;

        if(prevTabIndex != null) {
            // Get the previous tab's perspective
            var prevPerspective = this.editor.perspectives[prevTabIndex];
            // To copy containers/wires, we will use either "previous tab's containers" or "openWorkflows"
            // This depends on whether the previous tab's workflow is opened in compose perspective at least once.
            var idx = this.editor.openWorkflowsList.getIndex();
            var workflow = this.editor.openWorkflows.getOpenWorkflow(idx);
            if(workflow.wires.length > 0) {
                var wire = workflow.wires[0];
                if(wire.terminal1 != null) {
                    wfeditor.util.copyContainersWires(this.editor, workflow.containers, workflow.wires, this.layer, this.canvasReadOnly);
                } else {
                    wfeditor.ComposePerspective.superclass.addModulesAndWiresToLayer.call(this, [workflow,this.canvasReadOnly]);
                }
            }
        }
        
        this.preventLayerChangedEvent = false;

        // Hide wait panel
        this.hideWait();
    },

    /**
     * See Perspective.onTabResized.  We tell the package container to resize
     * itself...
     * 
     * @method onTabResized
     */
    onTabResized : function() {
    	this.packageContainer.onLayerChanged();
    },
    
    
    /************************* "NEW" METHODS ***************************/
    /* These methods are related to when the user clicks "new."        */
    /*******************************************************************/
    
    /**
     * This method is called when the user clicks the "new" button.
     * It checks whether the workflow is saved and opens a new workflow in a
     * new tab.
     * 
     * @method onClickNew
     */
    onClickNew: function() {
        this.editor.newWorkflowTab();
    },
    
    /**
     * This method is called when the user clicks the undo button.
     * 
     * @method onClickUndo
     */
    onClickUndo : function() {
    	this.editor.getCommandStack().undo();
    },
    
    /**
     * This method is called when the user clicks the redo button.
     * 
     * @method onClickRedo
     */
    onClickRedo : function() {
    	this.editor.getCommandStack().redo();
    },
    
    
    /************************* "OPEN" METHODS **************************/
    /* These methods are related to when the user clicks "open."       */
    /*******************************************************************/
    
    /**
     * This method is called when the user clicks "open."
     * 
     * @method onClickOpen
     */
    onClickOpen: function() {
        // Check if it's a completely blank workflow.  This will be the same as
        // an "open and replace".
        if(this.getName() == "" && this.isSaved()) {
            this._loadWorkflow();
            return;
        }
        
        this.editor.newWorkflowTab();
        this._loadWorkflow();
    },
    
    /**
     * This method is called when the user clicks the "open and replace" button.
     * It checks whether the workflow is saved and then calls the parent
     * WorkflowEditor to have it communicate with the backend.  It passes the
     * "onLoadSuccess" method as a callback when the loading is completed.
     * Based on WireIt.WiringEditor.load
     * 
     * @method onClickOpenReplace
     */
    onClickOpenReplace: function() {
        if(!this.isRootWorkflow) {
            // TODO
            alert('save as is not allowed except for the root workflow');
        } else {
            // Check if it's unsaved or not
            if(!this.isSaved()) {
                this.confirm({
                	msg: "Your workflow is not saved!  Do you want to continue?",
                	onYes: this._loadWorkflow,
                	scope: this
                });
            } else {
                this._loadWorkflow();
            }
        }
    },
    
    /**
     * This is a helper function for the callbacks for loading.
     * 
     * @method _loadWorkflow
     */
    _loadWorkflow: function() {
    	// Tell the editor to handle the actual loading, and call the
        // "onLoadSuccess" method on this object when it's done.
        this.editor.loadWorkflow(this.onLoadSuccess, this);
    },
    
    /**
     * This method is the callback from the parent WorkflowEditor object when it
     * is done communicating with the backend and has loaded the workflows.
     * The workflow that the user has selected to load is passed in to this function.
     * Then the containers and wires are added to the canvas.
     * 
     * @method onLoadSuccess
     * @param {Object} workflow The loaded workflow.  It should have properties,
     * modules, and wires.
     */
    onLoadSuccess: function(result) {
    	// Show wait panel
    	this.showWait();
        this.initialRootWorkflowName = result.name;
        this.isRootWorkflow = true;
        this.markSaved();
        this.moduleCounter = result.moduleCounter;
        this.workflowId = result.workflowId;
        this.workflowName = result.name;
        this.composepermission = result.composepermission;
        this.executepermission = result.executepermission;
        if(this.composepermission == "READ") {
            if(this.propertiesForm != null) {
                this.propertiesForm.disable();
            }
            this.saveButton.set("disabled", false);
            this.deleteButton.set("disabled", true);
            this.validateButton.set("disabled", false);
            this.canvasReadOnly = true;
        } else {
            if(this.propertiesForm != null) {
                this.propertiesForm.enable();
            }
            this.saveButton.set("disabled", false);
            this.deleteButton.set("disabled", false);
            this.validateButton.set("disabled", false);
            this.canvasReadOnly = false;
        }

        // Call the parent's method (common functionality for both load and drill down)
        this.loadWorkflow(result);

        // Hide wait panel
        this.hideWait();
    },

    /**
     * This method loads the workflow on canvas. Used when loading/drilling down.
     * Just call the superclass function with appropriate "readonly" mode.
     * 
     * @method loadWorkflow
     * @result the workflow's information in json format
     */
    loadWorkflow: function(result) {
        wfeditor.ComposePerspective.superclass.loadWorkflowCommon.call(this, result, this.canvasReadOnly);
    },

    /**
     * This method preserves the properties as well as set the value to the
     * properties form and update the package name.
     * 
     * @method setProperties
     * @properties the workflow's properties.
     */
    setProperties: function(properties) {
        wfeditor.ComposePerspective.superclass.setProperties.call(this, properties);
        
        if(this.propertiesForm) {
            this.propertiesForm.setValue(properties, false); // the false tells inputEx to NOT fire the updatedEvt
            this.updatePackageName();
        }
    },
    
    /**
     * This method will validate that the name of the workflow to be saved is a valid one. A valid
     * workflow name has a length of maximum 255 characters, is not empty, and has only letters,
     * numbers, space, . and _ characters.
     * 
     * @method validateName
     * @param {String} strName The name of the workflow to validate.
     * @return true when the name is valid, false otherwise.
     */
    validateName : function(strName) {
    	// We check we have a value.
    	if (!strName) {
    		return false;
    	}
    	
    	// We check that the type is string.
    	if (typeof strName != "string") {
    		return false;
    	}

        // We check that the length is less that 255
    	if (strName.length < 1 || strName.length > 255) {
    	   this.error("The name of the workflow cannot be empty or longer than 255 characters.",
               "Invalid name.");
    		return false;
    	}

        // And then we check the data.

        /*
	     * The list of valid characters for the name are letter, number, spaces, . and _
	     * Any other character should be marked as invalid.
	     */
	    var re=/[^\w\d\s\._]/g
	    var charsFound = strName.match(re);
	    
	    /*
	     * When we find invalid characters we will send a message to the user and end the
	     * operation.
	     */
	    if (charsFound != null && charsFound.length > 0) {
	        this.error("The characters in the name are not valid. Valid characters " +
	           "include: Letters and numbers, spaces, period (.) " +
	           "and underscode (_) characters.",
	           "Invalid name.");
	        return false;
	    }
	    
	    return true;
    },

    /**
     * This method will remove any quot mark from the description of the properties of a worklfow
     * for apostrophes.
     * 
     * @method sanitizeDescription
     */
    sanitizeDescription : function() {
    	// We get the current value of description.
        var props = this.propertiesForm.getValue();
        var description = props.description;
        
        // If the description has a "
        if (description.match(/"/g)) {
            // We replace the " for a '
            props.description = description.replace(/"/g, "'");
            // Set the new value back to the properties.
            this.propertiesForm.setValue(props, false);
        }
    },
    
    /************************* "SAVE" METHODS **************************/
    /* These methods are related to when the user clicks "save."       */
    /*******************************************************************/
    
    /**
     * This method is called when the user clicks the "save" button.
     * It checks that the workflow has a name, and then sends it to the backend
     * to save.
     * Based on WireIt.WiringEditor.onSave
     * 
     * @method onClickSave
     */
    onClickSave: function() {
        if(!this.isNewWorkflow()) {
            if(this.composepermission == "READ") {
                alert("you are not allowed to update this workflow!");
            } else {
                this._onClickSave();
            }
        } else {
            this._onClickSave();
        }
    },

    /**
     * This method is a helper function for onClickSave() that does most of the actual
     * work.
     * 
     * @method _onClickSave
     */
    _onClickSave: function() {
        var name = this.getName();
        
        // if this is a child workflow, this shouldn't happen
        if(name == "") {
            var that = this;
            var props = this.propertiesForm.getValue();
            
            this.prompt({
                msg: "Cannot save a workflow with no name!  Please enter one:",
                callback: function(value) {
                    props.name = value;
                    that.propertiesForm.setValue(props, false);
                    that.updatePackageName();
                    that._onClickSave();
                }
            });
        } else {
        	// We validate the name, if for some reason is invalid (false) we stop saving (return).
        	if (!this.validateName(name)) {
        		return;
        	}
        	
        	// We now sanitize the description string, replace " for '
        	this.sanitizeDescription();

            // If the workflow is "new", then need to re-assign the ids
            // using the new name for this workflow.
            if(this.isNewWorkflow()) {
                this.assignIdsForWorkflows();
            }

            var tempParentSavedWiring = {};
            if(!this.isRootWorkflow && this.packageChangedFlg) {
                // check which ports/fields are exposed
                var wires = this.layer.wires;
                var inputPorts = [];
                var outputPorts = [];
                var fields = [];
                var fieldValues = {};
                
                for(var i = 0; i < wires.length; i++) {
                    var container = null;
                    var isField = null;
                    var name = null;
                    if(!wires[i].terminal1.options.name) {
                        container = wires[i].terminal2.container;
                        isField = wires[i].terminal2.isField;
                        name = wires[i].terminal2.options.name;
                    } else if(!wires[i].terminal2.options.name) {
                        container = wires[i].terminal1.container;
                        isField = wires[i].terminal1.isField;
                        name = wires[i].terminal1.options.name;
                    } else {
                        continue;
                    }

                    if(isField) {
                        for(var j = 0; j < container.options.fields.length; j++) {
                            if(container.options.fields[j].inputParams.name == name) {
                                fields.push(container.options.fields[j]);
                                fieldValues[name] = container.getValue()[name];
                                break;
                            }
                        }
                    } else {
                        var input = false;
                        for(var j = 0; j < container.options.inputPorts.length; j++) {
                            if(container.options.inputPorts[j].name == name) {
                                input = true;
                                inputPorts.push(container.options.inputPorts[j]);
                                break;
                            }
                        }
                        if(!input) {
                            for(var j = 0; j < container.options.outputPorts.length; j++) {
                                if(container.options.outputPorts[j].name == name) {
                                    outputPorts.push(container.options.outputPorts[j]);
                                    break;
                                }
                            }
                        }
                    }
                }

                // get the parent
                var listWorkflowIndex = this.editor.openWorkflows.getListWorkflowIncludeIndex(
                    this.editor.openWorkflowsList.getIndex());
                var listWorkflow = listWorkflowIndex.listWorkflow;
                var index = listWorkflowIndex.index;
                var parentWorkflow = listWorkflow.workflows[index - 1];
                
                // container update
                var containers = parentWorkflow.containers;
                for(var i = 0; i < containers.length; i++) {
                    if(containers[i].options.uniqueId == this.getWorkflowId()) {
                        containers[i].options.inputPorts = inputPorts;
                        containers[i].options.outputPorts = outputPorts;
                        containers[i].options.fields = fields;
                        var value = {};
                        for(var k = 0; k < fields.length; k++) {
                            value[fields[k].inputParams.name] = fieldValues[fields[k].inputParams.name];
                        }
                        containers[i].value = value;
                        break;
                    }
                }
                
                // wire update
                var newWires = [];
                for(var i = 0; i < parentWorkflow.wires.length; i++) {
                    if(parentWorkflow.wires[i].terminal1.container != null) {
                        if(parentWorkflow.wires[i].terminal1.container.options.uniqueId == this.getWorkflowId()) {
                            continue;
                        }
                    }
                    if(parentWorkflow.wires[i].terminal2.container != null) {
                        if(parentWorkflow.wires[i].terminal2.container.options.uniqueId == this.getWorkflowId()) {
                            continue;
                        }
                    }
                    newWires.push(parentWorkflow.wires[i]);
                }
                parentWorkflow.wires = newWires;
                
                // create tempParentSavedWiring to persistent the parent workflow in the database
                var parentValue = wfeditor.util.getValue(
                    parentWorkflow.containers, parentWorkflow.wires,
                    parentWorkflow.properties);
                tempParentSavedWiring.workflowId = parentWorkflow.workflowId;
                tempParentSavedWiring.working = YAHOO.lang.JSON.stringify(parentValue.working);
                tempParentSavedWiring.language = this.options.languageName;
            }

            // Get the current workflow
            var value = this.getValue();

            // Make a "wiring" in a language that the backend is expecting.
            var tempSavedWiring = {
                workflowId: this.getWorkflowId(),
                moduleCounter: this.getModuleCounter(),
                isNewWorkflow: this.isNewWorkflow(),
                name: value.name,
                workingObj: value.working,
                working: YAHOO.lang.JSON.stringify(value.working),
                language: this.options.languageName
            };

            // Show wait panel
            this.showWait();

            this.editor.adapter.saveWorkflow([tempSavedWiring, tempParentSavedWiring], {
                success: function(msg) {
                	// Parse the JSON object from the msg string.
                	msg = YAHOO.lang.JSON.parse(msg);
                	
                    // Update the properties as necessary
                    if(this.isRootWorkflow) {
                        this.setInitialRootWorkflowName(this.getName());
                    }
                    this.setModuleCounter(msg.moduleCounter);
                    this.composepermission = "DELETE";
                    this.executepermission = "EXECUTE";
                    this.saveButton.set("disabled", false);
                    this.deleteButton.set("disabled", false);
                    this.validateButton.set("disabled", false);

                    // If the canvas is readonly, after saving, it needs to be editable.
                    if(this.canvasReadOnly == true) {
                        this.canvasReadOnly = false;
                        var copyContainerWires = wfeditor.util.makeCopyContainersWires(
                                this.layer.containers,
                                this.layer.wires
                            );
                        var containers = copyContainerWires.containers;
                        var wires = copyContainerWires.wires;
                        wfeditor.util.copyContainersWires(
                            this.editor, containers, wires, 
                            this.layer, this.canvasReadOnly);
                        this.propertiesForm.enable();
                        this.updatePackageName();
                    }

                    this.markSaved();
                    this.packageChangedFlg = false;
                    
                    if(msg.module) {
                    	// Add to modules list in WorkflowEditor
                    	this.editor.modules.push(msg.module);
                    	this.editor.modulesByName[value.name] = msg.module;
                    	
                    	// Add to palette
                    	this.palette.addModuleToList(msg.module);
                    }
                    
                    // Hide wait panel
                    this.hideWait();

                  //  this.info("Saved workflow '" + value.name + "'!", "Save Successful");
                },
                scope: this
            });
        }
    },

    /**
     * Re-assign the id following the naming convention:
     * "login user name" + "_" + "workflow's name" + "_" + counter
     * 
     * @method assignIdsForWorkflows
     */
    assignIdsForWorkflows: function() {
        this.moduleCounter = this.getDefaultModuleCounter();
        this.workflowId = this.editor.getUser() + "_" + this.getName() + "_" + this.getModuleCounterAndIncrement();
        for(var i = 0; i < this.layer.containers.length; i++) {
            if(this.layer.containers[i].options.type == "workflow") {
                this.layer.containers[i].options.uniqueId = this.generateUniqueWorkflowId(this.getName());
            }
        }
    },
    
    /**
     * This method is called when the user clicks "save as."  It prompts the user
     * for the new name and then makes the appropriate calls to save the
     * workflow.
     * 
     * @method onClickSaveAs
     */
    onClickSaveAs: function() {
        if(!this.isRootWorkflow) {
            // TODO
            alert('Save as is not allowed except for the root workflow');
        } else {
            var that = this;
            var props = this.propertiesForm.getValue();
            this.prompt({
                msg: "Please enter new workflow name:",
                callback: function(value) {
                    props.name = value;
                    that.propertiesForm.setValue(props, false);
                    that.updatePackageName();
                    that.onClickSave();
                },
                value: props.name
            });
        }
    },
    
    /**
     * This method is called when the user clicks "save all."  It saves all
     * open workflows.
     * 
     * @method onClickSaveAll
     */
    onClickSaveAll: function() {
    	// TODO
        alert('save all');
    },
    
    /**
     * This method marks the workflow as "saved."
     * 
     * @method markSaved
     */
    markSaved: function() {
        wfeditor.ComposePerspective.superclass.markSaved.call(this);
        this.saveButton.removeClass('unsaved');
    },
    
    /**
     * This method marks the workflow as "unsaved."
     * 
     * @method markUnsaved
     */
    markUnsaved: function() {
        wfeditor.ComposePerspective.superclass.markUnsaved.call(this);
        this.saveButton.addClass('unsaved');
    },

    /**
     * This method returns whether the workflow that's currently on the canvas is
     * saved or not.  It becomes unsaved as soon as the user makes any changes.
     * 
     * @method isSaved
     * @return {boolean} True if saved, false if unsaved.
     */
    isSaved: function() {
        return !this.saveButton.hasClass('unsaved');
        //return this.editor.checkSavedState();
    },
    
    
    /************************ "CLOSE" METHODS **************************/
    /* These methods are related to when the user clicks "close."     */
    /*******************************************************************/
    
    /**
     * This method is called when the user clicks "close."  It first checks
     * whether the workflow is currently saved (and confirms with the user if it
     * isn't) and then calls the WorkflowEditor's "onCloseWorkflowTab" method.
     * 
     * @method onClickClose
     */
    onClickClose: function() {
    	if(!this.isSaved()) {
    		this.confirm({
    			msg: "The workflow is not currently saved!  Are you sure you want to close it?",
    			onYes: this.editor.onCloseWorkflowTab,
    			scope: this.editor
    		})
    	} else {
    		this.editor.onCloseWorkflowTab();
    	}
    },
    
    /**
     * This method is called when the user clicks "close and replace".  It first
     * checks wehter the workflow is currently saved (and confirms with the user
     * if it isn't) and then clears the workflow.
     * 
     * @method onClickReplace
     */
    onClickCloseReplace: function() {
        if(!this.isRootWorkflow) {
            // TODO
            alert('save as is not allowed except for the root workflow');
        } else {
            if(!this.isSaved()) {
            	this.confirm({
                    msg: "The workflow is not currently saved!  Are you sure you want to close it?",
                    onYes: this.clearWorkflow,
                    scope: this
            	});
            } else {
            	this.clearWorkflow();
            }
        }
    },
    
    /**
     * Clears the currently displayed workflow.
     * 
     * @method clearWorkflow
     */
    clearWorkflow: function() {
    	this.preventLayerChangedEvent = true;
    	
    	this.layer.clear(); 
    	this.propertiesForm.clear(false); // false to tell inputEx to NOT send the updatedEvt
    	this.markSaved();
    	this.updatePackageName();
    	this.preventLayerChangedEvent = false;
    	this.editor.getCommandStack().clearAll();
    },
    
    /**
     * This method is called when the user clicks "close all."  It closes all
     * open workflows.
     * 
     * @method onClickCloseAll
     */
    onClickCloseAll: function() {
    	// TODO
        alert('close all');
    },
    
    
    /************************ "DELETE" METHODS *************************/
    /* These methods are related to when the user clicks "delete."     */
    /*******************************************************************/
    
    /**
     * This method is called when the user clicks delete.  It first confirms
     * with the user, and then makes the appropriate calls to delete the
     * workflow.
     * 
     * @method onClickDelete
     */
    onClickDelete: function() {
        if(this.composepermission != "DELETE") {
            alert("you are not allowed to delete this workflow!");
        } else {
            var that = this;
            this.confirm({
                msg: "Are you sure you want to delete this workflow?",
                onYes: function() {
                    that._delete(true);
                }
            });
        }
    },
    
    /**
     * This method is called when the user clicks "delete and replace."  It first
     * first confirms with the user, and then makes the appropriate calls to
     * delete the workflow.
     * 
     * @method onClickDeleteReplace
     */
    onClickDeleteReplace: function() {
        if(this.composepermission != "DELETE") {
            alert("you are not allowed to delete this workflow!");
        } else {
            this.confirm({
                msg: "Are you sure you want to delete this workflow?",
                onYes: this._delete,
                scope: this
            });
        }
    },
    
    /**
     * This is a helper method for deleting a workflow.  It makes the relevant calls
     * to the backend and handles the callbacks.
     * 
     * @method _delete
     * @param {boolean} closeTab True if you also want to close the currently
     * opened tab.
     */
    _delete: function(closeTab) {
        // Show wait panel
        this.showWait();

        // Call the backend.
        this.editor.adapter.deleteWiring({workflowId: this.getWorkflowId()}, {
    	 success: function(result) {
              var workflowName = this.getName();
              
              // Clear the canvas/tab
              if(closeTab) {
               this.editor.onCloseWorkflowTab();
              } else {
               this.clearWorkflow();
              }
              
              // Find the module that corresponds to the workflow
              var module;
              var cat;
              var found = false;
              var i;
              for(i = 0; !found && i < this.editor.modules.length; i++) {
                  module = this.editor.modules[i];
                  for(var j = 0; !found && j < module.category.length; j++) {
                      cat = module.category[j];
                      if(cat.categoryKey == "TopCategory" && cat.labelText == "Workflows") {
                          if(module.name == workflowName) {
                              found = true;
                          }
                      }
                  }
              }
              
              if(found) {
                  // Remove module from modules list
                  this.editor.modules.splice(i, 1);
                  
                  // Remove module element from palette
                  this.palette.removeModuleElement(module.elId);
              }
              
              // Hide wait panel
              this.hideWait();
              if(!workflowName) {
                  this.info("Deleted workflow! This workflow did not have any given name!", "Delete Successful");
              } else {
                  this.info("Deleted workflow '" + workflowName + "'!", "Delete Successful");
              }
          },
            scope: this
        });
    },
    
 
    /************************ "VALIDATE" METHODS ***********************/
    /* These methods are related to when the user clicks "validate."   */
    /*******************************************************************/
    
    /**
     * This method is called when the user clicks the "validate" button.
     * It checks if the workflow is saved or not, then calls the backend through the
     * adapter.  It gives the "validateWorkflowCallback" as a callback method for
     * if the validation succeeded.  If it failed, it displays an error message
     * to the user.
     * 
     * @method onValidateClick
     */
    onValidateClick: function() {
        // We verify that there's something on the canvas.
        if (YAHOO.lang.isUndefined(this.layer.containers) || this.layer.containers.length < 1) {
            this.error("No workflow loaded, please load a workflow first to validate it.",
                "Validation Error");
            return;
        }

        if(!this.isSaved()) {
            this.error("Cannot validate an unsaved workflow!<br />Please save first.", "Validation Error");
            return;
        }
        
        // Show wait panel
        this.showWait();
        
        var workflowId = this.getWorkflowId();
        this.editor.adapter.validateWorkflow(workflowId, {
            success: this.validateWorkflowCallback,
            scope: this
        });
    },
    
    /**
     * This method is the callback method tht is called if the validation was
     * successful.  Right now it just shows an "okay" message to the user.
     * 
     * @method validateWorkflowCallback
     */
    validateWorkflowCallback: function(o) {
    	// Hide wait panel
    	this.hideWait();
    	
    	this.okay("This workflow is syntactically valid!", "Syntactic Check Passed!");
    },
    
    
    /************************ PALETTE METHODS **************************/
    /* These methods are related to the palette.                       */
    /*******************************************************************/
    
    /**
     * See Palette.updateModules.
     * 
     * @method updateModules
     * @param {Array} modules The new modules.
     */
    updateModules : function(modules) {
    	this.palette.updateModules(modules);
    },
    
    /**
     * This method will set a user's favorites.
     * 
     * @method updateFavorites
     * @param {Array} favorites the user's favorites to set.
     */
    updateFavorites : function(favorites) {
    	this.palette.updateFavorites(favorites);
    },
    
    /**
     * This method is a callback for the palette's "makeModuleEl" method.  It makes
     * the module a drag-and-drop element and ass the module CSS class to it.
     * 
     * @method makeModuleElCallback
     * @param {Object} module The module that the element was created for.
     * @param {HTMLElement} el The created element.
     */
    makeModuleElCallback : function(module, el) {
        // Make the module a drag-and-droppable thing
        YAHOO.util.Dom.addClass(el, this.options.containerClassPrefix);
        var ddProxy = new WireIt.ModuleProxy(el, this);
        ddProxy._module = module;
    },
    
    /**
     * This method is a callback for the palette's "favorites" method.  It calls
     * the appropriate method on the backend to let it know that the user's
     * marked favorites have changed.
     * 
     * @method favoritesCallback
     * @param {Array} favorites
     */
    favoritesCallback : function(favorites) {
    	this.editor.adapter.userSetFavorites(favorites);
    },
    
    /**
     * This method is a callback for the palette's "search" method.  It calls
     * the appropriate method on the backend to update the servies with the
     * given search and categorization parameters.
     * 
     * @method searchCallback
     * @param {Object} filterKey The search key.
     * @param {Array} categorizeKey The categorization key.
     */
    searchCallback : function(filterKey, categorizeKey) {
    	// Show "waiting" panel
        this.showWait();
        
        // Do call to backend
        this.editor.adapter.searchServices(filterKey, categorizeKey, {
            success: function(jsonString) {
                jsonString = wfeditor.util.replaceHTMLChars(jsonString)
                var jsonVar = YAHOO.lang.JSON.parse(jsonString);             
//                var jsonVar = eval('(' + jsonString + ')');                
                jsonVar.language = jsonVar.language || this.options.languageName;
                this.editor.parseLanguage(jsonVar);
                
                // Hide "waiting" panel
                this.hideWait();
            },
            scope: this
        });
    },
    
    /**
     * This method is a callback for the palette's "categorize" method.  It calls
     * the appropriate method on the backend to update the services with the
     * given search and categorization parameters.
     * 
     * @method categorizeCallback
     * @param {Object} filterKey The search key.
     * @param {Array} categorizeKey The categorization key.
     */
    categorizeCallback : function(filterKey, categorizeKey) {
    	// Show "waiting" panel
    	this.showWait();
        
        // Do call to backend
        this.editor.adapter.getReorganizedServices(filterKey, categorizeKey, {
            success: function(jsonString) {
                jsonString = wfeditor.util.replaceHTMLChars(jsonString)
                var jsonVar = YAHOO.lang.JSON.parse(jsonString);             
//                var jsonVar = eval('(' + jsonString + ')');                
                jsonVar.language = jsonVar.language || this.options.languageName;
                this.editor.parseLanguage(jsonVar);

                // Hide "waiting" panel
                this.hideWait();
            },
            scope: this
        });
    },
    
    
    /************************ PROPERTIES METHODS ***********************/
    /* These methods are related to interacting with the properties    */
    /* (minimap, service properties, workflow properties).             */
    /*******************************************************************/
    
    /**
     * This method is called by the parent WorkflowEditor object when it receives
     * updated tag information from the backend.  It also updates the workflow properties
     * form and the search form.
     * 
     * @method updateTags
     * @param {Array} jsonTags The list of tags.
     */
    updateTags : function(jsonTags) {
    	// Clear out old properties fields
    	this.options.propertiesFields = this.options.propertiesFields.slice(0, this.options.nPropertiesFields);
        YAHOO.util.Dom.get(this.options.idWorkflowProperties).innerHTML = "";
    	
        for(var i in jsonTags){
            var jsonTag = jsonTags[i];
            var category = jsonTag.semanticTypeCategory;
            for(var j in jsonTag.semanticTypes) {
                var sT = jsonTag.semanticTypes[j];
                //var element = wfeditor.util.makeCheckboxField("Tag: " + category, sT, j == 0);
                var element = wfeditor.util.makeCheckboxField(category, sT, j == 0);
                this.options.propertiesFields.push(element);
            }
        }

        // Instantiate the workflow properties form.
        /**
         * inputEx form that holds the workflow properties.
         * 
         * @property propertiesForm
         * @type {inputEx.Group}
         */
        this.propertiesForm = new inputEx.Group({
            parentEl: YAHOO.util.Dom.get(this.options.idWorkflowProperties),
            fields: this.options.propertiesFields
        });
        
        // When the workflow properties are changed by the user, mark the workflow
        // unsaved and update the name over the canvas.
        this.propertiesForm.updatedEvt.subscribe(this.markUnsaved, this, true);
        this.propertiesForm.updatedEvt.subscribe(this.updatePackageName, this, true);
        
        // Watch for changes for the undo/redo system
        this.oldValue = this.propertiesForm.getValue();
        this.propertiesForm.updatedEvt.subscribe(this.onPropertiesUpdated, this, true);
        
        this.palette.updateTags(jsonTags);
    },
    
    /**
     * This method should be called when the data projects/categories have been
     * updated from the backend.
     * 
     * @method updateDataProjects
     * @param {Object} projects The data projects.
     */
    updateDataProjects : function(projects) {
    	this.dataCreator.updateProjects(projects);
    },
    
    /**
     * This method should be called when the data types have been updated from the backend.
     * 
     * @method updateDataTypes
     * @param {Array} types The data types.
     */
    updateDataTypes : function(types) {
        this.dataCreator.updateTypes(types);
    },
    
    
    /************************** LAYER METHODS **************************/
    /* These methods are related to interacting with the WireIt Layer  */
    /* (the composition canvas).                                       */
    /*******************************************************************/
    
    /**
     * This method is called when the user chanes the zoom factor for the
     * layer (canvas).  It scales all the containers through their setScale method
     * and then redraws all the wires.
     * 
     * @method scaleLayer
     * @param {real} scaleFactor The factor to scale by.  1.0 is the "normal" scale
     * factor, 2.0 is double the size, etc.
     */
    scaleLayer: function(scaleFactor) {
    	// If the scale factor is the same, we don't need to do anything.
        if(this.layer.scaleFactor && this.layer.scaleFactor == scaleFactor) {
            return;
        }
        
        this.layer.scaleFactor = scaleFactor;
        
        // Scale containers
        for(var i = 0; i < this.layer.containers.length; i++) {
            if(this.layer.containers[i].setScale) {
                this.layer.containers[i].setScale(scaleFactor);
            } else {
            	// This shouldn't happen..!
                this.warn('Container ' + i + ' doesn\'t have setScale method!', "You shouldn't see this warning!");
            }
        }
        
        // Redraw wires
        for(var i = 0; i < this.layer.wires.length; i++) {
            this.layer.wires[i].redraw();
        }
        
        // Tell package container that the layer has changed
        this.packageContainer.onLayerChanged();
    },
    
    /**
     * This function is called whenever the user drags and drops a module onto the
     * layer (canvas).  It gets the container configuration from the module and adds
     * it to the layer (canvas).  See WireIt.Layer.addContainer.
     * Based on WireIt.WiringEditor.addModule
     * 
     * @method addModule
     * @param {Object} module The module that has been dragged-and-dropped.
     * @param {Object} pos The position that the module has been dropped.
     */
    addModule: function(module, pos) {
        var command = new wfeditor.command.CommandAddService(this, module, pos);
        this.editor.getCommandStack().execute(command);
    },
    
    /**
     * This function is the private method that is invoked by the CommandAddService command.
     * 
     * @method _addModule
     * @param {Object} module See addModule documentation.
     * @param {Object} pos See addModule documentation.
     * @param {wfeditor.command.CommandAddService} command The command that is executing.
     */
    _addModule : function(module, pos, command) {
    	try {
            // Get the container configuration and update it
            var containerConfig = module.container;
            containerConfig.position = pos;
            containerConfig.title = module.name;
            // assign uniqueId in temporal unique id field. in Service.setOptions,
            // see this field and check if this module is added to the canvas
            // by "drag and drop" or "loaded from backend".
            if(containerConfig.type == "workflow") {
                containerConfig.temporalUniqueId = this.generateUniqueWorkflowId();
            }

            // Add the container to the layer
            var container = this.layer.addContainer(containerConfig);
                        
            YAHOO.util.Dom.addClass(container.el,
                "WiringEditor-module-"+module.name.split(' ').join(''));
                        
            // update the size based on the current scale factor, if any
            if(this.layer.scaleFactor && this.layer.scaleFactor != 1) {
                if(container.setScale) {
                    container.setScale(this.layer.scaleFactor, false);
                } else {
                    // shouldn't happen
                    this.warn("Container doesn't have a setScale method!");
                }
            }
            
            // Update the command
            if(command) {
            	command.container = container;
            }
        } catch(ex) {
            // this shouldn't happen...
            this.error("Error Layer.addContainer: " + ex.message);
        }
    },
    
    /**
     * This method is the event handler for when something on the layer changes.
     * Right now all we do is mark the workflow as unsaved.
     * Based on WireIt.WiringEditor.onLayerChanged
     * 
     * @method onLayerChanged
     */
    onLayerChanged: function() {
        if(!this.preventLayerChangedEvent) {
            this.markUnsaved();
        }
    },
    
    
    /************************ PACKAGING METHODS ************************/
    /* These methods are related to interacting with the properties    */
    /* (minimap, service properties, workflow properties).             */
    /*******************************************************************/
    
    /**
     * This method calls updatePackWithName with the name that's currently set in
     * the workflow properties form.
     * 
     * @method updatePackageName
     */
    updatePackageName : function() {
    	this.updatePackageWithName(this.getName());
    },
    
    /**
     * This method updates the name that's displayed in the packaging border above
     * the layer (canvas).
     * 
     * @method updatePackageWithName
     * @param {String} name The name to set in the package title.
     */
    updatePackageWithName: function(name) {
    	if(name == null || name == "") {
    		name = "New Workflow";
    	}
    	var title = name;
    	if(this.canvasReadOnly == true) {
    	    title = title + " (read only)";
    	}
        var nameEl = YAHOO.util.Dom.get(this.options.idCenterTitle);
        nameEl.innerHTML = title;
        
        // callback to let the editor know that the name changed
        this.editor.onWorkflowNameChanged(name);
    },
    
    /**
     * This method is used to override the WireIt.Layer.addWire method.  We check
     * if the new wire is used for packaging.  If it is, we create a new package
     * terminal (on the packaging border) and create a wire connecting the two
     * terminals.  If it's not a packaging wire, we just call the original addWire
     * method.
     * 
     * @method overrideAddWire
     * @param {Object} wire The configuration for wire that's been added.
     */
    overrideAddWire: function(wire) {
        var src = wire.src;
        var tgt = wire.tgt;
                
        // Check if the "source" is -1, which only happens if this is a special
        // packaging wire.
        if(src.moduleId == -1) {
        	var term = null;
        	
        	// Find the terminal on the other end
        	if(YAHOO.lang.isUndefined(tgt.terminal)) {
        		// it's a field wire
        		term = this.layer.containers[tgt.moduleId].getFieldTerminal(tgt.field);
        	} else {
        	    // it's a port wire
                term = this.layer.containers[tgt.moduleId].getTerminal(tgt.terminal);
        	}
            
            // Create a new packaging terminal (and proxy) on the package border
            var layerTerm = this.packageContainer.addPackageTerminal(term, {});
            
            var parentEl = term.parentEl.parentNode;
            if(term.container) {
                parentEl = term.container.layer.el;
            }
            
            // Create a new wire between the package terminal and the target terminal.
            var w = new WireIt.Wire(layerTerm, term, parentEl,
                layerTerm.options.wireConfig);
                
            // Draw the wire.
            w.redraw();
            
            return w;
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
        	// It's not a packaging or field wire, so call the old method.
        	return this.layer.oldAddWire(wire);
        }
    },
    
    
    /************************* BACKEND METHODS *************************/
    /* These methods are related to interacting with the backend.      */
    /*******************************************************************/
    
    /**
     * This method returns the currently set name for the workflow on the canvas.
     * 
     * @method getName
     * @return {String} The currently set name for the workflow.
     */
    getName: function() {
    	return this.propertiesForm.getValue().name;
    },
    
    /**
     * This method gets the value of the currently composed workflow on the canvas.
     * It builds it into an object that can be understood by the backend.
     * Based on WireIt.WiringEditor.getValue
     * 
     * @method getValue
     * @return {Object} The value of the currently composed workflow.  Includes
     * name and "working", which contains modules, wires, and properties.
     */
    getValue: function() {
        return wfeditor.util.getValue(
            this.layer.containers,
            this.layer.wires,
            this.propertiesForm.getValue());
    },

    /********************* WORKFLOW CHOOSER METHODS ********************/
    /* These methods are related to the workflow chooser on the side.  */
    /*******************************************************************/
    
    /**
     * This method is called whenever the user switches which workflow is opened
     * using the chooser on the left.  It overrides the parent method.
     * 
     * @method onWorkflowChanged
     * @param {Object} newWorkflow
     */
    onWorkflowChanged : function(newWorkflow) {
        
        // Set canvasReadOnly: this flag is used when we set the properties, as it is reflected
        // to the workflow's title, which needs to be appended "readonly" when it is true
        this.canvasReadOnly = newWorkflow.canvasReadOnly;

        wfeditor.ComposePerspective.superclass.onWorkflowChanged.call(this, newWorkflow);

        // Show wait panel
        this.showWait();
        
        this.preventLayerChangedEvent = true;
        
        // Set containers and wires
        var wires = newWorkflow.wires;
        if(wires.length > 0) {
            var wire = wires[0];
            if(wire.terminal1 != null) {
                wfeditor.util.copyContainersWires(this.editor, newWorkflow.containers, newWorkflow.wires, this.layer, newWorkflow.canvasReadOnly);
            } else {
                wfeditor.ComposePerspective.superclass.addModulesAndWiresToLayer.call(
                this, [newWorkflow, this.canvasReadOnly]);
            }
        } else {
            wfeditor.util.copyContainersWires(this.editor, newWorkflow.containers, newWorkflow.wires, this.layer, newWorkflow.canvasReadOnly);
        }

        if(!this.isRootWorkflow) {
            if(this.canvasReadOnly) {
                // service drill down
                this.deleteButton.set("disabled", true);
                this.saveButton.set("disabled", true);
                this.validateButton.set("disabled", true);
                if(this.propertiesForm != null) {
                    this.propertiesForm.disable();
                }
            } else {
                // workflow drill down
                this.deleteButton.set("disabled", true);
                this.saveButton.set("disabled", false);
                this.validateButton.set("disabled", true);
                if(this.propertiesForm != null) {
                    this.propertiesForm.disable();
                }
            }
        } else {
            // root workflow: affected only by permission
            this.saveButton.set("disabled", false);
            if(this.composepermission == "READ" || this.composepermission == "UPDATE") {
                this.deleteButton.set("disabled", true);
            } else {
                this.deleteButton.set("disabled", false);
            }
            this.validateButton.set("disabled", false);
            if(this.propertiesForm != null) {
                if(this.composepermission == "READ") {
                    this.propertiesForm.disable();
                } else {
                    this.propertiesForm.enable();
                }
            }
        }

        if(newWorkflow.workflowId != null && newWorkflow.workflowId != "") {
            // Once after the new workflow is created or existing workflow is loaded,
            // it is assigned a workflow id, which is carried over while the user is
            // working on the workflow.
            this.setWorkflowId(newWorkflow.workflowId);
        } else {
            var workflowId = this.editor.getUser() + "_" + this.initialRootWorkflowName
               + "_" + this.getModuleCounterAndIncrement();
            this.setWorkflowId(workflowId);
        }

        this.preventLayerChangedEvent = false;
        
        // Hide wait panel
        this.hideWait();
    },

    /**
     * This method returns the value in the properties form.
     * 
     * @method getPropertiesValue
     */
    getPropertiesValue: function() {
        return this.propertiesForm.getValue();
    },

    /**
     * This method returns true when the workflow on canvas is a new workflow.
     * When we first load the workflow (or create a new workflow), it stores
     * the root workflow's name as "initialRootWorkflowName".
     * If getName() is equal to the stored name, the workflow is an existing one.
     * Otherwise it is a new workflow.
     * 
     * @method isNewWorkflow
     */
    isNewWorkflow: function() {
        if(this.isRootWorkflow) {
            if(this.initialRootWorkflowName != this.getName()) {
                return true;
            }
            return false;
        } else {
            if(this.initialRootWorkflowName != this.workflowName) {
                return true;
            }
            return false;
        }
    },

    /**
     * This method returns the workflow's current moduleCounter, and
     * increment the counter for the next use.
     * 
     * @method getModuleCounterAndIncrement
     */
    getModuleCounterAndIncrement: function() {
        var returnvalue = this.moduleCounter;
        this.moduleCounter++;
        return returnvalue;
    },

    /**
     * This method returns the global counter of all the workflows in
     * openWorkflowsList, and increment the counter for the next use.
     * This counter is used when assigning a default name for the workflow
     * when the workflow is created by "New".
     * 
     * @method getGlobalCounterAndIncrement
     */
    getGlobalCounterAndIncrement: function() {
        var returnvalue = this.globalCounter;
        this.globalCounter++;
        return returnvalue;
    },

    /*
     * Generate the unique workflow id using login user, rootWorkflowName,
     * and moduleCounter.
     * Need to increment the module counter after we assign workflow id.
     */    
    generateUniqueWorkflowId: function(name) {
        var workflowName = name || this.initialRootWorkflowName;
        return this.editor.getUser() + "_" + workflowName
                       + "_" + this.getModuleCounterAndIncrement();
    },
    
    /*
     * The module starts from 0 as default.
     */
    getDefaultModuleCounter: function() {
        return 0;
    },

    /*
     * The default name of root workflow is DEFAULT_NAME.
     */
    getDefaultRootWorkflowName: function() {
        return "DEFAULT_NAME";
    },
    
    /************************ DATA UPLOADER METHODS ***********************/
    /* These methods are related to interacting with the data uploader    */
    /* (minimap, service properties, workflow properties, data properties)*/
    /**********************************************************************/
    
     /**
     * This method allows to set the logging for uploader and multiple file uploads
     * as the data uploader is instantiated.
     * @method handleContentReady
     */
    handleContentReady : function () {   
     	// Allows the uploader to send log messages to trace, as well as to YAHOO.log   
     	
     	this.uploader.setAllowLogging(false);           
     	// Allows multiple file selection in "Browse" dialog.   
     	
     	this.uploader.setAllowMultipleFiles(true);     
     },
        
   
     /**
     * This method will bring up the "file browser" screen when the
     * "select files" button is pressed.
     * Based on what files are selected, it adds those files to the files list.
     * It disables the uploader after this action is taken. Hence the user cannot
     * click on the "select files" button again until the files are uploaded or 
     * file list is cleared.
     * @method onFileSelect
     * @param event : when the "select files" button is pressed the event is sent
     */
     onFileSelect : function (event) {  

     	if('fileList' in event && event.fileList != null) { 
     		this.fileList = event.fileList; }
		
     	 for (var item in this.fileList) {   
     		if(YAHOO.lang.hasOwnProperty(this.fileList, item)) {   
     			YAHOO.log(this.fileList[item].id); 
     			this.fileID = this.fileList[item].id;
     			if(YAHOO.lang.isUndefined(this.listofFiles))
     			{
     				this.listofFiles = this.fileList[this.fileID].name;
     			}
     			else
     			{
     				this.listofFiles = this.listofFiles + ", " + this.fileList[this.fileID].name;
     			}
     		}   
     	}    
     	
     	this.uploader.disable();           
     	var filename = document.getElementById("fileName");   
     	filename.innerHTML = this.listofFiles;   
     	
     	var progressbar = document.getElementById("progressBar");   
     	progressbar.innerHTML = "";  
     }, 
   
     /**
     * This method uploades the selected files in the file list to the designated
     * path.
     * @method upload
     */ 
   upload : function() {   
   	
   	 if (this.fileList != null) { 
   		this.uploader.uploadAll("http://www.yswfblog.com/upload/upload_simple.php"); 
   		} 
   	 },
   
     /**
     * This method clears teh files from the file list.
     * @method handleClearFiles
     */
   handleClearFiles : function () {   
   	this.uploader.clearFileList();   
   	this.uploader.enable();  
   	this.fileID = null;   
   	this.fileList = null;  
   	this.listofFiles = null;
   	
   	var filename = document.getElementById("fileName");   
   	filename.innerHTML = "";   
   	
   	var progressbar = document.getElementById("progressBar");   
   	progressbar.innerHTML = "";   
   	},
   
     /**
     * This method updates progress bar as the upload is in progress
     * @method onUploadProgress
     * @param event : event listened to when upload is in progress
     */
   onUploadProgress : function(event) {   
   	  prog = Math.round(300*(event["bytesLoaded"]/event["bytesTotal"]));   
      progbar = "<div style=\"background-color: #f00; height: 5px; width: " + prog + "px\"/>";   
   
      var progressbar = document.getElementById("progressBar");   
      progressbar.innerHTML = progbar;	   
   	},
   	
   	 /**
     * This method updates progress bar as the upload is complete
     * @method onUploadComplete
     * @param event : event listened to when upload is complete
     */
   	onUploadComplete : function(event) {   
   	 prog = Math.round(300*(event["bytesLoaded"]/event["bytesTotal"]));   
     progbar = "<div style=\"background-color: #f00; height: 5px; width: " + prog + "px\"/>";   
   
     var progressbar = document.getElementById("progressBar");   
     progressbar.innerHTML = progbar; 
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
        // Add a new workflowTab for child workflow. Pass the current openWorkflow's index.
        // At this moment, the following fields are set in WorkflowEditor.js
        // - initialRootWorkflowName
        // - isRootWorkflow
        // - markSaved
        // - moduleCounter
        // - workflowId
        // - workflowName

        if(!this.isSaved()){
            this.error("You cannot drill down unless you save the current workflow.",
                "Drill Down Error");
        } else {
            // Call parent drillDownWorkflow.
            wfeditor.ComposePerspective.superclass.drillDownWorkflow.call(this, arg);
        }
    },
    
    
    /********************** WIRE COMMAND METHODS *************************/
    /* These methods are related to commands for adding, removing wires. */
    /*********************************************************************/
    
    /**
     * This method is called when the user removes a wire from the layer.  It goes
     * through the undo/redo command system.
     * 
     * @method onRemoveWire
     * @param {String} e The event type.
     * @param {Array} args The event arguments.
     */
    onRemoveWire : function(e, args) {
    	var wire = args[0];
    	if(wire.isValidWire) {
    		var command = new wfeditor.command.CommandDisconnectPort(wire);
            this.editor.getCommandStack().execute(command); 
    	}
    },
    
    
    /*********************** META-INFO METHODS ***************************/
    /* These methods are related to commands for changing the workflow   */
    /* meta-information.                                                 */
    /*********************************************************************/
    
    /**
     * This method is called when the user updates the workflow meta-information form.
     * It sends the event to the undo/redo system.
     * 
     * @method onPropertiesUpdated
     */
    onPropertiesUpdated : function() {
    	var newValue = this.propertiesForm.getValue();
    	var command = new wfeditor.command.CommandChangeWorkflowInfo(this.propertiesForm,
    	   this.oldValue, newValue);
        this.editor.getCommandStack().execute(command);
        this.oldValue = newValue; 
    }
});
