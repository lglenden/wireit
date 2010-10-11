/**
 * This class is the command wrapper around the "remove service" operation on the canvas.
 * 
 * @class CommandRemoveService
 * @namespace wfeditor.command
 * @extends wfeditor.command.Command
 * 
 * @author Laura
 */

/**
 * Constructor.  Takes a reference to the container.
 * 
 * @constructor
 * @param {Object} container The container to remove.
 */
wfeditor.command.CommandRemoveService = function(container) {
	/**
	 * This property contains a reference to the container to remove.
	 * 
	 * @property container
	 * @type {Object}
	 */
	this.container = container;
	
	/**
	 * This property holds a reference to the module that is the parent of the container.
	 * It is necessary to re-instantiate it.
	 * 
	 * @property module
	 * @type {Object}
	 */
	this.module = null;
	
	/**
	 * This property holds a reference to the position of the container.  It is necessary to
	 * re-instantiate it.
	 * 
	 * @property pos
	 * @type {Object}
	 */
	this.pos = null;
	  
    // Call parent constructor.
    wfeditor.command.CommandRemoveService.superclass.constructor.call(this, "CommandRemoveService");
};

YAHOO.lang.extend(wfeditor.command.CommandRemoveService, wfeditor.command.Command, {
    
    /**
     * This method overrides the parent class.  It removes the service.
     * 
     * @method execute
     */
    execute : function() {
    	// Set up module and pos
    	this.module = editor.modulesByName[this.container.options.title];
    	this.pos = this.container.getConfig().position;
    	
        // Remove container
        this.container.layer.removeContainer(this.container);
        
        // Find and remove other commands for this port.
        wfeditor.util.removeServiceCommands(this.container,
            ["CommandAddService", "CommandMoveService", "CommandChangeDynamicPorts",
             "CommandChangeParameter"]);
    },
    
    /**
     * This method overrides the parent class.  It adds the service back to the old position.
     * 
     * @method undo
     */
    undo : function() {
        editor.composePerspective._addModule(this.module, this.pos, this);
    },
    
    /**
     * This method overrides the parent class.  It re-removes the service.
     * 
     * @method redo
     */
    redo : function() {
        this.execute();
    }
});
