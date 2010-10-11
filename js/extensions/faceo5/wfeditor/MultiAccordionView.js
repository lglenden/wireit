/**
 * This class is a hierarchical extension to the AccordionView.
 * 
 * @class MultiAccordionView
 * @namespace wfeditor
 * 
 * @author Laura
 *
 */

/**
 * Constructor.  Sets the options and instantiates properties.
 * 
 * @constructor
 * @param {Object} options Options for constructing the accordion.
 */
wfeditor.MultiAccordionView = function(options) {
	this.setOptions(options);
	
	this.clearItems();
};

wfeditor.MultiAccordionView.prototype = {
	
	/**
	 * This method sets the configuration options for this object.
	 * 
	 * @method setOptions
	 * @param {Object} options The configuration options.
	 */
	setOptions : function(options) {
		/**
		 * The configuration options have the following properties:
		 * - parent: The ID of the parent element to appent this view to.  (No default.)
		 * - viewOptions: The options to pass to the constructors of the AccordionViews.
		 * 
		 * @property options
		 * @type {Object}
		 */
		this.options = {};
		
		this.options.parent = options.parent;
		
		this.options.viewOptions = options.viewOptions || {
			collapsible: true,
            expandable: true, // remove this parameter to open only one panel at a time
            width: 'auto',
            animationSpeed: '0.1',
            animate: false, 
            effect: YAHOO.util.Easing.easeBothStrong
		}
	},
	
	/**
	 * This method clears all the items from the accordion view(s).
	 * 
	 * @method clearItems
	 */
	clearItems : function() {
		/**
		 * This property is a map from the accordion ID to an array of its panel labels.
		 * 
		 * @property panels
		 * @type {Object}
		 */
        this.panels = {};
        
        /**
         * This property is amap from the parent div ID to the accordion view.
         * 
         * @property views
         * @type {Object}
         */
        this.views = {};
		
		YAHOO.util.Dom.get(this.options.parent).innerHTML = "";
		
		/**
		 * This property is the parent accordion.
		 * 
		 * @property accordion
		 * @type {YAHOO.widget.AccordionView}
		 */
        this.accordion = new YAHOO.widget.AccordionView(YAHOO.util.Dom.generateId(),
            YAHOO.lang.merge(this.options.viewOptions));
        this.accordion.appendTo(this.options.parent);
		
        this.panels[this.accordion.get("id")] = [];
        this.views[this.options.parent] = this.accordion;
	},
	
	/**
	 * This method expands all the panels in all the accordions.
	 * 
	 * @method expandAll
	 */
	expandAll : function() {
		var view;
		var nPanels;
		for(var i in this.views) {
			view = this.views[i];
			if(view.getPanels()) {
                nPanels = view.getPanels().length;
			    for(var j = 0; j < nPanels; j++) {
				    view.openPanel(j);
			    }
			}
		}
	},
	
	/**
	 * This method adds the given item to the view.  The item should have the following
	 * properties:
	 * - el (The TML element to add)
	 * - categories (An array of categories for the element)
	 * 
	 * @method addItem
	 * @param {Object} item
	 */
	addItem : function(item) {
		this._addItem(item.el, item.categories, this.accordion, 0);
	},
	
	/**
	 * This method will locate the element indicated in the parameter and remove it if it's the
	 * only child from the panel.
	 * 
	 * @method removeCategory
	 * @param {String} strRemoveCategory The category name to remove (NoCategory).
	 */
	removeCategory : function(strRemoveCategory) {
        // We check we have a value.
        if (!strRemoveCategory) {
            return;
        }
        
        // We check that the type is string.
        if (typeof strRemoveCategory != "string") {
            return;
        }
        
        // If the category is empty we do nothing.
        if (strRemoveCategory == "") {
        	return;
        }
        
        /*
         * For every panel in the accordion, we locate the element that only have one child and
         * that child is NoCategory
         */
        for (strPanelId in this.panels) {
        	var panels = this.panels[strPanelId];
        	
        	// If this panel has only 1 element and that element is the category to remove.
        	if (panels.length == 1 && panels[0] == strRemoveCategory) {
        	   // We locate the ul that contains the NoCategory element
        	   var ulNoCat = YAHOO.util.Dom.get(strPanelId);
        	   // We locate the destination DIV parent of NoCategory
        	   var divContainer = ulNoCat.parentNode.parentNode;
        	   // We locate the children of NoCategory
        	   var divElements = ulNoCat.childNodes[0].childNodes[1].childNodes[0];
        	   
        	   // We remove what's contained inside NoCategory
        	   divContainer.removeChild(divContainer.childNodes[0]);
        	   // We append the list of NoCategory children to the parent of NoCategory
        	   divContainer.appendChild(divElements);
        	}
      	}		
	},
	
	/**
	 * This method is a recursive helper method to addItem.
	 * 
	 * @method _addItem
	 * @param {HTMLElement} el The element to add.
	 * @param {Array} categories The current categories in the recursion.
	 * @param {YAHOO.widget.AccordionView} accordion The current accordion in the recursion.
	 * @param {Number} indentLevel The current indentation level in the recursion.
	 */
	_addItem : function(el, categories, accordion, indentLevel) {
		var category = categories[0].labelText;
		
		// Find panel
		var panels = this.panels[accordion.get("id")];
		var index = 0;
		//console.log(category + ' ' + YAHOO.lang.JSON.stringify(panels));
		for(; index < panels.length; index++) {
			if(panels[index] == category) {
				break;
			}
		}
		
		// If panel isn't there, add it
		var id;
		if(index == panels.length) {
			id = YAHOO.util.Dom.generateId();
			panels.push(category);
			accordion.addPanel({
				label: category,
				content: "<div id='" + id + "' style='margin-left: 10px'></div>"
			});
		} else {
			id = accordion.getPanel(index).childNodes[1].childNodes[0].id;
		}
		
		// Base case: add element to panel
		if(categories.length == 1) {
			YAHOO.util.Dom.get(id).appendChild(el);
		}
		
		// Recursive case: add another view
		else {
			var view = this.views[id];
			
			// Add a child view if there's not one already
			if(!view) {
				view = new YAHOO.widget.AccordionView(YAHOO.util.Dom.generateId(),
                    YAHOO.lang.merge(this.options.viewOptions));
                view.appendTo(id);
                this.panels[view.get("id")] = [];
                this.views[id] = view;
			}
			
			// Make recursive call
			this._addItem(el, categories.slice(1), view, indentLevel + 1);
		}
	}
}