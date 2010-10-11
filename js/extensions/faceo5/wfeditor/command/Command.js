/**
 * "Package" object.
 * 
 * @module wfeditor.command
 */
wfeditor.command = {};

/**
 * Base class for the undo redo support
 * Any operation on the canvas which needs to support undo/redo should be wrapped in this object.
 * @constructor
 */
wfeditor.command.Command=function(/*:String*/ label)
{
  this.label = label;
};


/**
 * Returns a label of the Command. e.g. "Connect Port".
 * @method getLabel
 * @namespace wfeditor.command
 * @return {string} The label for this command.
 **/
wfeditor.command.Command.prototype.getLabel=function()
{
   return this.label;
};


/**
 * Returns [true] if the command can be executed.
 * @method canExecute
 * @namespace wfeditor.command
 * @return {boolean} Whether a command can execute.
 **/
wfeditor.command.Command.prototype.canExecute=function()
{
  return true;
};

/**
 * Execute the command the first time.
 * Sub-classes must implement this method.
 * @method execute
 * @namespace wfeditor.command
 **/
wfeditor.command.Command.prototype.execute=function()
{
};


/**
 * Undo the command.
 * Sub-classes must implement this method.
 * @method undo
 * @namespace wfeditor.command
 *
 **/
wfeditor.command.Command.prototype.undo=function()
{
};

/** 
 * Redo the command after the user has undo this command.
 * Sub-classes must implement this method.
 * @method redo
 * @namespace wfeditor.command 
**/
wfeditor.command.Command.prototype.redo=function()
{
};
