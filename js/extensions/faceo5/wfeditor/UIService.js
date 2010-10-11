/**
 * A UIService is a subclass of the MultiPortService class that connects a UI service
 * to one or more parameters of another service.
 * 
 * @class UIService
 * @namespace wfeditor
 * @extends wfeditor.MultiPortService
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
wfeditor.UIService = function(options, layer) {
    // Call the parent class's constructor.
    wfeditor.UIService.superclass.constructor.call(this, options, layer);
};

YAHOO.lang.extend(wfeditor.UIService, wfeditor.MultiPortService, {
    
    /**
     * This method overrides the parent class.  It sets configuration options for the
     * service.
     * 
     * @method setOptions
     * @param {Object} options Configuration options.
     */
    setOptions : function(options) {
    	// Set the options.
        options.title = options.title || "UI";
        options.topBottom = !YAHOO.lang.isUndefined(options.topBottom) ?
                            options.topBottom : false;
        options.nTopPorts = options.nTopPorts || 0;
        
    	
        // Call the parent class.
        wfeditor.UIService.superclass.setOptions.call(this, options);
        
        /**
         * The options property has the following properties related to the UIService
         * class:
         * - xtype ("wfeditor.UIService")
         */
        
        this.options.xtype = "wfeditor.UIService";
        this.options.url = options.url;
    },
    
    /**
     * This method returns the uiModel that will be passed to the front-end during
     * execution time to get user input for parameters.
     * 
     * @method uiModel
     * @returns The uiModel that is passed to the back-end for this container.
     */
    uiModel : function() {
    	var obj = { fields: [] };
    	
    	var term;
    	var wire;
    	var container = null;
    	var formValue;
    	var fields;
    	for(var i = 0; i < this.bottomPorts.length; i++) {
    		term = this.bottomPorts[i];
    		if(term.wires.length > 0) {
    			wire = term.wires[0];
    			if(wire.terminal1 == term) {
    				term = wire.terminal2;
    			} else {
    				term = wire.terminal1;
    			}

                // This code assumes that the UI service is only connected to one
                // container.  While it may not be true during construction, during
                // execution it will be true due to syntactics.  And during execution
                // is the only time this uiModel is being used.
                if(container == null) {
                	container = term.container;
                	formValue = container.form.getValue();
                	fields = container.options.fields.slice(0);
                }
                
                for(var j = 0; j < fields.length; j++) {
                	if(term.options.name == fields[j].inputParams.name) {
                		// Augment with the currently entered value
                        fields[j].inputParams.value = formValue[term.options.name];
                        delete fields[j].inputParams.container;
                        obj.fields.push(fields[j]);
                	}
               }
    		}
    	}

    	return obj;
    }
});