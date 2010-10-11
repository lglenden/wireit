/**
 * AccordionViewExt is a subclass of YUI's AccordionView class. In this subclass we remove any
 * keyboard event handling. Listening to the keyboard event caused some problems when the tab
 * contained a form.
 * 
 * @class AccordionViewExt
 * @namespace YAHOO.widget
 * @extends YAHOO.widget.AccordionView
 * 
 * @author Hector
 */
(function() {

/**
 * Constructor. The constructor just calls the parent class to create the instance.
 * 
 * @constructor
 * @param {HTMLElement | String} el The id of the html element that represents the AccordionView. 
 * @param {Object} oAttr (optional) A key map of the AccordionView's 
 * initial oAttributes.  
 */
YAHOO.widget.AccordionViewExt = function(el, oAttr) {
   YAHOO.widget.AccordionViewExt.superclass.constructor.call(this, el, oAttr);
};

YAHOO.lang.extend(YAHOO.widget.AccordionViewExt, YAHOO.widget.AccordionView, {
    /**
	 * Attach all event listeners. In this subclass we remove the handling of keyCode 13 (enter)
	 * that caused that the current tab gets closed.
	 * 
	 * @method initEvents
	 * @public
	 */  
	initEvents : function() {
	    if(true === this.get('hoverActivated')) {
            this.on('mouseover', this._onMouseOver, this, true);        
            this.on('mouseout', this._onMouseOut, this, true);         
	    }
	    
	    this.on('click', this._onClick, this, true);
	    this.on('keydown', this._onKeydown, this, true);
	    
	    // set this._opening and this._closing before open/close operations begin
	    
	    this.on('panelOpen', function(){this._opening = true;}, this, true);
	    this.on('panelClose', function(){this._closing = true;}, this, true);
	    
	    // This makes sure that this._fixTabindexes is called after a change has
	    // fully completed
	    
	    this.on('afterPanelClose', function(){
            this._closing = false;
	        if(!this._closing && !this._opening) {
	            this._fixTabIndexes();
	        }
	    }, this, true);
	    this.on('afterPanelOpen', function(){
	        this._opening = false;
	        if(!this._closing && !this._opening) {
	            this._fixTabIndexes();
	        }
	    }, this, true);
	},
	
	/**
     * We disable any keyboard event handling. Before, pressing enter causes that the current tab
     * closes; in the same way, pressing any arrow key causes to switch the tab focus to other tab.
     * 
     * @method _onKeydown
     * @param {Event} ev The Dom event
     * @private
     */
    _onKeydown : function(ev) {
    }
});

})();

// Register the class in YUI.
YAHOO.register("accordionviewext", YAHOO.widget.AccordionView, {version: "0.01", build: "0"});