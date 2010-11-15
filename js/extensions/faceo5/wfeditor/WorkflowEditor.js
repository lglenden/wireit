/**
 * This class is the top-level GUI object.  There is one WorkflowEditor for the
 * application and it is mainly responsible for communicating with the backend and
 * managing the various perspectives.
 * We started out with this class extending WireIt's WiringEditor class, but ended
 * up pulling most of that out as we introducted the perspectives.  Still, a lot of
 * the remaining code is still based on WireIt's WiringEditor code.
 * 
 * @class WorkflowEditor
 * @namespace wfeditor
 * 
 * @author Laura
 *
 */

/**
 * Constructor.  Sets up the object members (including the DWR adapter) and then
 * builds the outer layout, tab view, and panels.
 * 
 * @constructor
 * @param {Object} options Options for constructing the editor.
 */
wfeditor.WorkflowEditor = function(options) {
	try {
    /**
     * This is the panel that shows alerts.
     * 
     * @property alertPanel
     * @type {YAHOO.widget.Panel}
     */
     // TODO set these options in setOptions
    this.alertPanel = new YAHOO.widget.Panel('alertPanel', {
        fixedcenter: true,
        draggable: true,
        width: '500px',
        visible: false,
        modal: true
    });
    this.alertPanel.render();
    YAHOO.util.Event.addListener('alertPanelButton', 'click', function() {
        this.alertPanel.hide();
    }, this, true);
		
	/**
	  * Hash object to reference module definitions by their name.
	  * 
	  * @property modulesByName
	  * @type {Object}
	  */
    this.modulesByName = {};
    
    /**
     * DWR adapter for communicating with the backend.
     * 
     * @property adapter
     * @type {Object}
     */
    this.adapter = wfeditor.adapters.DWRAdapter;
    
    // set the default options
    this.setOptions(options);
 
    /**
     * Container DOM element.
     * 
     * @property el
     * @type {HTMLElement}
     */
    this.el = YAHOO.util.Dom.get(this.options.parentEl);

    /**
     * The "outer" layout of the application.  Basically holds the title etc.
     * on the top and the tab view in the center.
     * 
     * @property outerLayout
     * @type {YAHOO.widget.Layout}
     */
     // TODO set these options in setOptions
    this.outerLayout = new YAHOO.widget.Layout({
        units: [
            {position: 'top', height: '30px', body: 'top'},
            {position: 'left', width: '80px', body: 'workflowChooser', header: 'Open Workflows',
             animate: true, collapse: true, resize: true, gutter: '2px'},
            {position: 'center', body: 'tabView'},
            {position: 'right', body: 'logger', gutter: '5px',
             resize: true, animate: true, collapse: true, header: 'Logger Console',
             width: '300px', scroll: true}
        ]
    });
    this.outerLayout.render();
    
    // "Hack" the layout clip to add text when it's collapsed
    wfeditor.util.hackLayoutClip(this.outerLayout, "left", "Open Workflows");
    wfeditor.util.hackLayoutClip(this.outerLayout, "right", "Logger Console");

    /**
     * The tab view for the application.  All perspectives are added here.
     * 
     * @property tabView
     * @type {YAHOO.widget.TabView}
     */
     // TODO set these options in setOptions
    this.tabView = new YAHOO.widget.TabView("tabView");
    
    /**
     * This holds the command stack for the editor.
     * 
     * @property commandStack
     * @type {wfeditor.CommandStack}
     */
    this.commandStack = new wfeditor.CommandStack();
    
    /**
     * This property keeps track of the child perspectives and their order.
     * The order corresponds to their order in the tab view.
     * 
     * @property perspectives
     * @type {Array}
     */    
    this.perspectives = [];
    
    // Set up compose perspective
    // TODO set up these options in setOptions
    /**
     * This is the starting compose perspective.
     * 
     * @property composePerspective
     * @type {wfeditor.ComposePerspective}
     */
    this.composePerspective = new wfeditor.ComposePerspective({
    	title: "Compose",
    	id: "compose",
    	layoutOptions: {
    		parent: this.outerLayout
    	},
    	tabOptions: {
            active: true
        }
    }, this);
    
    // Add to the application and render.
    this.perspectives.push(this.composePerspective);
    this.tabView.addTab(this.composePerspective.tab);
    this.composePerspective.render();
        
    // Set up execute perspective
    // TODO set up these options in setOptions
    /**
     * This is the starting execute perspective.
     * 
     * @property executePerspective
     * @type {wfeditor.ExecutePerspective}
     */
    this.executePerspective = new wfeditor.ExecutePerspective({
    	title: "Execute",
    	id: "execute",
    	layoutOptions: {
    		parent: this.outerLayout
    	}
    }, this, this.composePerspective);
    
    // Add to the application and render.
    this.perspectives.push(this.executePerspective);    
    this.tabView.addTab(this.executePerspective.tab);        
    this.executePerspective.render();
    
    // Set up analyze perspective
    // TODO set up these options in setOptions
    /**
     * This is the starting analyze perspective.
     * 
     * @property analyzePerspective
     * @type {wfeditor.AnalyzePerspective}
     */
    this.analyzePerspective = new wfeditor.AnalyzePerspective({
        title: "Analyze",
        id: "analyze",
        layoutOptions: {
            parent: this.outerLayout
        }
    }, this, this.composePerspective);
    
    // Add to the application and render.
    this.perspectives.push(this.analyzePerspective);
    this.tabView.addTab(this.analyzePerspective.tab); 
    this.analyzePerspective.render();
    
    // Catch tab view changed event
    this.tabView.on("activeIndexChange", this.activeTabIndexChanged, this, true);
    // Remember the index of the tab
    this.tabIndex = 0;
    
    // Set up logger
    var r = this.outerLayout.getUnitByPosition('right'), 
        w = r.getSizes().body.w,
        h = r.getSizes().body.h;
        
    /**
     * This is the application-wide logger, using YUI's log reader.
     * 
     * @property logger
     * @type {YAHOO.widget.LogReader}
     */
     // TODO set these options in setOptions
    this.logger = new YAHOO.widget.LogReader("logger", {
        logReaderEnabled: true,
        draggable: false,
        newestOnTop: true,
        height: h + 'px',
        width: w + 'px'
    });
    
    // Start out with logger collapsed by default
    this.outerLayout.getUnitByPosition('right').collapse();
    
    // Take care of horrible resizing things.. :(
    this.outerLayout.on('resize', this.resizeTabView, this, true);
    this.resizeTabView();
    
    /**
     * This is the panel that holds the "help" functionality.  Right now this is
     * all turned off until we're ready for it.
     * 
     * @property helpPanel
     * @type {YAHOO.widget.Panel}
     */
     // TODO set these options in setOptions
    this.helpPanel = new YAHOO.widget.Panel('helpPanel', {
        fixedcenter: true,
        draggable: true,
        visible: false,
        modal: true
    });
    this.helpPanel.render();
    
    /**
     * This is the panel that shows the login and loading when the application
     * first loads.
     * 
     * @property loginPanel
     * @type {YAHOO.widget.Panel}
     */
     // TODO set these options in setOptions
    this.loginPanel = new YAHOO.widget.Panel('loginPanel', {
        fixedcenter: true,
        draggable: false,
        visible: false,
        modal: true,
        close: false,
        width: '300px'
    });
    this.loginPanel.render();
    
    /**
     * This is the panel that shows the "load workflow".
     * 
     * @property loadPanel
     * @type {YAHOO.widget.Panel}
     */
     // TODO set these options in setOptions
    this.loadPanel = new YAHOO.widget.Panel('loadPanel', {
    	fixedcenter: true,
    	draggable: true,
    	width: '500px',
    	visible: false,
    	modal: true
    });
    this.loadPanel.render();
    
    // Listen the keyup event to filter the module list
    this.loadPanel.filter = new wfeditor.util.FilterUtil(YAHOO.util.Dom.get("loadFilter"),
        this.updateLoadPanelList, this);
    YAHOO.util.Event.onAvailable('loadFilter', function() {
        YAHOO.util.Event.addListener('loadFilter', "keyup", this.loadPanel.filter.inputFilterTimer, this.loadPanel.filter, true);
    }, this, true);
    
    /**
     * This is the panel that shows confirm messages.
     * 
     * @property confirmPanel
     * @type {YAHOO.widget.Panel}
     */
     // TODO set these options in setOptions
    this.confirmPanel = new YAHOO.widget.Panel('confirmPanel', {
        fixedcenter: true,
        draggable: true,
        width: '500px',
        visible: false,
        modal: true,
        close: false
    });
    this.confirmPanel.render();
    
    /**
     * This is the panel that shows prompt messages.
     * 
     * @property promptPanel
     * @type {YAHOO.widget.Panel}
     */
     // TODO set these options in setOptions
    this.promptPanel = new YAHOO.widget.Panel('promptPanel', {
        fixedcenter: true,
        draggable: true,
        visible: false,
        modal: true
    });
    this.promptPanel.render();
    YAHOO.util.Event.addListener('promptPanelButton', 'click', function() {
        this.promptPanel.hide();
    }, this, true);
    
    /**
     * This is the panel that prompts the user to enter in values for exposed
     * ports when they execute a packaged workflow.
     * 
     * @property packagePromptPanel
     * @type {YAHOO.widget.Panel}
     */
     // TODO set these options in setOptions
     this.packagePromptPanel = new YAHOO.widget.Panel('packagePromptPanel', {
        fixedcenter: true,
        draggable: true,
        visible: false,
        modal: true,
        close: false
     });
     this.packagePromptPanel.render();
     YAHOO.util.Event.addListener('packagePromptButton', 'click', function() {
     	if(!this.packagePromptForm.validate()) {
     		return;
     	}
     	
     	this.packagePromptPanel.hide();
     	
     	if(this.packagePromptCallbackFn && this.packagePromptCallbackFnScope) {
     		this.packagePromptCallbackFn.call(this.packagePromptCallbackFnScope,
                this.packagePromptForm.getValue());
     	}
     }, this, true);
     
     /**
      * This panel shows a simple "wait" that can be displayed to the user during
      * a (potentially) long operation.
      * 
      * @property waitPanel
      * @type {YAHOO.widget.Panel}
      */
     // TODO set these options in setOptions
    this.waitPanel = new YAHOO.widget.Panel('waitingPanel', {
        fixedcenter: true,
        draggable: true,
        visible: false,
        modal: true,
        close: false
     });
     this.waitPanel.render();
     
     /**
      * This panel is for the UI service execution.
      * 
      * @property uiServicePanel
      * @type {YAHOO.widget.Panel}
      */
    // TODO set these options in setOptions
    this.uiServicePanel = new YAHOO.widget.Panel('uiServicePanel', {
    	fixedcenter: true,
    	draggable: true,
    	visible: false,
    	modal: true,
    	close: false
    });
    this.uiServicePanel.render();
    
    YAHOO.util.Event.addListener('uiServicePanelButton', 'click', function() {
        if(!this.uiServicePanelForm.validate()) {
            return;
        }
        
        // Send to backend
        this.adapter.uiServiceExecuted(this.uiServicePanelForm.getValue(),
            this.uiServicePanel.contextId);
        this.uiServicePanel.hide();
     }, this, true);

    // Set up the "open workflows" panel
    this.openWorkflows = new wfeditor.OpenWorkflows(this);
    this.openWorkflowsList = new wfeditor.util.ListUtil({
        parentEl: "workflowChooser"
    });
    this.openWorkflowsList.onItemChanged.subscribe(this.onItemSelected, this, true);
    this.newWorkflowTab();

	// Initialize adapter
	if(this.adapter.init && YAHOO.lang.isFunction(this.adapter.init)) {
	   this.adapter.init();
	}
	
	// Send the tab changed events
	this.tabView.selectTab(0);
	
	} catch(ex) {
		if(this.alertPanel) {
		  this.error("File: " + ex.fileName + "<br />Line: "
		      + ex.lineNumber + "<br />Message: " + ex.message,
		      "JavaScript error during WorkflowEditor constructor");
		} else {
			alert(ex);
		}
	}
};

