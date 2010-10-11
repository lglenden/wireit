/**
 * This class is the command wrapper around the "disconnect port" operation on the canvas.
 * 
 * @class CommandDisconnectPort
 * @namespace wfeditor.command
 * @extends wfeditor.command.Command
 * 
 * @author Laura
 */

/**
 * Constructor.  Takes the wire that was removed.
 * 
 * @constructor
 * @param {WireIt.Wire} wire The wire that was removed.
 */
wfeditor.command.CommandDisconnectPort = function(wire) {
	/**
	 * This property holds a reference to the wire's terminal1.
	 * 
	 * @property term1
	 * @type {WireIt.TerminalExt}
	 */
    this.term1 = wire.terminal1;
    
    /**
     * This property holds a reference to the wire's terminal2.
     * 
     * @property term2
     * @type {WireIt.TerminalExt}
     */
    this.term2 = wire.terminal2;
    
    /**
     * This property holds a reference to the wire's parent element.
     * 
     * @property parentEl
     * @type {HTMLElement}
     */
    this.parentEl = wire.parentEl;
    
    /**
     * This property holds a reference to the newly created wire, when we undo.
     * 
     * @property wire
     * @type {WireIt.Wire}
     */
    this.wire = null;
	
    // Call parent constructor.
    wfeditor.command.CommandDisconnectPort.superclass.constructor.call(this, "CommandDisconnectPort");
};

YAHOO.lang.extend(wfeditor.command.CommandDisconnectPort, wfeditor.command.Command, {
    
    /**
     * This method overrides the parent class.  Removes the associated "CommandConnectPort" command.
     * 
     * @method execute
     */
    execute : function() {
        var remove = function(stack) {
            var command;
            for(var i = 0; i < stack.length; i++) {
                command = stack[i];
                if(command.getLabel() == "CommandConnectPort" && command.term1 == this.term1
                    && command.term2 == this.term2) {
                	editor.commandStack.removeCommand(command);
                    break;
                }
            }
        }
        
        remove(editor.commandStack.undostack);
        remove(editor.commandStack.redostack);
    },
    
    /**
     * This method overrides the parent class.  It recreates and redraws the wire.
     * 
     * @method undo
     */
    undo : function() {
        this.wire = new WireIt.Wire(this.term1, this.term2, this.parentEl, this.term1.options.wireConfig);
        this.wire.redraw();
    },
    
    /**
     * This method overrides the parent class.  It re-removes the wire.
     * 
     * @method redo
     */
    redo : function() {
        this.wire.remove();
        this.wire = null;
    }
});
