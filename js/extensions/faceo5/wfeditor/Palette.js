/**
 * The Palette class holds the GUI widgets and logic associated with the workflow editor's
 * service palette.  It includes filter, search, and categorization; however, search and
 * categorization require callbacks to handle the logic.
 * 
 * @class Palette
 * @namespace wfeditor
 * 
 * @author Laura
 */

/**
 * The constructor builds and renders the palette.  It takes in any configuration options
 * and callbacks that are passed in.  See the documentation for the callbacks and options
 * properties for more information.
 * 
 * @constructor
 * @param {Object} callbacks Callback functions.
 * @param {Object} options Configuration options.
 */
wfeditor.Palette = function(callbacks, options) {
	/**
	 * This property holds the configuration options for the palette.  It is an
	 * object with the following properties:
	 * - id: The HTML id for the palette div.  If none is given, it is generated with
	 *   YAHOO.util.Dom.generateId().
	 * - className: The CSS class name to apply to the palette div.  Defaults to "palette".
	 * - moduleClasName: The CSS class name to apply to the modules.  Defaults to "paletteModule".
	 * - searchPanelOptions: Any options to pass into the YAHOO.widget.Panel constructor for the
	 *   search panel.  See setOptions() for the default.
	 * - searchFields: An array of inputEx field configurations to pass to the inputEx.Group
	 *   constructor when creating the search form.  See setOptions() for the default.
	 * - categorizationPanelOptions: Any options to pass into the YAHOO.widget.Panel constructor
	 *   for the categorization panel.  See setOptions() for the default.
	 * - categorizationFields: An array of inputEx field configurations to pass to the inputEx.Group
	 *   constructor when creating the categorization form.  See setOptions() for the default.
	 * - favoriteAccordionParams: Any options to pass into the YAHOO.widget.AccordionView
	 *   constructor for the favorite accordion.  See setOptions() for the default.
	 * - serviceMetaInfoPanelOptions: Any options to pass into the YAHOO.widget.Panel constructor
	 *   for the service meta info panel.  See setOptions() for the default.
	 * - filterAccordionOptions: Any options to pass into the YAHOO.widget.AccordionView
	 *   constructor for the filter accordion.  See setOptions() for the default.
	 * - imageDirectory: The directory to find the palette images.  Default is "../images/icons/".
	 * - searchCategories: An array of categories to include in the search panel.  Default is
	 *   ["Services", "Data", "Workflows", "Utilities", "Thick Clients"].
	 * - removeCategory: The category to remove from modules, or null for none.  Default is
	 *   "NoCategory".
	 * 
	 * @property options
	 * @type {Object}
	 */
	this.options = {};
	
	/**
	 * This property holds the callback functions and scope objects for the various
	 * features in the palette.  It is an object with the following properties:
	 * - makeModuleEl, makeModuleElScope : a function (and scope) to call when the HTML
	 * element is made for each module (service).  This function should take two arguments:
	 * the first is the module object and the second is the HTML element.
	 * - search, searchScope : a function (and scope) to call when the user searches.
	 * The function should take two arguments: the filter (search) key, which is an object
	 * of key value pairs for searching, and the categorization key, which is an array of
	 * categories for categorization.
	 * - categorize, categorizeScope : similar to search and searchScope.
	 * - favorites, favoritesScope : a function (and scope) to call when the user updates
	 * their "My Favorites" list of services.  This function should take one argument: an
	 * array of service URLs.
	 * 
	 * @property callbacks
	 * @type {Object}
	 */
	this.callbacks = callbacks;
	
	this.setOptions(options);
	
	/**
	 * This property holds a reference to the main HTML element that the Palette is
	 * rendered in.
	 * 
	 * @property el
	 * @type {HTMLElement}
	 */
	this.el = null;
	
	/**
	 * This property holds the FilterUtil object that handles the filtering.
	 * 
	 * @property filter
	 * @type {wfeditor.util.FilterUtil}
	 */
	this.filter = null;
	
	/**
	 * This property holds the YUI panel for doing advanced search.
	 * 
	 * @property searchPanel
	 * @type {YAHOO.widget.Panel}
	 */
	this.searchPanel = null;
	
	/**
	 * inputEx form for the advanced search.
     * 
     * @property searchForm
     * @type {inputEx.Group}
     */
	this.searchForm = null;
	
	/**
     * This property holds the default search (empty) for when the user
     * clicks "show all."
     * 
     * @property defaultSearch
     * @type {Object}
     */
    this.defaultSearch = null;
	
	/**
	 * This property is the accordion which allows the user to expand/collapse the
	 * "filter, search, categorize" of the palette.
	 * 
	 * @property filterAccordion
	 * @type {YAHOO.widget.AccordionView}
	 */
	this.filterAccordion = null;
	
	/**
	 * This property holds the YUI panel for doing advanced categorization.
	 * 
	 * @property categorizationPanel
	 * @type {YAHOO.widget.Panel}
	 */
	this.categorizationPanel = null;
	
	/**
	 * inputEx form that holds the categorization.
     * 
     * @property categorizationForm
     * @type {inputEx.Group}
     */
    this.categorizationForm = null;
    
    /**
     * This property is to ignore certain events when the categorization form is changed.
     * More specifically, if we're doing the changing here (rather than the user), we want
     * to ignore it.
     * 
     * @property categorizationFlag
     * @type {Boolean}
     */
    this.categorizationFlag = false;

    // For now, categories are hard-coded in.
    /**
     * This property holds all the categorization select options.  Currently it's hard-coded in.
     * 
     * @property categorizationSelectOptions
     * @type {Array}
     */
    this.categorizationSelectOptions = ["", "Author",    "Function", "Tool"];
    
    /**
     * This property holds all the categorization select values.  Currently it's hard-coded in.
     * 
     * @property categorizationSelectValues
     * @type {Array}
     */
    this.categorizationSelectValues  = ["", "CreatedBy", "Function", "Tool"];

    // For now the very first categorization (default) is hard-coded in
    /**
     * This property holds the default categorization for the palette.
     * Right now it is ["Function"]
     * 
     * @property defaultCategorization
     * @type Array
     */
    this.defaultCategorization = ["Function"];
    var defaultCat = this.buildCategorizationSelects(this.defaultCategorization);
    for(var i in defaultCat) {
        this.options.categorizationFields.push(defaultCat[i]);
    }
    
    /**
     * This property holds a reference to the array of modules.  Each module should
     * have the following properties:
     * - name: the name of the service
     * - description: the description of the service
     * - container: an object with information about the container instantiation on
     *   the WireIt Layer, including:
     *   o icon: the location of the icon for the service
     *   o xtype: the type of the WireIt container to instantiate
     * - category: an array of strings denoting the service's hierarchical categorization
     * - url: the URL of the service
     * - createdBy: the author who created the service
     * 
     * @property modules
     * @type {Array}
     */
    this.modules = null;
    
    /**
     * This property is used to track the set favorites.
     * 
     * @property favorites
     * @type {Array}
     */
    this.favorites = [];

    /**
     * Accordion view for the modules (services).
     * 
     * @property modulesAccordion
     * @type {wfeditor.MultiAccordionView}
     */
	this.modulesAccordion = null;
	
	/**
     * Accordion view for the favorites.
     * 
     * @property favoritesAccordion
     * @type {YAHOO.widget.AccordionView}
     */
    this.favoritesAccordion = null;
    
    /**
     * This is the panel that shows the service meta-information.
     * 
     * @property serviceMetaInfoPnel
     * @type {YAHOO.widget.Panel}
     */
    this.serviceMetaInfoPanel = null;
	
	this.render();
	
	// If modules and favorites are both present, we need a special case here
	if(options.modules && options.favorites) {
		this.favorites = options.favorites;
	}
	
	// Update modules if there
	if(options.modules) {
	   this.updateModules(options.modules);
	}
	
	// Update favorites if there
    if(options.favorites) {
        this.updateFavorites(options.favorites);
    }
	
	// Update tags if there
    if(options.tags) {
        this.updateTags(options.tags);
    }
};

