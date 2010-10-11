/**
 * A CommentContainer is a simple subclass of WireIt's FormContainer class to hold
 * a text area for comments.
 * 
 * @class CommentContainer
 * @namespace wfeditor
 * @extends WireIt.FormContainer
 * 
 * @author Laura
 * 
 */

/**
 * Constructor.  Overrides default options and then calls the parent constructor.
 * 
 * @constructor
 * @param {Object} options The configuration options.
 * @param {WireIt.Layer} layer The layer for the container.
 */
wfeditor.CommentContainer = function(options, layer) {
	// Make comment field
	options.fields = [
	   {type: "text",
	    inputParams: {
	    	label: "",
	    	name: "comment",
	    	wirable: false }}
    ];
    
    options.collapsed = false;
    options.collapsible = false;
    if(options.legend) {
    	delete options.legend;
    }
	
	// Call the parent class's constructor.
    wfeditor.CommentContainer.superclass.constructor.call(this, options, layer);
    
    /**
     * This property holds a reference to the text area so that it can be resized
     * with the container.
     * 
     * @property textArea
     * @type {HTMLElement}
     */
    this.textArea = this.form.inputs[0].el;
    
    // Set up move command.
    if(this.dd) {
        var that = this;
        this.dd.on("startDragEvent", function(ev) {
            wfeditor.util.onServiceStartDrag(that);
        });
        this.dd.on("dragDropEvent", function(ev) {
            wfeditor.util.onServiceDragDrop(that);
        });
    }
};

YAHOO.lang.extend(wfeditor.CommentContainer, WireIt.FormContainer, {
	
	/**
	 * This method overrides the parent to add custom classname and xtype.
	 * 
	 * @method setOptions
	 * @param {Object} options See parent class.
	 */
	setOptions : function(options) {
		// Call the parent class.
        wfeditor.CommentContainer.superclass.setOptions.call(this, options);
        
        this.options.className += " CommentContainer";
        
        this.options.xtype = "wfeditor.CommentContainer";
	},
	
	/**
	 * This method overrides the parent to also resize the text area in the
	 * comment container.
	 * 
	 * @method onResize
	 * @param event {Object} See parent class.
	 * @param args {Array} See parent class.
	 */
	onResize : function(event, args) {
		// Call the parent class.
        wfeditor.CommentContainer.superclass.onResize.call(this, event, args);
        
        var width = this.bodyEl.style.width;
        var height = this.bodyEl.style.height;
        width = width.substr(0, width.length - 2);
        height = height.substr(0, height.length - 2);
        width -= 5;
        height -= 5;
        
        this.textArea.style.width = width + "px";
        this.textArea.style.height = height + "px";
	},
	
	/**
     * This method overrides the parent to use the command to remove the service.
     * 
     * @method onCloseButton
     * @param {Object} e See Container.onCloseButton.
     * @param {Array} args See Container.onCloseButton.
     */
    onCloseButton: function(e, args) {
        wfeditor.util.onServiceCloseButton(this, e, args);
    }
});