wfeditor.WorkflowEditor.prototype = {
	
	/**
     * Sets the options for constructing this object, using defaults if none
     * are passed in.
     * 
     * @method setOptions
     * @param {Object} options
     */
	setOptions: function(options) {
		/**
		 * Options for this object.
		 * 
		 * @property options
		 * @type {Object}
		 */
        this.options = {};

        /**
         * The language name that we'll be dealing with.  Defaults to dnaworkflow.
         * 
         * @property options.languageName
         * @type {String}
         */
        this.options.languageName = options.languageName || 'dnaworkflow';

        /**
         * The parent element for the application.  Defaults to the document body.
         * 
         * @property options.parentEl
         * @type {HTMLElement || String}
         */
        this.options.parentEl = options.parentEl || document.body;

        /**
         * The login fields.  Will be passed into inputEx to create the login form.
         * Defaults to a username and password.
         * 
         * @property options.loginFields
         * @type {Object}
         */
        this.options.loginFields = options.loginFields || [
            {type: "string", inputParams: {label: "Username:", name: "username", required: true, typeInvite: "SORASCS Username"}},
            {type: "password", inputParams: {label: "Password:", name: "password", required: true}}
        ];
    },
    
    
    /************************** PANEL METHODS **************************/
    /* These methods are related to showing panels.                    */
    /*******************************************************************/
	
	/**
	 * This method shows the wait panel.
	 * 
	 * @method showWait
	 */
	showWait : function() { this.waitPanel.show(); },
	
	/**
	 * This method hides the wait panel, if it is being shown.
	 * 
	 * @method hideWait
	 */
	 hideWait : function() { this.waitPanel.hide(); },
	
	/**
	 * This method prompts the user to enter a string value.  Its parameters are
	 * similar to the "alert" method (see its documentation).  The difference is
	 * that this method takes a callback function to call with the value that the
	 * user entered.  If the user cancels the prompt then the callback function
	 * is not called.
	 * 
	 * @method prompt
	 * @param {Object} options See description for alert method.
	 */
	prompt: function(options) {
		// Show the relevant icon
        var icon = YAHOO.util.Dom.get("promptPanelIcon");
        if(options.iconType) {
            var img = "../images/icons/alerts/" + options.iconType + ".png";
            icon.src = img;
            icon.style.display = "";
        } else {
            icon.style.display = "none";
        }
        
        // Set the header
        YAHOO.util.Dom.get("promptPanelHeader").innerHTML = options.header || "Enter Value";
        
        // Set the body
        YAHOO.util.Dom.get("promptPanelBody").innerHTML = options.msg || "Enter value:";
        
        // Blank the value
        YAHOO.util.Dom.get("promptPanelText").value = options.value || "";
        
        // Set the callback
        if(options.callback) {
        	var scope = options.scope;
            var callback = options.callback;
            var fn = function() {
                YAHOO.util.Event.removeListener("promptPanelButton", "click", fn);
                callback.call(scope, YAHOO.util.Dom.get("promptPanelText").value);
            };
            YAHOO.util.Event.addListener("promptPanelButton", "click", fn);
        }
        
        // Show the panel
        this.promptPanel.show();
	},
	
	/**
     * This method confirms an action with the user.  Its parameters are
     * similar to the "alert" method (see its documentation).  The difference is
     * that this method takes a callback function to call when the user enters
     * "yes" or "no."
     * 
     * @method confirm
     * @param {Object} options See description for alert method.
	 */
	confirm: function(options) {
		// Show the relevant icon
        var icon = YAHOO.util.Dom.get("confirmPanelIcon");
        if(options.iconType) {
            var img = "../images/icons/alerts/" + options.iconType + ".png";
            icon.src = img;
            icon.style.display = "";
        } else {
            icon.style.display = "none";
        }
        
        // Set the header
        YAHOO.util.Dom.get("confirmPanelHeader").innerHTML = options.header || "Confirm";
        
        // Set the body
        YAHOO.util.Dom.get("confirmPanelBody").innerHTML = options.msg;
        
        // Set the button labels
        YAHOO.util.Dom.get("confirmPanelYesButton").innerHTML = options.yesLabel || "Yes";
        YAHOO.util.Dom.get("confirmPanelNoButton").innerHTML = options.noLabel || "No";
        
        // Set the callback functions if given
        var scope = options.scope || this;
        var onYes = options.onYes;
        var that = this;
        var fn = function() {
            that.confirmPanel.hide();
            YAHOO.util.Event.removeListener("confirmPanelYesButton", "click");
            if(onYes) {
            	onYes.call(scope);
            }
        };
        YAHOO.util.Event.addListener("confirmPanelYesButton", "click", fn);
        
        var onNo = options.onNo;
        var fn = function(e) {
        	that.confirmPanel.hide();
            YAHOO.util.Event.removeListener("confirmPanelNoButton", "click");
            if(onNo) {
            	onNo.call(scope);
            }
        };
        YAHOO.util.Event.addListener("confirmPanelNoButton", "click", fn);
        
        // Show the panel
        this.confirmPanel.show();
	},
	
	/**
	 * Shows the alert panel with the given message, header (options) and icon type
	 * (optional).
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
	alert: function(msg, header, iconType) {
		// Show the relevant icon
		var icon = YAHOO.util.Dom.get("alertPanelIcon");
		if(iconType) {
			var img = "../images/icons/alerts/" + iconType + ".png";
            icon.src = img;
            icon.style.display = "";
		} else {
			icon.style.display = "none";
		}
		
		// Set the header
        YAHOO.util.Dom.get("alertPanelHeader").innerHTML = header || "Message";
        
        // Set the body
        YAHOO.util.Dom.get("alertPanelBody").innerHTML = msg;
        
        // Show the panel
        this.alertPanel.show();
	},
	
	/**
     * Shows the alert panel with an error icon and the given message and header
     * (optional).
     * 
     * @method error
     * @param {String} msg The error message (body).
     * @param {String || null} header The alert header (the top of the panel).  If
     * null, a default is used.
     */
	error: function(msg, header) {
		this.alert(msg, (header || "Error!"), "error");
	},
	
	/**
     * Shows the alert panel with an warning icon and the given message and header
     * (optional).
     * 
     * @method warn
     * @param {String} msg The warning message (body).
     * @param {String || null} header The alert header (the top of the panel).  If
     * null, a default is used.
     */
	warn: function(msg, header) {
		this.alert(msg, (header || "Warning!"), "warn");
	},
	
	/**
     * Shows the alert panel with an info icon and the given message and header
     * (optional).
     * 
     * @method info
     * @param {String} msg The information message (body).
     * @param {String || null} header The alert header (the top of the panel).  If
     * null, a default is used.
     */
	info: function(msg, header) {
		this.alert(msg, (header || "Information"), "info");
	},
	
	/**
     * Shows the alert panel with an "okay" icon and the given message and header
     * (optional).
     * 
     * @method error
     * @param {String} msg The "okay" message (body).
     * @param {String || null} header The alert header (the top of the panel).  If
     * null, a default is used.
     */
	okay: function(msg, header) {
		this.alert(msg, (header || "Okay"), "okay");
	},
	
	/**
	 * This method shows the service meta-information as given.  See the Palette's
	 * serviceInfo method.
	 * 
	 * @method serviceInfo
	 * @param {String} name The name of the service.
	 * @param {String} description The description of the service.
	 * @param {String} url The location (URL) of the service.
	 * @param {String} createdBy Who created the service.
	 */
	serviceInfo: function(name, description, url, createdBy) {
        this.composePerspective.palette.serviceInfo(name, description, url, createdBy);
    },
	
	
    /************************** RESIZE METHODS *************************/
    /* These methods are related to the horrible resizing of the tabs, */
    /* tab view, layouts, etc.                                         */
    /*******************************************************************/
    
    /**
     * Resizes the tab view.  Based on YUI's "complex application" example.
     * 
     * @method resizeTabView
     */
    resizeTabView: function() {
        var ul = this.tabView._tabParent.offsetHeight;
        var newHeight = ((this.outerLayout.getSizes().center.h - ul) - 2) + 'px';
        YAHOO.util.Dom.setStyle(this.tabView._contentParent, 'height', newHeight);
        
        var r = this.outerLayout.getUnitByPosition('right'),
            w = r.getSizes().body.w,
            h = r.getSizes().body.h;
        var el = YAHOO.util.Selector.query('div.yui-log-bd', r.body);
        YAHOO.util.Dom.setStyle(el, 'height', (h - 2) + 'px');
        YAHOO.util.Dom.setStyle(el, 'width', (w - 2) + 'px');
        
        // We now set the dimension for the tabs
        this.resizeTabs();
    },
    
    /**
     * Resizes the tabs.  Based on YUI's "complex application" example.
     * 
     * @method resizeTabs
     */
    resizeTabs: function() {
        var newHeight = YAHOO.util.Dom.getStyle(this.tabView._contentParent, 'height');
        var newWidth = YAHOO.util.Dom.getStyle(this.tabView._contentParent, 'width');
        
        var t = this.tabView.get("tabs");
        for(var i = 0; i < t.length; i++) {
            var el = t[i].get('contentEl');
            YAHOO.util.Dom.setStyle(el, 'height', newHeight);
            YAHOO.util.Dom.setStyle(el, 'width', newWidth);
        }

        // Once the tabs have their dimension set, we continue with the internal layouts
        for(var i = 0; i < this.perspectives.length; i++) {
        	// let's set the values for the layouts.
        	this.perspectives[i].setResize(newHeight, newWidth);
        	this.perspectives[i].onTabResized();
        }
    },
	
	
	/************************** LOAD METHODS ***************************/
    /* These methods are related to loading workflows from the backend.*/
    /* These methods are used by child perspectives when they want to  */
    /* load a workflow -- they call the backend where appropriate and  */
    /* then call back to the child perspective.                        */
    /*******************************************************************/
	
	/**
	 * This method is called by the children when they want to load a workflow.
	 * They pass in the callback method (and scope) that should be called when
	 * the loading is complete.  Then the parent WorkflowEditor deals with the
	 * backend, gets the selection from the user, and passes it to the callback.
	 * 
	 * @method loadWorkflow
	 * @param {Function} callback The callback function after the loading is complete.
	 * This function should take a single parameter which will be the name of the workflow
	 * that has been loaded.  It can then retrieve that workflow from the parent
	 * WorkflowEditor's list of workflows.
	 * @param {Object} scope The scope of the callback function.
	 */
	loadWorkflow: function(callback, scope) {
		// Save the callbacks
		this.loadCallback = callback;
		this.loadScope = scope;
		
		// Show the wait panel
		this.showWait();
		
		// Call the backend.
        this.adapter.loadWorkflows(this.options.languageName, {
        	success: this.onLoadSuccess,
           scope: this
        });
	},

	/**
	 * This callback method is called by the DWR adapter when the loading of
	 * the workflows is done.  It sets the pipes to the ones that the backend
	 * passes and shows the "load" panel so the user can select which workflow
	 * they want.  Once the user selects the workflow, the loadWorkflowByName
	 * method is then called which passes back the relevant issue to the child
	 * perspective that asked for the loading.
	 * 
	 * @method onLoadSuccess
	 * @param {Object} results The workflows that can be loaded.
	 */
	onLoadSuccess: function(results) {
		this.pipes = results;
        this.pipesByName = {};
        
        this.updateLoadPanelList();
        
        // Hide the wait panel.
        this.hideWait();
        
        // Got this from WireIt...I don't know what it does. :P
        if(!this.afterFirstRun) {
            var p = window.location.search.substr(1).split('&');
            var oP = {};
            for(var i = 0 ; i < p.length ; i++) {
                var v = p[i].split('=');
                oP[v[0]]=window.decodeURIComponent(v[1]);
            }
            this.afterFirstRun = true;
            if(oP.autoload) {
                this.loadWorkflowByName(oP.autoload);
                return;
            }
        }

        // Low the loading panel.
        this.loadPanel.show();
	},
	
	/**
	 * The method is called when the user selects a workflow from the list of
	 * workflows.  It then does the callback logic that was passed in by the
	 * child perspective that originally requested the loading process.
	 * 
	 * @method loadWorkflowByName
	 * @param {String} The name of the workflow that the user selected (passed in
	 * by the login panel).
	 */
    loadWorkflowByName: function(workflowName) {
        var workflow = this.pipesByName[workflowName];
        this.loadPanel.hide();
            
        var loadCallback = this.loadCallback;
        var loadScope = this.loadScope;
        this.loadCallback = null;
        this.loadScope = null;
//        loadCallback.call(loadScope, YAHOO.lang.JSON.parse(workflow.working));
        
        // check if this workflow is already open or not
        if(this.openWorkflows.hasWorkflowId(workflow.uniqueId)) {
        	this.warn("This workflow is already open!<br />Please select it from the \"Open Workflows\" list.", "Open Workflow Error");
        	return;
        }

        loadCallback.call(loadScope, {
                workflowId: workflow.uniqueId,
                name: workflow.name,
                working: YAHOO.lang.JSON.parse(workflow.working),
                user: workflow.user,
                moduleCounter: workflow.moduleCounter,
                composepermission: workflow.composepermission,
                executepermission: workflow.executepermission
            }
        );
    },
    
    /**
     * This method does the filtering on the load workflow panel based on what the
     * user has typed in.  It is based on the function from WireIt's WiringEditor
     * class.
     * 
     * @method updateLoadPanelList
     * @param {String} filter The filter that the user has typed in.
     */
    updateLoadPanelList: function(filter) {
        // Taken from WireIt
        var list = WireIt.cn("ul");
        if(YAHOO.lang.isArray(this.pipes)) {
            for(var i = 0; i < this.pipes.length; i++) {
                var pipe = this.pipes[i];
                this.pipesByName[pipe.user + "_" + pipe.name] = pipe;
                if(!filter || filter === "" || pipe.name.match(new RegExp(filter, "i")) ) {
                    // TODO add info button here
                    list.appendChild(WireIt.cn('li', null, {cursor: 'pointer'}, pipe.user + "_" + pipe.name));
                }
            }
        }
        
        var panelBody = YAHOO.util.Dom.get('loadPanelBody');
        panelBody.innerHTML = "";
        panelBody.appendChild(list);
        
        YAHOO.util.Event.addListener(list, 'click', function(e, args) {
            var workflowName = YAHOO.util.Event.getTarget(e).innerHTML;
            this.loadWorkflowByName(workflowName);
        }, this, true);
    },
	
	
	/************************* LOGIN METHODS ***************************/
    /* These methods are related to logging in through the login panel.*/
    /*******************************************************************/
	
	/**
	 * This method shows the login form.  It should be called immediately after the
	 * object has been instantiated.  It sets up the login form and then starts the
	 * login process with the user and the backend.
	 * 
	 * @method showLogin
	 */
	showLogin: function() {
        // setup login form
        /**
         * This is the inputEx form that has the username and password that the
         * user logs in with.
         * 
         * @property loginForm
         * @type {inputEx.Form}
         */
         // TODO move this to constructor??
         // TODO set these options in setOptions
        this.loginForm = new inputEx.Form({
            name: 'login',
            legend: 'User Information',
            collapsible: false,
            collapsed: false,
            parentEl: "loginForm",
            fields: this.options.loginFields,
            buttons: []
        });
        
        // setup login button
        /**
         * The button on the login panel.
         * 
         * @property loginButton
         * @type {YAHOO.widget.Button}
         */
         // TODO move to constructor??
         // TODO set these options in setOptions
        this.loginButton = new YAHOO.widget.Button({
            label: "Submit",
            container: "loginBottom"});
        this.loginButton.on("click", this.processLogin, this, true);
        
        // disable to start with
        this.loginForm.disable();
        this.loginButton.set("disabled", true);
        
        // show panel
        this.loginPanel.show();
        
        // check if we're already logged in...
        this.adapter.isLoggedIn({
            success: function(val) {
                if(val) {
                    this.loginUser = val;
                    this.loginSuccess();
                } else {
                    // hide the loading image
                    YAHOO.util.Dom.setStyle("loginLoading", "display", "none");
                    
                    // make form editable
                    this.loginForm.enable();
                    this.loginButton.set("disabled", false);
                    
                    // update status
                    YAHOO.util.Dom.get("loginStatus").innerHTML =
                        'Please enter your SORASCS login information!';
                }
            },
            scope: this
        });
    },
    
    /**
     * This method is called when the user logs in.  It first makes sure that the login
     * form is valid and then does the appropriate calls to the backend.
     * 
     * @method processLogin
     */
    processLogin: function() {
        if(!this.loginForm.validate()) {
            // form isn't valid, don't submit until it's fixed
            return;
        }
        
        this.loginForm.disable();
        this.loginButton.set("disabled", true);
        YAHOO.util.Dom.get("loginStatus").innerHTML = "Logging in...";
        YAHOO.util.Dom.setStyle("loginLoading", "display", "inline");
        
        var value = this.loginForm.getValue();
        this.adapter.login(value, {
            success: this.loginChecked,
            scope: this
        });
    },
 
    /**
     * This method is called when the login information submitted by the user has
     * been checked by the backend.  If the login is correct, "True" is passed in
     * to this method -- otherwise it is "False."
     * 
     * @method loginChecked
     * @param {boolean} succeeded Whether the login was successful or not.
     */
    loginChecked: function(val) {
        if(val) {
            this.loginUser = val;
            this.loginSuccess();
        } else {
            // login failed, let them try again
            this.loginForm.enable();
            this.loginButton.set("disabled", false);
            YAHOO.util.Dom.get("loginStatus").innerHTML = "Login failed!  Please try again.";
            YAHOO.util.Dom.setStyle("loginLoading", "display", "none");
        }
    },
    
    /**
     * This method is called when the user has logged in and that login information
     * has been checked with the backend and been found to be correct.  It starts
     * loading the services, after which the user can proceed with normal interactions
     * with the application.
     * 
     * @method loginSuccess
     */
    loginSuccess: function() {
        // now we hide the login and load the services
        YAHOO.util.Dom.get("loginStatus").innerHTML = "Login successful!  Loading services...";
        this.adapter.getServices({
            success: function(jsonString) {
            	try {
            		jsonString = wfeditor.util.replaceHTMLChars(jsonString)
                    var jsonVar = YAHOO.lang.JSON.parse(jsonString);             
                    jsonVar.language = jsonVar.language || this.options.languageName;
                    this.parseLanguage(jsonVar);
                    this.loginPanel.hide();
            	} catch(ex) {
            		this.error(ex, "JavaScript error during loginSuccess");
                    this.error("File: " + ex.fileName + "<br />Line: "
                        + ex.lineNumber + "<br />Message: " + ex.message,
                        "JavaScript error during loginSuccess");
            	}
            },
            scope: this
        });
    },
	
	
	/************************* MODULE METHODS **************************/
    /* These methods are related to loading modules (services) from the*/
    /* backend.  These methods propgate the list of modules/services to*/
    /* the children perspectives as needed.                            */
    /*******************************************************************/
    
    /**
     * This method is called when the list of services (modules) has been updated
     * from the backend.  It updates the WorkflowEditor's modules list and then
     * propogates the "update modules" call to any children perspective that have
     * that method defined.  (Right now, that's only the compose perspective.)
     * 
     * @method updateModules
     */
    updateModules : function() {
    	// Update modules list
        for(var i = 0; i < this.modules.length; i++) {
        	this.modulesByName[this.modules[i].name] = this.modules[i];
        }
        
        // Tell children to update modules list
        for(var i = 0; i < this.perspectives.length; i++) {
        	if(this.perspectives[i].updateModules) {
        		this.perspectives[i].updateModules(this.modules);
        	}
        } 
    },
    
    /**
     * This method is called when the backend says to update the data projects.
     * It calls the children as needed.
     * 
     * @method updateDataProjects
     */
    updateDataProjects : function() {
    	// Tell children to update data projects list
        for(var i = 0; i < this.perspectives.length; i++) {
            if(this.perspectives[i].updateDataProjects) {
                this.perspectives[i].updateDataProjects(this.dataProjects);
            }
        } 
    },
    
    /**
     * This method is called when the backend says to update the data types.
     * It calls the children as needed.
     * 
     * @method updateDataTypes
     */
     updateDataTypes : function() {
        // Tell children to update data types list
        for(var i = 0; i < this.perspectives.length; i++) {
            if(this.perspectives[i].updateDataTypes) {
                this.perspectives[i].updateDataTypes(this.dataTypes);
            }
        }
     },
    
    /**
     * This method is called when the list of tags has been updated
     * from the backend.  It  propogates the "update tags" call to any children
     * perspective that have that method defined.  (Right now, that's only the
     * compose perspective.)
     * 
     * @method updateTags
     */
    updateTags : function() {
        for(var i = 0; i < this.perspectives.length; i++) {
            if(this.perspectives[i].updateTags) {
                this.perspectives[i].updateTags(this.tags);
            }
        }
    },
    
    /**
     * This method is called when the list of analyses has been updated
     * from the backend.  It  propogates the "update analyses" call to any children
     * perspective that have that method defined.  (Right now, that's only the
     * analyze perspective.)
     * 
     * @method updateAnalyses
     */
    updateAnalyses : function() {
    	for(var i = 0; i < this.perspectives.length; i++) {
            if(this.perspectives[i].updateAnalyses) {
                this.perspectives[i].updateAnalyses(this.analyses);
            }
        } 
    },
    
    
    /************************* BACKEND METHODS *************************/
    /* These methods are related to interacting with the backend.      */
    /*******************************************************************/
    
    /**
     * This method displays the given build number in the upper right-hand corner.
     * 
     * @method displayBuildNum
     */
     // TODO Aparup to hook this up to...something? from hudson?
    displayBuildNum: function(buildNum) {
    	var el = YAHOO.util.Dom.get('buildNum');
    	el.innerHTML = "Build #" + buildNum + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    },
    
    /**
     * This method logs the given message to the YUI logger.
     * 
     * @method logProgress
     */
    logProgress: function(progressMessage) {
        YAHOO.log(progressMessage);
    },
    
    /**
     * This method logs the given error message to the YUI logger.
     * 
     * @method logError
     */
    logError: function(errorMessage) {
        YAHOO.log(errorMessage,"error");
    },
    
    /**
     * This method parses the language that has been received from the backend.
     * It is expected to contain at least modules, and also tags by categories if
     * needed.
     * 
     * @method parseLanguage
     * @param {Object} obj The object that the backend sent.
     */
    parseLanguage: function(obj) {
    	if(!obj.language || !obj.modules) {
    		this.error("Backend did not send the right JSON format!");
    		return;
    	}
    	
    	// Check for and update modules
    	if(obj.modules) {
    	   this.modules = obj.modules;
    	   this.updateModules();
    	}
    	
    	// Check for and update data projects
    	if(obj.dataProjects) {
    		this.dataProjects = obj.dataProjects;
    		this.updateDataProjects();
    	}
    	
    	// Check for and update data types
    	if(obj.dataTypes) {
    		this.dataTypes = obj.dataTypes;
    		this.updateDataTypes();
    	}
    	
    	// Check for and update tags
    	if(obj.tagsByCategories) {
    		this.tags = obj.tagsByCategories;
    		this.updateTags();
    	}
    	
    	// Check for and update analyses
    	if(obj.analyses) {
    		this.analyses = obj.analyses;
    		this.updateAnalyses();
    	}
    	
    	// Check for and update favorites, we request to backend.
    	this.adapter.getUserFavorites({
    		success: this.updateFavorites,
    		scope: this
    	});
    },
    
    /**
     * This callback function will be called once we get the results from backend,
     * @method updateFavorites
     * @param {Array} The list of user's results from backend.
     */
    updateFavorites : function(results) {
    	this.composePerspective.updateFavorites(results);
    },
    
    /**
     * See ExecutePerspective.appendToFooter.
     * 
     * @method appendToExecutionFooter
     * @param {String} msg The message to append.
     * @param {Number || null} moduleId The ID of the service that the message is associated with, if any.
     * @param {String || null} port The name of the port that the message is associated with, if any.
     */
    appendToExecutionFooter : function(msg, moduleId, port) {
    	this.executePerspective.appendToFooter(msg, moduleId, port);
    },
    
    
    /*************************** TAB METHODS ***************************/
    /* These methods are related to handling tab and tab view events.  */
    /*******************************************************************/
    
    /**
     * This method handles the event when the tab changes.  It calls the old
     * Perspective's onTabUnselected method and calls the new Perspective's
     * onTabSelected method.  See YUI tab view's "activeIndexChange" event.
     * 
     * @method activeTabIndexChanged
     * @param {Object} event The event object with the old and new value.
     */
    activeTabIndexChanged : function(event) {
    	if(event.prevValue != null) {
    		this.perspectives[event.prevValue].onTabUnselected();
    	}
    	
    	if(event.newValue != null) {
    		this.perspectives[event.newValue].onTabSelected(event.prevValue);
    		this.tabIndex = event.newValue;
    	}
    },

    /**
     * This method returns the current perspective which is open now.
     * i.e. ComposePerspective, ExecutionPerspective, AnalysisPerspective, ...
     * 
     * @method getCurrentPerspective
     */
    getCurrentPerspective : function() {
        return this.perspectives[this.tabIndex];
    },
    
    
    /********************* WORKFLOW CHOOSER METHODS ********************/
    /* These methods are related to the workflow chooser on the side.  */
    /*******************************************************************/
    
    /**
     * This method is the event handler for when the user selects an item in the
     * "open workflows" list. First it confirms if the clicked tab has unsaved
     * child workflows or not. Then it goes to _onItemSelected method.
     * 
     * @method onItemSelected
     * @param {String} type The event type (not used).
     * @param {Array} args The event arguments.  The first argument is the relevant
     * event information.
     */
    onItemSelected : function(type, args) {
    	var oldIndex = args[0].oldIndex;
    	var newIndex = args[0].newIndex;

        if(oldIndex != null) {
            // get the working value of the workflow from the compose perspective
            // (oldIndex is -1 the first time and we don't want to do this
            // then -- it's also -1 after we've removed a tab)
            this._parseOldWorkflow(oldIndex);
            // if the clicked tab has its child workflows opened, close the child
            // workflows' tabs (be consistent with the "Close" button behavior).
            // need to check if the child tabs have been saved.
            var listWorkflowAndInd = this.openWorkflows.getListWorkflowIncludeIndex(newIndex);
            var listWorkflow = listWorkflowAndInd.listWorkflow;
            var numOfWorkflows = listWorkflow.getNumberOfWorkflows();
            var index = listWorkflowAndInd.index;
            var unSaved = false;
            if(index != numOfWorkflows - 1) {
                for(var i = index + 1; i < numOfWorkflows; i++) {
                    if(!listWorkflow.getWorkflows()[i].markSaved) {
                        unSaved = true;
                        break;
                    }
                }
            }
            
            // if one (or more) of the child workflow tabs is not saved,
            // raise an alert.
            if(unSaved) {
                
                var that = this;
                var yes = function() {
                    that._onItemSelected(type, args);
                };
                var no = function() {
                    that.openWorkflowsList.setIndex(oldIndex);
                }
                
                this.confirm({
                    msg: "The workflow you clicked has unsaved child workflow tabs.  Are you sure you want to close them?",
                    onYes: yes,
                    onNo: no
                });
            } else {
                this._onItemSelected(type, args);
            }
        } else {
            this._onItemSelected(type, args);
        }
    },

    /**
     * This method is the event handler for when the user selects an item in the
     * "open workflows" list. Retrieves the current perspective's information
     * and stores it in openWorkflows using oldIndex. Then, open a new workflow
     * on the new tab using newIndex.
     * 
     * @method _onItemSelected
     * @param {String} type The event type (not used).
     * @param {Array} args The event arguments.  The first argument is the relevant
     * event information.
     */
    _onItemSelected : function(type, args) {
        var oldIndex = args[0].oldIndex;
        var newIndex = args[0].newIndex;

        if(oldIndex != null) {

            // if the new tab has its own child workflows, need to close them.
            var listWorkflowAndInd = this.openWorkflows.getListWorkflowIncludeIndex(newIndex);
            var listWorkflow = listWorkflowAndInd.listWorkflow;
            var index = listWorkflowAndInd.index;
            var numOfWorkflows = listWorkflow.getNumberOfWorkflows();
            if(index != numOfWorkflows - 1) {
                for(var i = numOfWorkflows - 1; i > index; i--) {
                    this.openWorkflows.removeOpenWorkflow(newIndex + (i - index));
                    this.openWorkflowsList.removeItem(newIndex + (i - index), false, true);
                }
            }
        }
        
        // tell perspectives to change their workflow
        var newListWorkflow = this.openWorkflows.getListWorkflowIncludeIndex(newIndex).listWorkflow;
        var newWorkflow = this.openWorkflows.getOpenWorkflow(newIndex);
        newWorkflow.initialRootWorkflowName = newListWorkflow.initialRootWorkflowName;
        newWorkflow.isRootWorkflow = this.openWorkflows.isRootWorkflow(newIndex);
        newWorkflow.moduleCounter = newListWorkflow.moduleCounter;
        newWorkflow.workflowName = newListWorkflow.workflowName;
        newWorkflow.composepermission = newListWorkflow.composepermission;
        newWorkflow.executepermission = newListWorkflow.executepermission;

        for(var i = 0; i < this.perspectives.length; i++) {
            this.perspectives[i].onWorkflowChanged(newWorkflow);
        }
    },

    /**
     * This method is called when the user clicks the "add tab" button.
     * 
     * @method onAddWorkflowTab
     */
// as of now unused method
/*    onAddWorkflowTab: function() {
    	this.newWorkflowTab();
    },
*/    
    /**
     * This method is called when the user clicks the "close tab" button.
     * 
     * @method onCloseWorkflowTab
     */
    onCloseWorkflowTab: function() {
        if(this.openWorkflowsList.getLength() <= 1 || this.openWorkflowsList.getIndex() < 0) {
            this.composePerspective.clearWorkflow();
            
            // update open workflows list ID...
            this.openWorkflows.listWorkflows[0].workflows[0].workflowId = null;
            
        } else {
            var index = this.openWorkflowsList.getIndex();
            // if the close tab is root workflow, the focus moves to the
            // lower open workflow tab. but if the close tab is child workflow,
            // the focus moves to the upper open workflow tab.
            if(this.openWorkflows.isRootWorkflow(index)) {
                this.openWorkflows.removeOpenWorkflow(index);
                this.openWorkflowsList.removeCurrentItem();
            } else {
                this.openWorkflows.removeOpenWorkflow(index);
                this.openWorkflowsList.removeItem(index, null, true);
            }
        }
        this.getCommandStack().clearAll();
    },
    
    /**
     * This method makes a new root workflow tab and adds it to the list.
     * 
     * @method newWorkflowTab
     */
    newWorkflowTab: function() {
        var listWorkflow;
        // Don't go inside when the tool is soon after loaded
        if(this.openWorkflowsList.getIndex() >= 0) {
            this._parseOldWorkflow(this.openWorkflowsList.getIndex());
        }
        
        this.openWorkflows.addNewWorkflow();
        this.openWorkflowsList.addItem("New Workflow", true);
    },

    /**
     * This method makes a new child workflow tab and adds it to the list.
     * 
     * @method newChildWorkflowTab
     * @arg openWorkflowIndex: the open workflow's index where the user clicked "drill down".
     *      canvasReadOnly: whether the new canvas is read only or not.
     */
    newChildWorkflowTab: function(arg) {
        // set current perspective's information to listWorkflow
        this._parseOldWorkflow(this.openWorkflowsList.getIndex());
        var index = this.openWorkflows.addNewChildWorkflow(arg);
        this.openWorkflowsList.addItemWithIndex("New Workflow", index, true);
        this.openWorkflowsList.setIndentLevel(index, 1);
    },

    /**
     * This method parses the currently opened perspective's information
     * and stores it in the openWorkflows.
     * 
     * @method _parseOldWorkflow
     * @openWorkflowIndex the index of currently opened workflow in openWorkflows.
     */    
    _parseOldWorkflow: function(openWorkflowIndex) {
        var currentPerspective = this.getCurrentPerspective();
        
        var listWorkflow = this.openWorkflows.getListWorkflowIncludeIndex(openWorkflowIndex).listWorkflow;
        listWorkflow.initialRootWorkflowName = currentPerspective.initialRootWorkflowName;
        if(currentPerspective.isRootWorkflow) {
            listWorkflow.workflowName = currentPerspective.getName();
            listWorkflow.composepermission = currentPerspective.composepermission;
            listWorkflow.executepermission = currentPerspective.executepermission;
        }
        listWorkflow.moduleCounter = currentPerspective.moduleCounter;
        
        var oldWorkflow = this.openWorkflows.getOpenWorkflow(openWorkflowIndex);
        oldWorkflow.properties = currentPerspective.getPropertiesValue();
        // parse containers/wires only when compose perspective, because they don't change in other perspectives
        if(this.tabIndex == 0) {
            var temp = wfeditor.util.makeCopyContainersWires(currentPerspective.layer.containers,
               currentPerspective.layer.wires);
            oldWorkflow.containers = temp.containers;
            oldWorkflow.wires = temp.wires;
        }
        oldWorkflow.canvasReadOnly = currentPerspective.canvasReadOnly;
        oldWorkflow.workflowId = currentPerspective.getWorkflowId();
        oldWorkflow.markSaved = currentPerspective.isSaved();
    },
    
    /**
     * This method should be called by the child perspectives if the workflow's
     * name is changed.  It updates the CURRENTLY SELECTED item in the open
     * workflows list.
     * 
     * @method onWorkflowNameChanged
     * @param {String} newName The new name of the workflow.
     */
    onWorkflowNameChanged: function(newName) {
        if(this.openWorkflowsList.getIndex() >= 0) {
            var li = this.openWorkflowsList.getCurrentElement();
            li.innerHTML = newName;
        }
    },
    
    
    /************************ CANVAS API METHODS ***********************/
    /* These methods are related to the API to the middle tier for     */
    /* providing access to changing the visual appearnce of the canvas.*/
    /*******************************************************************/
    
    /**
     * Forwards the call to the relevant perspective.
     * See Perspective.highlightService.
     * 
     * @method highlightService
     * @param {String} perspective One of "compose", "execute", or "analyze".
     */
    highlightService: function(perspective, serviceModuleId, color) {
    	if(perspective == "compose") {
    	    this.composePerspective.highlightService(serviceModuleId, color);
    	} else if(perspective == "execute") {
            this.executePerspective.highlightService(serviceModuleId, color);
    	} else if(perspective == "analyze") {
    	    this.analyzePerspective.highlightService(serviceModuleId, color);
    	}
    },
    
    /**
     * Forwards the call to the relevant perspective.
     * See Perspective.highlightPort.
     * 
     * @method highlightPort
     * @param {String} perspective One of "compose", "execute", or "analyze".
     */
    highlightPort: function(perspective, serviceModuleId, portName, color) {
        if(perspective == "compose") {
           this.composePerspective.highlightPort(serviceModuleId, portName, color);
        } else if(perspective == "execute") {
           this.executePerspective.highlightPort(serviceModuleId, portName, color);
        } else if(perspective == "analyze") {
           this.analyzePerspective.highlightPort(serviceModuleId, portName, color);
        }
    },
    
    /**
     * Forwards the call to the relevant perspective.
     * See Perspective.errorHighlightPort.
     * 
     * @method errorHighlightPort
     * @param {String} perspective One of "compose", "execute", or "analyze".
     */
    errorHighlightPort: function(perspective, serviceModuleId, portName) {
    	if(perspective == "compose") {
           this.composePerspective.errorHighlightPort(serviceModuleId, portName);
        } else if(perspective == "execute") {
           this.executePerspective.errorHighlightPort(serviceModuleId, portName);
        } else if(perspective == "analyze") {
           this.analyzePerspective.errorHighlightPort(serviceModuleId, portName);
        }
    },
    
    /**
     * Forwards the call to the relevant perspective.
     * See perspective.clearHighlights.
     * 
     * @method clearHighlights
     * @param {String} perspective One of "compose", "execute", or "analyze".
     */
    clearHighlights: function(perspective) {
        if(perspective == "compose") {
           this.composePerspective.clearHighlights();
        } else if(perspective == "execute") {
           this.executePerspective.clearHighlights();
        } else if(perspective == "analyze") {
           this.analyzePerspective.clearHighlights();
        }
    },
    
    /**
     * Given the fields options that can be passed to the inputEx constructor,
     * it shows the prompt and, when the user enters the value, calls the given
     * callback function with the entered values.
     * 
     * @method packagePrompt
     * @param {Object} fields
     * @param {Function} callbackFn Callback function.
     * @param {Object} callbackFnScope Callback function scope.
     */
    packagePrompt : function(fields, callbackFn, callbackFnScope) {
     	// Clear out the old form.
     	var el = YAHOO.util.Dom.get("packagePromptForm");
        el.innerHTML = "";
     	
     	// Make the new form
        this.packagePromptForm = new inputEx.Group({
            parentEl: el,
            fields: fields
        });
        
        // Set the callbacks.
        this.packagePromptCallbackFn = callbackFn;
        this.packagePromptCallbackFnScope = callbackFnScope;
     	
     	this.packagePromptPanel.show();
     },
     
     /**
      * This method is called from the back-end during execution to run the "UI Service,"
      * which prompts the user to enter parameter values.  The uiModel that is passed into this
      * method is the same one that is passed to the back-end when the workflow is saved.
      * Once the user enters the values, they are sent to the back-end to continue execution.
      * 
      * @method executeUIService
      * @param {String} uiModel A string representation of the JSON UI model.
      * @param contextId {Number} The context id for the execution.
      */
     executeUIService : function(uiModel, contextId) {
        // Clear out the old form.
        var el = YAHOO.util.Dom.get("uiServicePanelForm");
        el.innerHTML = "";
        
        // Parse the uiModel
        var uiModelObj = YAHOO.lang.JSON.parse(uiModel);
        
        // Make the new form
        /**
         * This property holds the inputEx form that's displayed in the UI service
         * panel.
         * 
         * @property uiServicePanelForm
         * @type {inputEx.Group}
         */
        this.uiServicePanelForm = new inputEx.Group({
            parentEl: el,
            fields: uiModelObj.fields
        });
        
        // Keep the contextId to send to the backend when we're done
        this.uiServicePanel.contextId = contextId;
        
        this.uiServicePanel.show();
    },

    /**
     * Returns the command stack.
     * 
     * @method getCommandStack
     * @return {wfeditor.CommandStack}
     */
    getCommandStack : function()
    {
        return this.commandStack;
    },

    /**
     * This method returns the name of login user.
     * // TODO need to retrieve from the backend?
     * 
     * @method getUser
     */
    getUser: function() {
        return this.loginUser;
    }
};

