/**
 * This class is the command wrapper around the "change service configuration parameter" operation
 * on the canvas.
 * 
 * @class CommandChangeParameter
 * @namespace wfeditor.command
 * @extends wfeditor.command.Command
 * 
 * @author Laura
 */

/**
 * Constructor.  Keeps references to the container, old form value, and new form value.
 * 
 * @constructor
 * @param {wfeditor.Service} container Service container.
 * @param {Object} oldValue The old value of the properties form.
 * @param {Object} newValue The new value of the properties form.
 */
wfeditor.command.CommandChangeParameter = function(container, oldValue, newValue) {
	/**
	 * This property holds a reference to the service container.
	 * 
	 * @property container
	 * @type {wfeditor.Service}
	 */
	this.container = container;
	
	/**
	 * This property holds the old value of the service properties form.
	 * 
	 * @property oldValue
	 * @type {Object}
	 */
	this.oldValue = oldValue;
	
	/**
	 * This property holds the new value of the service properties form.
	 * 
	 * @property newValue
	 * @type {Object}
	 */
	this.newValue = newValue;
	
    // Call parent constructor.
    wfeditor.command.CommandChangeParameter.superclass.constructor.call(this, "CommandChangeParameter");
};

YAHOO.lang.extend(wfeditor.command.CommandChangeParameter, wfeditor.command.Command, {
    
    /**
     * This method overrides the parent class.  It does nothing because this command is sent after
     * the user has already changed the parameter value.
     * 
     * @method execute
     */
    execute : function() { },
    
    /**
     * This method overrides the parent class.  It sets the old value on the form.
     * 
     * @method undo
     */
    undo : function() {
        this.container.form.setValue(this.oldValue, false); // don't propagate changed events
        this.container.containerForm.setValue(this.oldValue, false);
    },
    
    /**
     * This method overrides the parent class.   It re-sets the new value on the form.
     * 
     * @method redo
     */
    redo : function() {
    	this.container.form.setValue(this.newValue, false); // don't propagate changed events
    	this.container.containerForm.setValue(this.newValue, false);
    }
});