wfeditor.Palette.prototype = {
	
	/** INITIALIZATION METHODS **/
	
	/**
	 * This method sets up any configuration options that are passed in.  It also sets
	 * defaults for options that are not passed in.  See the documentation for the
	 * options property for more information.
	 * 
	 * @method setOptions
	 * @param {Object} options Configuration options.
	 */
	setOptions : function(options) {
		this.options.id = options.id ? options.id : YAHOO.util.Dom.generateId();
		this.options.appendToBody = YAHOO.lang.isUndefined(options.id);
		
		this.options.className = options.className || "palette";
		
		this.options.moduleClassName = options.moduleClassName || "paletteModule";
		
		this.options.searchPanelOptions = options.searchPanelOptions || {
			fixedcenter: true,
            draggable: true,
            visible: false,
            modal: true,
            width: '350px'
		};
		
		// Search form options
		this.options.searchFields = options.searchFields || [
            {type: "string", inputParams: {name: "Name", label: "Name:", typeInvite: "Service name"} },
            {type: "string", inputParams: {name: "CreatedBy", label: "Author:", typeInvite: "Service author"} },
            {type: "string", inputParams: {name: "Description", label: "Description:", typeInvite: "Service description"} }
        ];
        
        // For now, categories are hard-coded in.
        this.options.searchCategories = options.searchCategories || ["Services", "Data", "Workflows", "Utilities", "Thick Clients"];
        for(var i = 0; i < this.options.searchCategories.length; i++) {
            var cat = this.options.searchCategories[i];
            var element = wfeditor.util.makeCheckboxField("Category", cat, i == 0, true);
            this.options.searchFields.push(element);
        }
        this.options.nSearchFields = this.options.searchFields.length;
		
		this.options.categorizationPanelOptions = options.categorizationPanelOptions || {
			fixedcenter: true,
            draggable: true,
            visible: false,
            modal: true,
            width: '300px'
		};
		
		this.options.categorizationFields = options.categorizationFields || [];
		
        this.options.favoriteAccordionParams = options.favoriteAccordionParams || {
            collapsible: true,
            expandable: true, // remove this parameter to open only one panel at a time
            width: 'auto',
            animationSpeed: '0.3', 
            animate: true, 
            effect: YAHOO.util.Easing.easeBothStrong
        };
        
        this.options.serviceMetaInfoPanelOptions = options.serviceMetaInfoPanelOptions || {
            fixedcenter: true,
            draggable: true,
            visible: false,
            modal: true
        };
        
        this.options.filterAccordionOptions = options.filterAccordionOptions || {
            collapsible: true,
            expandable: true, // remove this parameter to open only one panel at a time
            width: 'auto',
            animationSpeed: '0.3', 
            animate: true, 
            effect: YAHOO.util.Easing.easeBothStrong
        };
        
        this.options.imageDirectory = options.imageDirectory || "../images/icons/";
        
        this.options.removeCategory = "NoCategory";
	},
	
	render : function() {
		// Generate and append the element if needed
		if(this.options.appendToBody) {
			document.body.appendChild(wfeditor.util.createEl("div", {id: this.options.id}));
		}
		
		this.el = YAHOO.util.Dom.get(this.options.id);
		YAHOO.util.Dom.addClass(this.el, this.options.className);
		
		// Filter accordion
//		this.filterAccordion = new YAHOO.widget.AccordionView(YAHOO.util.Dom.generateId(),
//            this.options.filterAccordionOptions);
//        this.filterAccordion.appendTo(this.el);
//		
//		// Add panel
//		this.filterAccordion.addPanel({
//			label: "Filter, Search, Categorize",
//			content: "<div id='" + this.options.id + "FilterPanel'></div>"
//		});
		
		// Categorization (filter, search)
		var categorize = YAHOO.util.Dom.get(this.options.id /*+ "FilterPanel"*/);
		YAHOO.util.Dom.setStyle(categorize, "paddingLeft", "5px");
		YAHOO.util.Dom.setStyle(categorize, "paddingTop", "2px");
        //var categorize = wfeditor.util.createEl("div", null, {paddingLeft: "5px", marginTop: "5px"});
        
        // Filter
        categorize.appendChild(wfeditor.util.createEl("span", null, null, "Filter: "));
        var filterSpanEl = wfeditor.util.createEl ("span");
        YAHOO.util.Dom.addClass (filterSpanEl, "deleteicon");
		var filterEl = wfeditor.util.createEl("input",
            {type: "text", name: "filterInput", id: "serviceFilterId"},
            {display: "inline", width: "auto"});
		filterSpanEl.appendChild (filterEl);
		var deleteSpan = wfeditor.util.createEl ("span");
		filterSpanEl.appendChild (deleteSpan);
		deleteSpan.onclick = function (e) {
			var input = this.previousSibling; input.value=''; input.focus ();
			f.inputFilterTimer ();
		};
        categorize.appendChild(filterSpanEl);		
		categorize.appendChild(wfeditor.util.createEl("hr"));
        
        // Attach the filter utility
        this.filter = new wfeditor.util.FilterUtil(filterEl, this.filterServices, this);
        var f = this.filter;
        YAHOO.util.Event.onAvailable("serviceFilterId", function() {
            YAHOO.util.Event.addListener("serviceFilterId", "keyup", this.filter.inputFilterTimer, this.filter, true);
        }, this, true);
        
        // Search
//        categorize.appendChild(wfeditor.util.createEl("span", null, null, "Service Search:"));
        var search = wfeditor.util.createEl("div");
        categorize.appendChild(search);
        
        // Search panel
        this.searchPanel = new YAHOO.widget.Panel(this.options.id + "SearchPanel",
            this.options.searchPanelOptions);

        this.renderSearchPanel();
        
        wfeditor.util.createButton({
            label: "Search",
            clickFn: this.searchPanel.show,
            clickFnScope: this.searchPanel,
            container: search
        });
        
//        wfeditor.util.createButton({
//            label: "Show All",
//            clickFn: this.onShowAllClick,
//            clickFnScope: this,
//            container: search
//        });

//        categorize.appendChild(wfeditor.util.createEl("hr"));
        
        this.renderCategorizePanel();
        
        // Categorization
//        categorize.appendChild(wfeditor.util.createEl("span", null, null, "Service Categorization:"));
//        search = wfeditor.util.createEl("div");
//        categorize.appendChild(search);
        wfeditor.util.createButton({
            label: "Categorize",
            clickFn: this.categorizationPanel.show,
            clickFnScope: this.categorizationPanel,
            container: search
        });
//        wfeditor.util.createButton({
//            label: "Default",
//            clickFn: this.onDefaultClick,
//            clickFnScope: this,
//            container: search
//        });
        
        this.el.appendChild(wfeditor.util.createEl("hr"));
//        this.filterAccordion.openPanel(0);
        
        // My favorites list
        this.el.appendChild(wfeditor.util.createEl("div", {id: this.options.id + "Favorites"}));
        this.favoritesAccordion = new YAHOO.widget.AccordionView(YAHOO.util.Dom.generateId(),
            this.options.favoriteAccordionParams);
        this.favoritesAccordion.appendTo(this.options.id + "Favorites");

        this.favoritesAccordion.addPanel({
            label: "Favorites",
            content: "<div id='" + this.options.id + "FavoritesDiv" + "'></div>"
        });
        
        // Modules list
        this.el.appendChild(wfeditor.util.createEl("div", {id: this.options.id + "Modules"}));
        this.modulesAccordion = new wfeditor.MultiAccordionView({
            parent: this.options.id + "Modules"
        });
        
        this.renderMetaInfoPanel();
	},
	
	/**
	 * This method is a helper method to render the advanced search panel.
	 * 
	 * @method renderSearchPanel
	 */
	renderSearchPanel : function() {
		this.searchPanel.setHeader("Advanced Search");
        this.searchPanel.setBody("<div><div id='" + this.options.id + "SearchForm"
            + "' style='overflow: auto'></div><div id='" + this.options.id + "SearchButtons"
            + "'></div></div>");
        this.searchPanel.render(top.document.body);
        
        // Create search buttons
        wfeditor.util.createButton({
            label: "Go",
            container: this.options.id + "SearchButtons",
            clickFn: this.onSearchGo,
            clickFnScope: this
        });
        
        wfeditor.util.createButton({
            label: "Cancel",
            container: this.options.id + "SearchButtons",
            clickFn: this.searchPanel.hide,
            clickFnScope: this.searchPanel
        });
        
        wfeditor.util.createButton({
        	label: "Show All",
        	container: this.options.id + "SearchButtons",
        	clickFn: this.onShowAllClick,
        	clickFnScope: this
        });
	},
	
	/**
	 * This method is a helper method to render the advanced categorization panel.
	 * 
	 * @method renderCategorizePanel
	 */
	renderCategorizePanel : function() {
		this.categorizationPanel = new YAHOO.widget.Panel(this.options.id + "CategorizationPanel",
            this.options.categorizationPanelOptions);
        
        this.categorizationPanel.setHeader("Advanced Categorization");
        this.categorizationPanel.setBody("<div><div id='" + this.options.id + "CategorizationForm"
            + "'></div><div id='" + this.options.id + "CategorizationButtons"
            + "'></div></div>");
        this.categorizationPanel.render(document.body);
          
        // Instantiate the categorization form.
        this.categorizationForm = new inputEx.Group({
            parentEl: YAHOO.util.Dom.get(this.options.id + "CategorizationForm"),
            fields: this.options.categorizationFields
        });
        
        // Be notified on updates for the dynamic nature of the
        // categorization.
        this.categorizationForm.updatedEvt.subscribe(this.categorizationChanged, this, true);
   
        // Create search buttons
        wfeditor.util.createButton({
            label: "Go",
            container: this.options.id + "CategorizationButtons",
            clickFn: this.onCategorizationGo,
            clickFnScope: this
        });
        
        wfeditor.util.createButton({
            label: "Cancel",
            container: this.options.id + "CategorizationButtons",
            clickFn: this.categorizationPanel.hide,
            clickFnScope: this.categorizationPanel
        });
        
        wfeditor.util.createButton({
        	label: "Default",
        	container: this.options.id + "CategorizationButtons",
        	clickFn: this.onDefaultClick,
        	clickFnScope: this
        });
	},
	
	/**
	 * This method creates and renders the service meta information panel.
	 * 
	 * @method renderMetaInfoPanel
	 */
	renderMetaInfoPanel : function() {
		var id = this.options.id + "ServiceMetaInfoPanel";
        this.serviceMetaInfoPanel = new YAHOO.widget.Panel(id,
            this.options.serviceMetaInfoPanelOptions);
        
        // Set the header and body
        this.serviceMetaInfoPanel.setHeader("Service Meta-Information");
        this.serviceMetaInfoPanel.setBody("");
        this.serviceMetaInfoPanel.body.style.border = "1px solid red";
        this.serviceMetaInfoPanel.body.style.textAlign = "left";

        var table = wfeditor.util.createEl("table");
        this.serviceMetaInfoPanel.body.appendChild(table);
              
        var tr = wfeditor.util.createEl("tr");
        table.appendChild(tr);
        tr.appendChild(wfeditor.util.createEl("td", null, null, "<b>Service Name</b>:&nbsp;"));
        
        var name = wfeditor.util.createEl("td");
        tr.appendChild(name);
        
        tr = wfeditor.util.createEl("tr");
        table.appendChild(tr);
        tr.appendChild(wfeditor.util.createEl("td", null, null, "<b>Description</b>:&nbsp;"));
        
        var desc = wfeditor.util.createEl("td");
        tr.appendChild(desc);
        
        tr = wfeditor.util.createEl("tr");
        table.appendChild(tr);
        tr.appendChild(wfeditor.util.createEl("td", null, null, "<b>Location</b>:&nbsp;"));
        
        var loc = wfeditor.util.createEl("td");
        tr.appendChild(loc);
        
        tr = wfeditor.util.createEl("tr");
        table.appendChild(tr);
        tr.appendChild(wfeditor.util.createEl("td", null, null, "<b>Author</b>:&nbsp;"));
        
        var author = wfeditor.util.createEl("td");
        tr.appendChild(author);
        
        // Keep track of the relevant HTML elements to update.
        this.serviceMetaInfoPanel.metaInfo = {
        	name: name,
        	description: desc,
        	location: loc,
        	author: author
        };
        
        this.serviceMetaInfoPanel.render(document.body);
	},
	
	
    /** MODULE METHODS **/
	
	/**
     * This method should be called when there is updated tag information.  It updates
     * the search form appropriately.
     * 
     * @method updateTags
     * @param {Array} tags The list of tags.
     */
    updateTags : function(tags) {
	 	// Clear out old search fields
        this.options.searchFields = this.options.searchFields.slice(0, this.options.nSearchFields);
        YAHOO.util.Dom.get(this.options.id + "SearchForm").innerHTML = "";
        
        for(var i in tags){
            var jsonTag = tags[i];
            var category = jsonTag.semanticTypeCategory;
            for(var j in jsonTag.semanticTypes) {
                var sT = jsonTag.semanticTypes[j];
                //var element = wfeditor.util.makeCheckboxField("Tag: " + category, sT, j == 0, true);
                var element = wfeditor.util.makeCheckboxField(category, sT, j == 0, true);
                this.options.searchFields.push(element);
            }
        }
        
        // Instantiate the advanced search properties form.
        this.searchForm = new inputEx.Group({
            parentEl: YAHOO.util.Dom.get(this.options.id + "SearchForm"),
            fields: this.options.searchFields
        });
        this.defaultSearch = this.searchForm.getValue();
	},
	
	/**
     * This method should be called when the modules list has changed.  The
     * palette then updates its services list to match the given modules.
     * 
     * @method updateModules
     * @param {Array} modules The new modules.
     */
	updateModules : function(modules) {
		// Clear the accordion
        this.modulesAccordion.clearItems();
        
        this.modules = modules;
        
        // Add the modules to the tree
        for(var i = 0; i < modules.length; i++) {
            this.addModuleToList(modules[i]);
        }
	},
	
	/**
     * This method adds the given module to the services list.
     * 
     * @method addModuleToList
     * @param {Object} module The module to add to the list.
     */
	addModuleToList : function(module) {
		// If there's a removeCategory, remove it from the categories list
		var cat = module.category;
		if(this.options.removeCategory) {
		    for(var i = 0; i < cat.length; i++) {
			    if(cat[i].labelText == this.options.removeCategory) {
			    	cat.splice(i, 1);
			    	i--;
			    }
		    }
		}
		
        var div = this._makeModuleEl(module, true);

        // Add to the accordion
        this.modulesAccordion.addItem({
            el: div,
            categories: cat
        });
        
        // Update the module object
        module.elId = div.id;
	},
	
	/**
	 * This method removes a module element *that has already rendered* (in other words,
	 * it already exists in the palette).  It does this by simply removing the given
	 * element ID from the HTML DOM structure.
	 * 
	 * @method removeModuleElement
	 * @param elId {String} The ID of the HTML element to remove.
	 */
	removeModuleElement : function(elId) {
		var el = YAHOO.util.Dom.get(elId);
		el.parentNode.removeChild(el);
	},
	
    /**
     * This method is a helper that creates a module HTML element for the given module object.
     * 
     * @method _makeModuleEl
     * @param {Object} module Module object.
     * @param {boolean || null} saveFavoriteIcon If true, the module's favIcon property will be
     * set to the HTML image that is created here.
     * @return The HTML element for the given module.
     */
    _makeModuleEl : function(module, saveFavoriteIcon) {
        // Create the module <div>
        var div = wfeditor.util.createEl('div',
            {id: YAHOO.util.Dom.generateId(), className: this.options.moduleClassName});
        
        // Module description in a tooltip
        if(module.description) {
            div.title = module.description;
        }
       
        // Module icon
        var temp = wfeditor.util.createEl("div");
        if(module.container.icon) {
            var img = new Image(16,16);

            //set image width to 0 if image doesn't exist
            img.onerror = "this.width='0px'";
            
            img.src = module.container.icon;
            img.className = 'serviceIcon';

            temp.appendChild(img);
            
        }
        
      	var width = 132;
      	if (module.container.icon)
      		width = width - img.width;
      	var name = wfeditor.util.fitStringToWidth (module.name, width, this.options.moduleClassName);
      	
        // Module name
        div.appendChild(wfeditor.util.createEl('span', null, null, temp.innerHTML + name));
        
        var temp = wfeditor.util.createEl("div", {className: 'serviceButtons'});
        div.appendChild(temp);
        
        // Meta info image linked to the parent editor's "serviceInfo" function
        var info = wfeditor.util.createEl('img', {src: this.options.imageDirectory + 'help.png',
            className: 'serviceMetaInfo',
            title: 'Information for service ' + module.name});
        YAHOO.util.Event.addListener(info, "click", function(e) {
        	that.serviceInfo(module.name, module.description, module.url, module.createdBy);
        });
        temp.appendChild(info);

        // Add the favorite icon
        var favorite = wfeditor.util.createEl('img', {
            className: 'serviceFavorite',
            title: 'Click to make service a favorite'
        });
        
        var isFavorite = false;
        for(var i = 0; !isFavorite && i < this.favorites.length; i++) {
            if(this.favorites[i] == module.url) {
                isFavorite = true;
            }
        }
        
        if(isFavorite) {
            favorite.src = this.options.imageDirectory + 'favorite-filled.png';
        } else {
            favorite.src = this.options.imageDirectory + 'favorite-unfilled.png';
        }
        
        // Remember this icon if the flag is set.  This way we can update the module's
        // favorite icon even if the user clicks it in the "my favorites" list.
        if(saveFavoriteIcon) {
            module.favIcon = favorite;
        }
        
        var that = this;
        YAHOO.util.Event.addListener(favorite, "click", function(e) {
            that._markFavorite(favorite, module.url);
        });
        temp.appendChild(favorite);
        
        // If there's a callback for making the module element, call it
        if(this.callbacks.makeModuleEl) {
            this.callbacks.makeModuleEl.call(this.callbacks.makeModuleElScope, module, div);
        }
 
        return div;
    },
	
	
	/** FILTER METHODS **/
	
	/**
     * This method applies the given filter to the list of services (modules).
     * 
     * @method filterServices
     * @param {String} serviceName The name filter to apply.
     */
	filterServices : function(serviceName) {
		// clear accordion
        this.modulesAccordion.clearItems();
        
        var matchingModules = [];
        if(YAHOO.lang.isNull(serviceName) || serviceName == "") {
            matchingModules = this.modules;
        } else {
            for(var i = 0; i < this.modules.length; i++) {
                var m = this.modules[i];
                if(m.name.match(new RegExp(serviceName, "i"))) {
                    matchingModules.push(m);
                 }
            }
        }
        
        // Add the modules to the tree
        for(var i = 0; i < matchingModules.length; i++) {
            this.addModuleToList(matchingModules[i]);
        }
        
        // Expand panels
        if(matchingModules.length != this.modules.length){
            this.modulesAccordion.expandAll();
        }
	},
	
	
	/** SEARCH AND CATEGORIZATION METHODS **/
	
    /**
     * This is a helper method that converts between the inputEx format of the
     * search form and whatever format the backend is expecting.  Right now it
     * does nothing because the backend is expecting the same format as inputEx
     * gives.
     * 
     * @method _getSearchValue
     * @return {Object} The value of the search form.
     */
    _getSearchValue : function() {
        var value = this.searchForm.getValue();
        return value;
    },
    
    /**
     * This is a helper method that converts between the inputEx format of the
     * categorization form and whatever format the backend is expecting.  Right now
     * it converts the choosers into an array of strings.
     * 
     * @method _getCategorizationValue
     * @return {Object} The value of the categorization form.
     */
    _getCategorizationValue : function() {
        // Get the categorization as an array of the values
        var value = this.categorizationForm.getValue();
        var setValue = [];
        for(var prop in value) {
            var i = prop[prop.length - 1];
            setValue[i] = value[prop];
        }
        
        // Truncate last "" element
        if(setValue[setValue.length - 1] == "") {
            setValue.splice(setValue.length - 1, 1);
        }
        
        return setValue;
    },
	
	
	/** SEARCH METHODS **/
	
	/**
     * This method is called when the user has entered their search criteria and
     * then clicked "go" in the "Advanced Search" dialog.  It makes the relevant
     * calls to the callbacks.
     * 
     * @method onSearchGo
     */
	onSearchGo : function() {
        var filterKey = this._getSearchValue();
        var categorizeKey = this._getCategorizationValue();
        
        // Hide the search panel
        this.searchPanel.hide();

        // If there's a callback for the search, call it
        if(this.callbacks.search) {
            this.callbacks.search.call(this.callbacks.searchScope, filterKey, categorizeKey);
        }
	},
	
	/**
     * This method is called when the user clicks the "Show All" button -- in other
     * words, it clears the "search filter" that is currently set on the palette.
     * 
     * @method onShowAllClick
     */
	onShowAllClick : function() {
        // Set the search form to the default.
        this.searchForm.setValue(this.defaultSearch);
        
        this.onSearchGo();
	},
	
	
	/** CATEGORIZATION METHODS **/
	
	/**
     * This method is called when the user has entered their categorization
     * criteria and the clicked "go" in the "Advanced Categorization" dialog.
     * It makes the relevant calls to the callbacks.
     * 
     * @method onCategorizationGo
     */
	onCategorizationGo : function() {
		var filterKey = this._getSearchValue();
        var categorizeKey = this._getCategorizationValue();
        
        this.categorizationPanel.hide();
        
        // If there's a callback for the categorization, call it
        if(this.callbacks.categorize) {
            this.callbacks.categorize.call(this.callbacks.categorizeScope, filterKey, categorizeKey);
        }
	},
	
	/**
     * This method is called when the user clicks the "Default Categorization"
     * button.  It re-applies the first (default) categorization to the palette.
     * 
     * @method onDefaultClick
     */
	onDefaultClick : function() {
		this.categorizationFlag = true;
        this.setupCategorizationFields(this.defaultCategorization);
        this.onCategorizationGo();
        this.categorizationFlag = false;
	},
	
	/**
     * This method is called when the user changes the categorization fields in
     * the form on the "Advanced" re-organization dialog.  It dynamically updates
     * the fields in the form based on what the user enters.
     * 
     * @method categorizationChanged
     */
	categorizationChanged : function() {
		if(this.categorizationFlag) return;
        
        this.categorizationFlag = true;
        
        // Get the value as an array of the select values
        var value = this.categorizationForm.getValue();
        var setValue = [];
        for(var prop in value) {
            var i = prop[prop.length - 1];
            setValue[i] = value[prop];
        }
        
        // Truncate after any empty values
        for(var i = 0; i < setValue.length - 1; i++) {
            if(setValue[i] == "") {
                setValue.splice(i + 1, (setValue.length - i - 1));
                break;
            }
        }
        
        // Truncate after any repeats
        for(var i = 0; i < setValue.length - 1; i++) {
            for(var j = i + 1; j < setValue.length; j++) {
                if(setValue[i] == setValue[j]) {
                    setValue.splice(i + 1, (setValue.length - i - 1));
                    break;
                }
            }
        }
        
        // Finally truncate the last "" value and set up the form fields
        if(setValue[setValue.length - 1] == "") {
            setValue.splice(setValue.length - 1, 1);
        }
        this.setupCategorizationFields(setValue);
        
        this.categorizationFlag = false;
	},
	
	/**
     * This method builds the inputEx fields based on the given categorization.
     * The categorization should be given in array form.  The method returns the
     * inputEx fields that should be used.
     * 
     * @method buildCategorizationSelects
     * @param {Array} cat The categorization to build the select fields for.
     * @return The inputEx field options for the given categorization.
     */
    buildCategorizationSelects : function(catOrig) {
        var fields = [];        
        var seenOptions = [], seenValues = [];
        
        // So we know when to stop.
        cat = catOrig.slice(0);
        cat.push("");
        
        for(var i in cat) {
            var c = cat[i];
            
            // Find the select option that matches the select value
            var opt;
            for(var j in this.categorizationSelectValues) {
                if(this.categorizationSelectValues[j] == c) {
                    opt = this.categorizationSelectOptions[j];
                    break;
                }
            }
            
            // Only add those options/values that haven't already been seen
            fields.push({key: "categorization" + i, type: "select",
               inputParams: {name: "categorization" + i, label: "Level " + i,
               selectOptions: wfeditor.util.removeItems(this.categorizationSelectOptions, seenOptions),
               selectValues: wfeditor.util.removeItems(this.categorizationSelectValues, seenValues),
               value: c} });
               
           // Update our seen lists
           seenOptions.push(opt);
           seenValues.push(c);
        }
        
        return fields;
    },
    
    /**
     * This method re-builds the categorization form in the HTML based on the
     * fields defined in this.options.categorizationFields.
     * 
     * @method setupCategorizationFields
     */
    setupCategorizationFields : function(cat) {
        // Build fields
        var newFields = this.buildCategorizationSelects(cat);
        this.options.categorizationFields = newFields;
        
        // Clear out old form
        var parentEl = YAHOO.util.Dom.get(this.options.id + "CategorizationForm");
        parentEl.innerHTML = "";
        
        // Build form and watch for changes
        this.categorizationForm = new inputEx.Group({
            parentEl: parentEl,
            fields: this.options.categorizationFields
        });
        this.categorizationForm.updatedEvt.subscribe(this.categorizationChanged, this, true);
    },
    
    
    /** META-INFORMATION METHODS **/
    
    /**
     * This method shows the service meta-information as given.
     * 
     * @method serviceInfo
     * @param {String} name The name of the service.
     * @param {String} description The description of the service.
     * @param {String} url The location (URL) of the service.
     * @param {String} createdBy Who created the service.
     */
    serviceInfo: function(name, description, url, createdBy) {     
        this.serviceMetaInfoPanel.metaInfo.name.innerHTML = name;
        this.serviceMetaInfoPanel.metaInfo.description.innerHTML = description;
        this.serviceMetaInfoPanel.metaInfo.location.innerHTML = url;
        this.serviceMetaInfoPanel.metaInfo.author.innerHTML = createdBy;
         
        this.serviceMetaInfoPanel.show();
    },
    
    
    /** FAVORITES METHODS **/
    
    /**
     * This method is called whenever the user clicks the "favorite" icon for a module.  It
     * toggles whether the given service is a favorite or not and updates the list.
     * 
     * @method _markFavorite
     * @param {HTMLElement} img The image element that was clicked.
     * @param {String} url The URL of the module that was clicked.
     */
    _markFavorite : function(img, url) {
        var isFavorite = false;
        for(var i = 0; !isFavorite && i < this.favorites.length; i++) {
            if(this.favorites[i] == url) {
                isFavorite = true;
            }
        }
        
        if(!isFavorite) {
            this.favorites.push(url);
            img.src = this.options.imageDirectory + "favorite-filled.png";
        } else {
            for(var i = 0; i < this.favorites.length; i++) {
                if(this.favorites[i] == url) {
                    this.favorites.splice(i, 1);
                    break;
                }
            }
            img.src = this.options.imageDirectory + "favorite-unfilled.png";
        }
        
        // Find the module and make sure that it's favicon is also updated
        var module;
        for(var i = 0; i < this.modules.length; i++) {
            module = this.modules[i];
            if(module.url == url) {
                if(module.favIcon != img) {
                    module.favIcon.src = img.src;
                }
                break;
            }
        }
        
        this.updateFavorites();
    },
    
    /**
     * This method is called either by the user adding/removing a favorite, or by the backend to
     * update the favorites for the logged in user.  It replaces those services in the favorites
     * accordion.
     * 
     * @method updateFavorites
     * @param {Array || null} favorites If an array is given, it replaces the current favorites.
     * Otherwise it notifies the backend.
     */
    updateFavorites : function(favorites) {
    	if(favorites) {
            // sent in from back-end
            this.favorites = favorites;
        } else {
            if(this.callbacks.favorites) {
            	this.callbacks.favorites.call(this.callbacks.favoritesScope, this.favorites);
            }
        }
        
        var el = YAHOO.util.Dom.get(this.options.id + "FavoritesDiv");
        el.innerHTML = "";
        
        var url;
        var module;
        for(var i = 0; i < this.favorites.length; i++) {
            url = this.favorites[i];
            for(var j = 0; j < this.modules.length; j++) {
                module = this.modules[j];
                if(module.url == url) {
                    el.appendChild(this._makeModuleEl(module));
                }
            }
        }
    }
};