/**
 * Constructor. Stores each workflow's information that was opened
 * in the open workflow tab.
 * 
 * @constructor
 * @param {Object} editor WorkflowEditor.
 * @param {Object} options Options for constructing OpenWorkflows. Currently not used.
 */
wfeditor.OpenWorkflows = function(editor, options) {
    this.editor = editor;
    this.listWorkflows = [];
    // Set options
    this.options = {};
    this.setOptions(options || {});
};

wfeditor.OpenWorkflows.prototype = {
	/**
	 * Sets the options.
	 * 
	 * @param {Object} options Options to set.
	 */
    setOptions: function(options) {
    },

     /**
      * This method retrieves the specific openWorkflow's information
      * by specifying the index of the workflow. The index is "all the workflows":
      * For example if we have open workflows like this:
      *  RootWorkflow1
      *   InternalWorkflow1
      *   InternalWorkflow2
      *  RootWorkflow2
      *   InternalWorkflow3
      * if we want to retrieve "InternalWorkflow2", the index should be 2.
      * if we want to retrieve "RootWorkflow2", the index should be 3.
      * 
      * @method getOpenWorkflow
      * @param {int} index The index of the target workflow inside openWorkflows.
      */
    getOpenWorkflow: function(index) {
        var num = 0;
        for(var i = 0; i < this.listWorkflows.length; i++) {
            var oldnum = num;
            num = num + this.listWorkflows[i].getNumberOfWorkflows();
            if(num > index) {
                var workflows = this.listWorkflows[i].getWorkflows();
                var workflow = workflows[index - oldnum];
                return workflow;
            }
        }
    },
    
     /**
      * This method is similar to getOpenWorkflow. The difference is it returns
      * the listWorkflow which include the specified workflow, and the index of
      * the workflow within the listWorkflow.
      * For example if we have open workflows like this:
      *  RootWorkflow1
      *   InternalWorkflow1
      *   InternalWorkflow2
      *  RootWorkflow2
      *   InternalWorkflow3
      * 
      * if we specified 2 for idx, this methods returns
      *  {
      *     listWorkflow: the first listWorkflow including three workflows,
      *     index: 2
      *  }
      *  
      * @method getListWorkflowIncludeIndex
      * @param {int} idx The index of the target workflow inside openWorkflows.
      */
    getListWorkflowIncludeIndex: function(idx) {
        var num = 0;
        for(var i = 0; i < this.listWorkflows.length; i++) {
            var oldnum = num;
            num = num + this.listWorkflows[i].getNumberOfWorkflows();
            if(num > idx) {
                return {
                    listWorkflow: this.listWorkflows[i],
                    index: idx - oldnum
                };
            }
        }
    },
    
     /**
      * This method removes the specific openWorkflow from openWorkflows
      * by specifying the index of the workflow.
      * 
      * @method removeOpenWorkflow
      * @param {int} index The index of the target workflow inside openWorkflows.
      */
    removeOpenWorkflow: function(index) {
        var num = 0;
        for(var i = 0; i < this.listWorkflows.length; i++) {
            var oldnum = num;
            num = num + this.listWorkflows[i].getNumberOfWorkflows();
            if(num > index) {
                var workflows = this.listWorkflows[i].getWorkflows();
                workflows.splice(index - oldnum, 1);
                return;
            }
        }
    },
    
     /**
      * This method adds a new listWorkflow with new root workflow
      * at the end of openWorkflows.
      * 
      * @method addNewWorkflow
      */
    addNewWorkflow: function() {
        var rootWorkflow = {
            properties: {},
            containers: [],
            wires: [],
            canvasReadOnly: false,
            workflowId: null,
            markSaved: true
        };
        var listWorkflow = new wfeditor.ListWorkflow(rootWorkflow, this.editor);
        listWorkflow.moduleCounter = this.editor.composePerspective.getDefaultModuleCounter();
        listWorkflow.initialRootWorkflowName = this.editor.composePerspective.getDefaultRootWorkflowName()
                                    + this.editor.composePerspective.getGlobalCounterAndIncrement();
        listWorkflow.workflowName = "";
        listWorkflow.composepermission = "DELETE";
        listWorkflow.executepermission = "EXECUTE";

        this.listWorkflows.push(listWorkflow);
    },

     /**
      * This method adds a new child workflow to the specified listWorkflow.
      * As of now this is called when drilling down a workflow.
      * 
      * @method addNewChildWorkflow
      * @arg openWorkflowIndex: the parent workflow's index within this openWorkflows,
      *      workflowId: the id of the child workflow to add.
      *      canvasReadOnly: whether the canvas is readonly or not.
      */
    addNewChildWorkflow: function(arg) {
        var openWorkflowIndex = arg.openWorkflowIndex;
        var workflowId = arg.workflowId;
        var canvasReadOnly = arg.canvasReadOnly || false;

        var num = 0;
        for(var i = 0; i < this.listWorkflows.length; i++) {
            var oldnum = num;
            num = num + this.listWorkflows[i].getNumberOfWorkflows();
            if(num > openWorkflowIndex) {
                var targetListWorkflow = this.listWorkflows[i];
                targetListWorkflow.addChildWorkflow({
                    properties: {},
                    containers: [],
                    wires: [],
                    canvasReadOnly: canvasReadOnly,
                    workflowId: workflowId,
                    markSaved: true
                });
                break;
            }
        }
        return num;
    },

    /**
     * This method returns true if the workflow specified by the index
     * is a root workflow.
     * 
     * @method isRootWorkflow
     * @index the index of the target workflow.
     */
    isRootWorkflow: function(index) {
        var num = 0;
        for(var i = 0; i < this.listWorkflows.length; i++) {
            var oldnum = num;
            num = num + this.listWorkflows[i].getNumberOfWorkflows();
            if(num > index) {
                return oldnum == index;
            }
        }
    },
    
    /**
     * This method checks all the open workflows to see if any of them has the given ID.
     * 
     * @method hasWorkflowId
     * @param {String} id The ID to check for.
     * @returns true if a workflow with the given ID is in the list, false otherwise.
     */
    hasWorkflowId: function(id) {
    	for(var i = 0; i < this.listWorkflows.length; i++) {
    		for(var j = 0; j < this.listWorkflows[i].workflows.length; j++) {
    			if(this.listWorkflows[i].workflows[j].workflowId == id) {
    				return true;
    			}
    		}
    	}
    	
    	// if we get this far, we didn't find it
    	return false;
    }
}

