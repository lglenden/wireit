/**
 * A WireableField is a class meant to override inputEx's Field class in order to
 * provide wires.  It is based heavily upon WireIt's WireableField class, but doesn't
 * directly inherit from it because we require a lot of custom coding.
 * 
 * @class WireableField
 * @namespace wfeditor
 * 
 * @author Laura
 * 
 */

/**
 * From WireIt:
 * Copy of the original inputEx.Field class that we're gonna override to extend it.
 * @class BaseField
 * @namespace inputEx
 */
inputEx.BaseField = inputEx.Field;

/**
 * Constructor.  Right now it only calls the super class's constructor.
 * 
 * @constructor
 * @param {Object} options Options for constructing the field.  See inputEx
 * documentation.
 */
inputEx.Field = function(options) {
	inputEx.Field.superclass.constructor.call(this, options);
};

/**
 * This property is a static object that represents which types are allowed to
 * be wired to a wireable field.  For now, pretty much anything that is "string-like"
 * (password, select, string, text) can be wired to anything else that is
 * "string-like."  The only exception is boolean.
 * 
 * @static
 * @property {Object} allowedTypesMap
 */
inputEx.Field.allowedTypesMap = {
    "boolean":  ["boolean", "anyType"],
    "password": ["boolean", "password", "select", "string", "text", "anyType"],
    "select":   ["boolean", "password", "select", "string", "text", "anyType"],
    "string":   ["boolean", "password", "select", "string", "text", "anyType"],
    "text":     ["boolean", "password", "select", "string", "text", "anyType"]
};

// For now, an integer just uses a string type..
inputEx.Field.allowedTypesMap["integer"] = inputEx.Field.allowedTypesMap["string"]; 


YAHOO.lang.extend(inputEx.Field, inputEx.BaseField, {
	
	/**
	 * Overrides inputEx.Field.setOptions.  Calls the parent class and then
	 * sets options custom to this class: "wireable" (boolean), "container"
	 * (WireIt.Container), and "type" (String).
	 * 
	 * @method setOptions
	 * @param {Object} options Options for constructing the field.  See inputEx
     * documentation.
	 */
	setOptions: function(options) {
		inputEx.Field.superclass.setOptions.call(this, options);
		
		this.options.wireable = options.wireable || false;
		this.options.container = options.container;
		this.options.type = options.type;
		
		if(YAHOO.lang.isUndefined(options.editable)) {
			this.options.editable = true;
		} else {
			this.options.editable = options.editable;
		}
	},
	
	/**
	 * Overrides inputEx.Field.render.  Calls the parent class and then renders
	 * the terminal for this field if needed.
	 * 
	 * @method render
	 */
	render: function() {
		try {
		inputEx.Field.superclass.render.call(this);
		
		if(this.options.wireable && this.options.container && this.options.type) {
			this.renderTerminal();
		}
		} catch(ex) { alert(ex); }
	},
	
	/**
	 * This method renders the terminal for wiring this field.  It is based
	 * heavily on WireIt's WireableField class.
	 * 
	 * @method renderTerminal
	 */
	renderTerminal: function() {
		if(!inputEx.Field.allowedTypesMap[this.options.type]) {
            // For now, just put it in as being only wireable to its own type
            inputEx.Field.allowedTypesMap[this.options.type] = [ this.options.type, "anyType" ];
        }
		
		var wrapper = inputEx.cn('div', {className: 'WireIt-InputExTerminal'});
		
		if(this.labelDiv) {
			this.divEl.insertBefore(wrapper, this.labelDiv);
		} else {
			this.divEl.insertBefore(wrapper, this.fieldContainer);
		}
        
        this.terminal = new WireIt.TerminalExt(wrapper, {
            name: this.options.name, 
            direction: [-1, 0], // Input port
            ddConfig: {
                type: this.options.type,
                allowedTypes: inputEx.Field.allowedTypesMap[this.options.type]
            },
            nMaxWires: 1,
            editable: this.options.editable}, this.options.container);
        
        // Set flag on terminal so that, when we get the value, we know that it's
        // associated with a field rather than a port
        this.terminal.isField = true;
        
        // Add to container's list.
        if(!this.options.container.fieldTerminals) {
        	this.options.container.fieldTerminals = [];
        }
        this.options.container.fieldTerminals.push(this.terminal);
        
        // Register the events
        this.terminal.eventAddWire.subscribe(this.onAddWire, this, true);
        this.terminal.eventRemoveWire.subscribe(this.onRemoveWire, this, true);
	},
	
	/**
	 * This method is called when the user connects the field to something else.
	 * It is based heavily upon WireIt's WireableField code.
	 * 
	 * @method onAddWire
	 * @param {Event} e The event object.
	 * @param {Object} params The event parameters.
	 */
	onAddWire: function(e, params) {
        this.options.container.onAddWire(e,params);

/*
        this.disable();
        this.el.value = "[wired]";
        */
	},
	
    /**
     * This method is called when the user removes the connected wire from the field.
     * It is based heavily upon WireIt's WireableField code.
     * 
     * @method onRemoveWire
     * @param {Event} e The event object.
     * @param {Object} params The event parameters.
     */
	onRemoveWire: function(e, params) {
        this.options.container.onRemoveWire(e,params);

/*
        this.enable();
        this.el.value = "";
        */
	}
});