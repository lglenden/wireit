/**
 * This class is the command wrapper around the "adding service" operation on the canvas.
 * 
 * @class CommandAddService
 * @namespace wfeditor.command
 * @extends wfeditor.command.Command
 * 
 * @author Laura
 */

/**
 * Constructor.  Takes references to the appropriate objects.
 * 
 * @constructor
 * @param {wfeditor.ComposePerspective} compose The compose perspective.
 * @param {Object} module See ComposePerspective.addModule.
 * @param {Object} pos See ComposePerspective.addModule.
 */
wfeditor.command.CommandAddService = function(compose, module, pos) {
	/**
	 * This property is a reference to the parent compose perspective.
	 * 
	 * @property compose
	 * @type {wfeditor.ComposePerspective}
	 */
	this.compose = compose;
	
	/**
	 * This property holds a reference to the module that was instantiated to a container.
	 * 
	 * @property module
	 * @type {Object}
	 */
	this.module = module;
	
	/**
	 * This property holds the position that the service was added to.
	 * 
	 * @property pos
	 * @type {Object}
	 */
	this.pos = pos;
	
	/**
	 * This property holds a reference to the instantiated container.
	 * 
	 * @property container
	 * @type {Object}
	 */
	this.container = null;
	
	// Call parent constructor.
	wfeditor.command.CommandAddService.superclass.constructor.call(this, "CommandAddService");
};

YAHOO.lang.extend(wfeditor.command.CommandAddService, wfeditor.command.Command, {
	
	/**
	 * This method overrides the parent class.  It calls the compose perspective's helper
	 * _addModule method.
	 * 
	 * @method execute
	 */
	execute : function() {
		this.compose._addModule(this.module, this.pos, this);
	},
	
	/**
	 * This method overrides the parent class.  It updates the position and then removes the
	 * container.
	 * 
	 * @method undo
	 */
	undo : function() {
		// Update position
		var config = this.container.getConfig();
		this.pos = config.position;
		
		// Remove from layer
		this.container.layer.removeContainer(this.container);
		
		// Find and remove matching "add service" and "move service" commands
        wfeditor.util.removeServiceCommands(this.container, ["CommandAddService", "CommandRemoveService"]);
		
		// Remove reference
		this.container = null;
	},
	
	/**
	 * This method overrides the parent class.  It re-adds the container.
	 * 
	 * @method redo
	 */
	redo : function() {
		this.execute();
	}
});
