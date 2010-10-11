/**
 * A ForkService is a subclass of the MultiPortService class that does forking of one
 * service's outputs to two or more outputs.
 * 
 * @class ForkService
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
wfeditor.ForkService = function(options, layer) {
	/**
	 * This property holdes the type that the top port is connected to.  This is used
	 * to dynamically set the type of the bottom ports.
	 * 
	 * @property connectedType
	 * @type {String}
	 */
	this.connectedType = "";
	
	// Call the parent class's constructor.
    wfeditor.ForkService.superclass.constructor.call(this, options, layer);
};

YAHOO.lang.extend(wfeditor.ForkService, wfeditor.MultiPortService, {
	
	/**
	 * This method overrides the parent method.  It sets the configuration options for
	 * building this object.
	 * 
	 * @method setOptions
	 * @param {Object} options The configuration options.
	 */
	setOptions : function(options) {
		// Set options
		options.title = options.title || "Fork";
		options.minBottomPorts = options.minBottomPorts || 2;
		options.nBottomPorts = options.nBottomPorts || 2;
		
		// Call the parent class.
        wfeditor.ForkService.superclass.setOptions.call(this, options);
        
        /**
         * The options property has the following properties related to the ForkService
         * class:
         * - xtype ("wfeditor.ForkService")
         * - unavailableClass: the class name to apply to "unavailable" terminals.
         */
        
        this.options.xtype = "wfeditor.ForkService";
        this.options.url = options.url;
        
        this.options.unavailableClass = options.unavailableClass || "ForkService-UnavailableTerm";
	},
	
	/**
	 * This method overrides the parent method to handle the dynamic typing associated
	 * with the fork service.
	 * 
	 * @method createPort
	 * @param {String} name The name of the port.
	 * @param {boolean} isInput Whether the port is an input or not.
	 * @param {boolean || null} nonEditable If true, makes the port non-editable.
	 */
	createPort : function(name, isInput, nonEditable) {
		if(!isInput && this.connectedType == "") {
			nonEditable = true;
		}
		
		// Call the parent class.
		var term = wfeditor.ForkService.superclass.createPort.call(this, name, isInput, nonEditable);
		
		if(isInput) {
			term.isAnyType = true;
		} else if(!this.options.readOnly && this.connectedType == "") {
		    term.el.className += " " + this.options.unavailableClass;
		} else if(term.dd) {
			term.dd.termConfig.type = this.connectedType;
			// TODO allowed types
		}
		
		return term;
	},
	
	/**
	 * This method overrides the parent method to do the dynamic typing.
	 * 
	 * @method onAddWire
	 * @param {Object} event Add wire event parameter.
	 * @param {Array} args Add wire event arguments.
	 */
	onAddWire : function(event, args) {
		// Call the parent class.
        wfeditor.ForkService.superclass.onAddWire.call(this, event, args);
		
		var input = this.topPorts[0];
		if((!input.dd || !input.dd.editingWire) && this.connectedType == "") {
			// The only way this can happen is if the user connected the input port.
            // So now we know the types for the output ports.
			if(args[0].terminal1 == input) {
				var term = args[0].terminal2;
			} else {
				var term = args[0].terminal1;
			}
			
			if(!term.dd) {
				return;
			}
            
            this.connectedType = term.dd.termConfig.type;
            
            // Remove the output terminals...
            var term;
            for(var i = 0; i < this.bottomPorts.length; i++) {
            	term = this.bottomPorts[i];
            	for(var j = 0; j < this.terminals.length; j++) {
            		if(term == this.terminals[j]) {
            			this.terminals.splice(j, 1);
            		}
            	}
            	term.remove();
            }
            this.bottomPorts = [];
            
            // ...and re-add them.
            for(var i = 0; i < this.options.nBottomPorts; i++) {
            	this.bottomPorts.push(this.createPort("output[" + i + "]", false,
            	   this.options.readOnly));
            }
            this._showOrHideRemoveImg();
            this.repositionPorts();
		}
	},
	
	/**
	 * This method overrides the parent method to do the dynamic typing for the fork
	 * service.
	 * 
	 * @method onRemoveWire
	 * @param {Object} event The remove wire event.
	 * @param {Array} args The remove wire arguments.
	 */
	onRemoveWire : function(event, args) {
		var wire = args[0];
		var input = this.topPorts[0];
		
		// Check if it's the input wire
		if((!input.dd || !input.dd.editingWire) && (wire.terminal1 == input || wire.terminal2 == input)) {
			this.connectedType = "";
			
			// Remove the output terminals...
			var term;
			for(var i = 0; i < this.bottomPorts.length; i++) {
                term = this.bottomPorts[i];
                for(var j = 0; j < this.terminals.length; j++) {
                    if(term == this.terminals[j]) {
                        this.terminals.splice(j, 1);
                    }
                }
                term.remove();
            }
            this.bottomPorts = [];
			
			// ...and re-add them.
			for(var i = 0; i < this.options.nBottomPorts; i++) {
                this.bottomPorts.push(this.createPort("output[" + i + "]", false, true));
            }
            this._showOrHideRemoveImg();
            this.repositionPorts();
		}
		
		// Call the parent class.
        wfeditor.ForkService.superclass.onRemoveWire.call(this, event, args);
	}
});
