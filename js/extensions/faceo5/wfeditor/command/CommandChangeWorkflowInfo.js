/**
 * This class is the command wrapper around the "change workflow metainformation" operation
 * on the canvas.
 * 
 * @class CommandChangeWorkflowInfo
 * @namespace wfeditor.command
 * @extends wfeditor.command.Command
 * 
 * @author Laura
 */

/**
 * Constructor.  It takes references to the form, old value, and new value.
 * 
 * @constructor
 * @param {inputEx.Group} form The meta-info form.
 * @param {Object} oldValue The old value for the form.
 * @param {Object} newValue The new value for the form.
 */
wfeditor.command.CommandChangeWorkflowInfo = function(form, oldValue, newValue) {
	/**
	 * This property keeps a reference to the inputEx form that is used for workflow
	 * meta-information.
	 * 
	 * @property form
	 * @type {inputEx.Group}
	 */
	this.form = form;
	
	/**
	 * This property keeps the old value of the workflow meta-information form.
	 * 
	 * @property oldValue
	 * @type {Object}
	 */
	this.oldValue = oldValue;
	
	/**
     * This property keeps the new value of the workflow meta-information form.
     * 
     * @property newValue
     * @type {Object}
     */
	this.newValue = newValue;
	
    // Call parent constructor.
    wfeditor.command.CommandChangeParameter.superclass.constructor.call(this, "CommandChangeWorkflowInfo");
};

YAHOO.lang.extend(wfeditor.command.CommandChangeWorkflowInfo, wfeditor.command.Command, {
    
    /**
     * This method overrides the parent class.  Does nothing because the user has already changed
     * the value by the time this command executes.
     * 
     * @method execute
     */
    execute : function() { },
    
    /**
     * This method overrides the parent class.  Sets the old value on the form.
     * 
     * @method undo
     */
    undo : function() {
        this.form.setValue(this.oldValue, false); // don't propagate change event
    },
    
    /**
     * This method overrides the parent class.   Re-sets the new value on the form.
     * 
     * @method redo
     */
    redo : function() {
        this.form.setValue(this.newValue, false); // don't propagate change event
    }
});
