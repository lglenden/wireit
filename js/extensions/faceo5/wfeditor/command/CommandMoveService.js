/**
 * This class is the command wrapper around the "move service" operation on the canvas.
 * 
 * @class CommandMoveService
 * @namespace wfeditor.command
 * @extends wfeditor.command.Command
 * 
 * @author Laura
 */

/**
 * Constructor.  It takes the container, the old position, and the new position.
 * 
 * @constructor
 * @param {Object} container The container.
 * @param {Array} oldPos The old position.
 * @param {Array} newPos The new position.
 */
wfeditor.command.CommandMoveService = function(container, oldPos, newPos) {
	/**
	 * This property keeps a reference to the container.
	 * 
	 * @property container
	 * @type {Object}
	 */
	this.container = container;
	
	/**
	 * This property holds the old position.
	 * 
	 * @property oldPos
	 * @type {Array}
	 */
	this.oldPos = oldPos;
	
	/**
	 * This property holds the new position.
	 * 
	 * @property newPos
	 * @type {Array}
	 */
	this.newPos = newPos;
	
    // Call parent constructor.
    wfeditor.command.CommandMoveService.superclass.constructor.call(this, "CommandMoveService");
};

YAHOO.lang.extend(wfeditor.command.CommandMoveService, wfeditor.command.Command, {
    
    /**
     * This method overrides the parent class.  Does nothing, because it's called after the
     * service is already dropped.
     * 
     * @method execute
     */
    execute : function() { },
    
    /**
     * This method overrides the parent class.  Moves the container back to the old position.
     * 
     * @method undo
     */
    undo : function() {
        // Set the position
        this.container.el.style.left = this.oldPos[0] + "px";
        this.container.el.style.top = this.oldPos[1] + "px";
        
        this.container.redrawAllWires();
    },
    
    /**
     * This method overrides the parent class.  Moves the container to the new position.
     * 
     * @method redo
     */
    redo : function() {
        // Set the position
        this.container.el.style.left = this.newPos[0] + "px";
        this.container.el.style.top = this.newPos[1] + "px";
        
        this.container.redrawAllWires();
    }
});