/**
 * Constructor. Stores the list of workflows that are one set of root-children.
 * 
 * @constructor
 * @param {Object} rootWorkflow When ListWorkflow is initialized, we need the rootWorkflow for it.
 * @param {Object} editor WorkflowEditor.
 */
wfeditor.ListWorkflow = function(rootWorkflow, editor) {
    this.editor = editor;

    this.initialRootWorkflowName = null;
    this.workflowName = null;
    this.moduleCounter = 0;
    
    this.workflows = [];
    this.workflows.push(rootWorkflow);
};

wfeditor.ListWorkflow.prototype = {
    /**
     * This method returns the number of workflows stored in ListWorkflow.
     * 
     * @method getNumberOfWorkflows
     */
    getNumberOfWorkflows: function() {
        return this.workflows.length;
    },

    /**
     * This method returns the workflows stored in ListWorkflow.
     * 
     * @method getWorkflows
     */
    getWorkflows: function() {
        return this.workflows;
    },
    
    /**
     * This method returns the root workflow stored in ListWorkflow.
     * 
     * @method getRootWorkflow
     */
    getRootWorkflow: function() {
        return this.workflows[0];
    },

    /**
     * This method adds a child workflow at the end of the workflows in ListWorkflow.
     * 
     * @method addChildWorkflow
     */
    addChildWorkflow: function(childWorkflow) {
        this.workflows.push(childWorkflow);
    }

};
