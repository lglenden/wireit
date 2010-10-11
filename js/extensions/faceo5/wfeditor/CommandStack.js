/**
 * An implementation of memento pattern. It maintains two stacks: one for undo and one for redo.
 * 
 * @class CommandStack
 * @namespace wfeditor
 * @author Aparup
 *
 */
 
/**
 * Constructor.  Initializes stacks.
 * 
 * @constructor
 */
wfeditor.CommandStack = function() {
   /** @private **/
   this.undostack = [];
   
   /** @private **/
   this.redostack = [];
   
   /** @private **/
   this.maxundo = 50;
   
   /**
    * This property is a custom event for when "undo" becomes available or unavailable.  Whether
    * or not it is available is passed in as an argument.
    * 
    * @property onCanUndo
    * @type {YAHOO.util.CustomEvent}
    */
    this.onCanUndo = new YAHOO.util.CustomEvent("onCanUndo");
    
    /**
     * This property is a custom event for when "redo" becomes available or unavailable.  Whether
     * or not it is available is passed in as an argument.
     * 
     * @property onCanRedo
     * @type {YAHOO.util.CustomEvent}
     */
    this.onCanRedo = new YAHOO.util.CustomEvent("onCanRedo");
};



/** @private **/
wfeditor.CommandStack.prototype.type = "wfeditor.CommandStack";

/**
 * Set the maximal undo stack size. Entries will be remove if the max. stack 
 * size has been reached.
 * @method setUndoLimit
 * @namespace wfeditor
 * @param {int} count The maximal undo stack size.
 * 
 **/
wfeditor.CommandStack.prototype.setUndoLimit = function(/*:int*/ count) {
  this.maxundo = count;
};



/**
 * Executes the specified Command if possible. 
 * @param {wfeditor.Command} command The command to execute.
 * @namespace wfeditor
 * @method execute
 **/
wfeditor.CommandStack.prototype.execute = function(/*:wfeditor.Command*/ command) {
   // nothing to do
   if(command === null)
      return; //silently

   // return if the command can't execute or it doesn't change the model
   // => Empty command
   if(command.canExecute() == false)
      return;


   // Try to execute, but if something goes wrong don't add it to the stack
   try {
     command.execute();
   } catch(ex) {
   	 return;
   }
   this.undostack.push(command);
   
   // Fire event if needed
   if(this.undostack.length == 1) {
       this.onCanUndo.fire(true);
   }

   // cleanup the redo stack if the user execute a new command.
   // I think this will create a "clean" behaviour of the unde/redo mechanism.
   //
   this.clearRedoStack();

   // monitor the max. undo stack size
   //
   if(this.undostack.length > this.maxundo) {
      this.undostack = this.undostack.slice(this.undostack.length - this.maxundo);
   }
};

/**
 * Undo the command
 * @method undo
 * @namespace wfeditor
 **/
wfeditor.CommandStack.prototype.undo = function() {
   var command = this.undostack.pop();
   
   if(command) {
   	   // Fire event if needed
       if(this.undostack.length == 0) {
           this.onCanUndo.fire(false);
       }
   	
      // Try to execute, but if something goes wrong don't add it to the stack
      try {
        command.undo();
      } catch(ex) {
      	return;
      }
      
      this.redostack.push(command);
      
      // Fire event if needed
      if(this.redostack.length == 1) {
      	this.onCanRedo.fire(true);
      }
   }
};

/**
 * Redo the command after the user has undo this command
 * @method redo
 * @namespace wfeditor
 **/
wfeditor.CommandStack.prototype.redo = function() {
   var command = this.redostack.pop();

   if(command) {
   	   // Fire event if needed
       if(this.redostack.length == 0) {
          this.onCanRedo.fire(false);
       }
   
      // Try to execute, but if something goes wrong don't add it to the stack
      try {
        command.redo();
      } catch(ex) {
      	return;
      }
      
      this.undostack.push(command);
      
      // Fire event if needed
      if(this.undostack.length == 1) {
      	this.onCanUndo.fire(true);
      }
   }
};

/**
 * @method canRedo
 * @namespace wfeditor
 * @returns <code>true</code> if it is appropriate to call {@link #redo()}.
 */
wfeditor.CommandStack.prototype.canRedo = function() {
   return this.redostack.length > 0;
};

/**
 * @method canUndo
 * @namespace wfeditor
 * @returns <code>true</code> if {@link #undo()} can be called
 **/ 
wfeditor.CommandStack.prototype.canUndo = function() {
   return this.undostack.length > 0;
};

/**
 * Clears the undoStack
 * @method clearUndoStack
 * @namespace wfeditor
 **/
wfeditor.CommandStack.prototype.clearUndoStack = function() {
	this.undostack = [];
	this.onCanUndo.fire(false);
};

/**
 * Clears the redoStack
 * @method clearRedoStack
 * @namespace wfeditor
 **/
wfeditor.CommandStack.prototype.clearRedoStack = function() {
	this.redostack = [];
	this.onCanRedo.fire(false);
};

/**
 * Clears the both undo and redo stack
 * @method clearAll
 * @namespace wfeditor
 **/
wfeditor.CommandStack.prototype.clearAll = function() {
	this.clearUndoStack();
	this.clearRedoStack();
	this.onCanUndo.fire(false);
	this.onCanRedo.fire(false);
};

/**
 * This method removes the given command from the undo stack or redo stack (wherever it is).
 * 
 * @method removeCommand
 * @namespace wfeditor
 */
wfeditor.CommandStack.prototype.removeCommand = function(command) {
	if(!command) {
		return;
	}
	
	// Check undo stack
	for(var i = 0; i < this.undostack.length; i++) {
		if(this.undostack[i] == command) {
			// Remove it
			this.undostack.splice(i, 1);
			
			// Fire event if needed
			if(this.undostack.length == 0) {
				this.onCanUndo.fire(false);
			}
			return;
		}
	}
	
	// Check redo stack
	for(var i = 0; i < this.redostack.length; i++) {
        if(this.redostack[i] == command) {
            // Remove it
            this.redostack.splice(i, 1);
            
            // Fire event if needed
            if(this.redostack.length == 0) {
                this.onCanRedo.fire(false);
            }
            return;
        }
    }
};
