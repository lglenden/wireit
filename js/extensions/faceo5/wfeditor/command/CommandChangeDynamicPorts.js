/**
 * This class is the command wrapper around the "adding/removing dynamic ports" operation
 * on the canvas.
 * 
 * @class CommandChangeDynamicPorts
 * @namespace wfeditor.command
 * @extends wfeditor.command.Command
 * 
 * @author Laura
 */

/**
 * Constructor.
 * 
 * @constructor
 * @param {wfeditor.MultiPortService} service The service that had a port added/removed.
 * @param {Boolean} portAdded Whether the port was added (true) or removed (false).
 */
wfeditor.command.CommandChangeDynamicPorts = function(service, portAdded) {
	/**
	 * This property holds a reference to the multi-port service.
	 * 
	 * @property service
	 * @type {wfeditor.MultiPortService}
	 */
	this.service = service;
	    
	/**
	 * This property is a flag for whether the port was added (true) or removed (false).
	 * 
	 * @property portAdded
	 * @type {Boolean}
	 */
	this.portAdded = portAdded;
	    
    // Call parent constructor.
    wfeditor.command.CommandChangeParameter.superclass.constructor.call(this, "CommandChangeDynamicPorts");
};

YAHOO.lang.extend(wfeditor.command.CommandChangeDynamicPorts, wfeditor.command.Command, {
    
    /**
     * This method overrides the parent class.  Does nothing because the command has already
     * happened.
     * 
     * @method execute
     */
    execute : function() { },
    
    /**
     * This method overrides the parent class.  Either adds/removes ports as needed.
     * 
     * @method undo
     */
    undo : function() {
        if(this.portAdded) {
        	this.service.onRemovePort(true);
        } else {
        	this.service.onAddPort(true);
        }  	
    },
    
    /**
     * This method overrides the parent class.  Either adds/removes ports as needed.
     * 
     * @method redo
     */
    redo : function() {
        if(this.portAdded) {
            this.service.onAddPort(true);
        } else {
            this.service.onRemovePort(true);
        }   
    }
});
