/**
 * This class is the command wrapper around the port connection operation on the canvas.
 * 
 * @class CommandConnectPort
 * @namespace wfeditor.command
 * @extends wfeditor.command.Command
 * 
 * @author Aparup
 *
 */
 
/**
 * Constructor.  Keeps a reference to the necessary properties of the given wire.
 * 
 * @constructor
 * @param {WireIt.Wire} wire The wire to reference.
 */
wfeditor.command.CommandConnectPort = function(wire) {
	/**
	 * This property is a reference to the wire.
	 * 
	 * @property wire
	 * @type {WireIt.Wire}
	 */
	this.wire = wire;
	
	// Call parent constructor.
	wfeditor.command.CommandConnectPort.superclass.constructor.call(this, "CommandConnectPort");
};

YAHOO.lang.extend(wfeditor.command.CommandConnectPort, wfeditor.command.Command, {

	/**
	 * @method execute
	 * Redraw the wire.
	 */
	execute : function(){
		this.wire.redraw();
	},
	
	/**
	 * @method undo
	 * First clone the wire and then remove the wire.
	 */
	undo : function(){
		//create a clone of the contents of the previous wire.
		this.term1 = this.wire.terminal1;
		this.term2 = this.wire.terminal2;
		this.parentEl = this.wire.parentEl;
		//now remove the wire
		
		// Unset this flag so that a "remove wire" command isn't generated
		if(this.wire.isValidWire) {
			delete this.wire.isValidWire;
		}
		
		this.wire.remove();
		
	},
	
	/**
	 * @method redo
	 * Redraw the wire.
	 */
	redo : function(){
		var newwire = new WireIt.Wire(this.term1, this.term2, this.parentEl, this.term1.options.wireConfig); 
		newwire.redraw();
		this.wire = newwire;
	}
});
