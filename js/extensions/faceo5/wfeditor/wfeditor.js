/**
 * wfeditor is the top level package. This is the only way to mimic package structure in javascript
 * @module wfeditor
 */

/**
 * @class wfeditor
 * @static
 * @namespace wfeditor
 */

/**
 * Top-level reference to the workflow editor object.
 * 
 * @property {wfeditor.WorkflowEditor} editor
 */
var editor;

/**
 * Top-level "package" object.
 */
var wfeditor = {

/**
 * Initial "language" (these options are passed into the WorkflowEditor constructor).
 * 
 * @property {Object} language
 */
language: {
	languageName: "dnaworkflow",
	modules: []
},

/**
 * This method is called when the HTML page is loaded and ready.  It instantiates
 * the workflow editor object and sets up the backend handling.
 * 
 * @method init
 */
init: function() {	
	// initialize editor with default options
	editor = new wfeditor.WorkflowEditor(wfeditor.language);
	
	// show login screen
	editor.showLogin();
	
	// initialize middle tier
	WfFacade.initialize();
	
    // set up DWR engine
    dwr.engine.setActiveReverseAjax(true);
    dwr.engine.setErrorHandler(this.handleError);
},

/**
 * This method can be called by the backend to handle an error.
 * It displays an error warning to the user and hides the waiting panel if it's
 * being shown.
 * 
 * @method handleError
 * @param {String} msg The error message.
 * @param {Object} exc An object holding "javaClassName" and "message."
 */
handleError : function(msg, exc) {
	// Show the logger and log the message
//	editor.outerLayout.getUnitByPosition('right').expand();
	
	editor.error(msg, "Error Message");
//    editor.logProgress(msg);
    
    // Hide the waiting panel if it's up
    if(editor.waitPanel) {
        editor.hideWait();
    }
    
    // Check if we need to re-enable execution perspective buttons
    if(editor.executePerspective.isExecuting) {
        editor.executePerspective.viewButton.set("disabled", false);
    }
    
    // Turn off "isExecuting" flag in execute perspective
    editor.executePerspective.isExecuting = false;
},

/**
 * Returns the static editor.
 * 
 * @static
 * @method getEditor
 * @return {wfeditor.WorkflowEditor} The static editor.
 */
getEditor : function () {
	return editor;
}

};

/**
 * All registered adapters.
 * 
 * @property {Object} adapters
 */
wfeditor.adapters = {};  
