/**
 * A DataCreator is the GUI widget for creating a new data service on SORASCS.
 * 
 * @class DataCreator
 * @namespace wfeditor
 * 
 * @author Laura
 * 
 */

/**
 * Constructor which builds the object.  It takes the parent element and any
 * configuration options.  See the options property for more information.
 * 
 * @constructor
 * @param {HTMLElement || String} parent The parent to host the data creator.
 * @param {Object} options Configuration options.
 */
wfeditor.DataCreator = function(parent, options) {
	/**
	 * This property holds a reference to the parent element.
	 * 
	 * @property parentEl
	 * @type {HTMLElement}
	 */
	this.parentEl = YAHOO.util.Dom.get(parent);
	
	/**
	 * This property holds the configuration options for this widget.  It includes:
	 * - topFormOptions inputEx form options for the top form
	 * - typeFieldOptions inputEx field options for the type field
	 * - fileFormOptions inputEx form options for the file form
	 * - projCatFormOptions inputEx form options for the project/category form
	 * 
	 * @property options
	 * @type {Object}
	 */
	this.options = {};
	
	/**
	 * This property holds the main element for the widget.
	 * 
	 * @property el
	 * @type {HTMLElement}
	 */
	this.el = null;
	
	/**
	 * This property holds the "top" form which has the kind and the name.
	 * 
	 * @property topForm
	 * @type {inputEx.Group}
	 */
	this.topForm = null;
	
	/**
	 * This property holds the "type" field.
	 * 
	 * @property typeField
	 * @type {inputEx.SelectField}
	 */
	this.typeForm = null;
	
	/**
	 * This property holds the file form.
	 * 
	 * @property fileForm
	 * @type {inputEx.Group}
	 */
	this.fileForm = null;
	
	/**
	 * This property holds the form for the project/category pairs.
	 * 
	 * @property projCatForm
	 * @type {inputEx.Group}
	 */
	this.projCatForm = null;
	
	/**
	 * List of all projects by name.
	 * 
	 * @property projects
	 * @type {Array}
	 */
	this.projects = [];
	
	/**
	 * List of all categories by name.
	 * 
	 * @property categories
	 * @type {Array}
	 */
	this.categories = [];
	
	/**
	 * This property holds the current number of project/category pairs that the
	 * user has selected.
	 * 
	 * @property numProjCatPairs
	 * @type {Number}
	 */
	this.numProjCatPairs = 1;
	
	/**
	 * This property holds the current number of files that the user has selected.
	 * 
	 * @property numFiles
	 * @type {Number}
	 */
	this.numFiles = 1;
	
	this.setOptions(options);
	
	this.render();
};

wfeditor.DataCreator.prototype = {
	
	/**
	 * This method is used to set the configuration options.  See the documentation
	 * for that property.
	 * 
	 * @method setOptions
	 * @param {Object} options Configuration options.
	 */
	setOptions : function(options) {		
		this.options.topFormOptions = options.topFormOptions || {
			name: "topForm",
			legend: "",
			collapsible: false,
			collapsed: false,
			fields: [
            {
                "type" : "radio",
                inputParams: {
                    "label" : "Kind:",
                    "name" : "kind",
                    "required" : true,
                    "choices" : [ "input", "output" ],
                    "value" : "input"
                }
            }, {
                "type" : "string",
                inputParams : {
                    "label" : "Name:",
                    "name" : "name",
                    "required" : true,
                    "typeInvite" : "Name of the data service"
                }
            }
            ]
		};
		
		this.options.typeFieldOptions = {
            "label" : "Type:",
            "name" : "type",
            "required" : true,
            "multiple" : true,
            "selectOptions" : [""],
            "selectValues" : [""]
        };
		
		this.options.fileFormOptions = options.fileFormOptions || {
			name: "fileForm",
            legend: "",
            collapsible: false,
            collapsed: false,
            enctype: 'multipart/form-data'
		};
		
		this.options.projCatFormOptions = options.projCatFormOptions || {
            name: "projCatForm",
            legend: "",
            collapsible: false,
            collapsed: false
        };
	},
	
	/**
	 * This method is used to add project/category pair fields to the given fields
	 * array.
	 * 
	 * @method _addProjCatFields
	 * @param {Array} Array of inputEx fields.
	 * @param {Number} ind The index to append to the field.
	 */
	_addProjCatFields : function(fields, ind) {
		var field = {
			"type" : "select",
            inputParams: {
                "label" : "Project:",
                "name" : "project" + ind,
                "required" : true,
                "selectValues" : this.projects.slice(0),
                "selectOptions" : this.projects.slice(0)
            }
        };      
        fields.push(field);
        
        var field = {
        	"type" : "combine",
            inputParams: {
                "label" : "Category: ",
                "name" : "category" + ind,
                "legend" : "",
                "fields" : [
                    {
                        "type" : "select",
                        inputParams: {
                            "name" : "category_select" + ind,
                            "selectValues" : this.categories.slice(0),
                            "selectOptions" : this.categories.slice(0)
                        }
                    }, {
                       "type" : "string",
                        inputParams: {
                            "name" : "category_custom" + ind,
                            "typeInvite" : "Or create your own",
                            "value" : ""
                        }
                    }
                ]
            }
        };
        fields.push(field);
	},
	
	/**
     * This method is used to add file fields to the given fields array.
     * 
     * @method _addFileFields
     * @param {Array} Array of inputEx fields.
     * @param {Number} ind The index to append to the field.
     */
	_addFileFields : function(fields, ind) {
		var field = {
			"type": "file",
            inputParams: {
                "label" : ind == 0 ? "File(s):" : "",
                "name": "file" + ind
            }
	    };
	    fields.push(field);
	},
	
	/**
	 * The method renders the HTML content of the widget.
	 * 
	 * @property render
	 */
	render : function() {
		this.el = WireIt.cn("div");
		this.parentEl.appendChild(this.el);
		
		// Render the header
		this.el.appendChild(WireIt.cn("div", null, null, "Create new data:"));
		
		// Render the top form
		var topFormDiv = WireIt.cn("div");
		this.options.topFormOptions.parentEl = topFormDiv;
	    this.el.appendChild(topFormDiv);
	    this.topForm = new inputEx.Group(this.options.topFormOptions);
	    
	    // Render the type field
	    var typeFieldDiv = WireIt.cn("div");
	    this.options.typeFieldOptions.parentEl = typeFieldDiv;
	    this.el.appendChild(typeFieldDiv);
	    this.typeField = new inputEx.SelectField(this.options.typeFieldOptions);
	    
	    // Set up the handler to hide the file form when it's output
	    var kindField = this.topForm.getFieldByName("kind");
	    kindField.updatedEvt.subscribe(this.onKindSwitch, this, true);
        
        // Render the files form
		var fileFormDiv = WireIt.cn("div");
		this.options.fileFormOptions.parentEl = fileFormDiv;
		this.el.appendChild(fileFormDiv);
		this._createFileForm();
		
        // Render the add/remove files buttons
        var div = WireIt.cn("div", null, {textAlign: "right"});
        this.options.fileFormButtonsDiv = div;
        var temp = WireIt.cn("img", {src: "../images/remove_port.png"}, {cursor: "pointer"});
        YAHOO.util.Event.addListener(temp, "click", this.onRemoveFile, this, true);
        div.appendChild(temp);
        temp = WireIt.cn("img", {src: "../images/add_port.png"}, {cursor: "pointer"});
        YAHOO.util.Event.addListener(temp, "click", this.onAddFile, this, true);
        div.appendChild(temp);
        this.el.appendChild(div);
        
        // Render the projects/categories form
        var projCatFormDiv = WireIt.cn("div");
        this.options.projCatFormOptions.parentEl = projCatFormDiv;
        this.el.appendChild(projCatFormDiv);
        this._createProjCatForm();
        
        // Render the add/remove projects/categories buttons
		div = WireIt.cn("div", null, {textAlign: "right"});
        var temp = WireIt.cn("img", {src: "../images/remove_port.png"}, {cursor: "pointer"});
        YAHOO.util.Event.addListener(temp, "click", this.onRemoveProjCat, this, true);
        div.appendChild(temp);
        temp = WireIt.cn("img", {src: "../images/add_port.png"}, {cursor: "pointer"});
        YAHOO.util.Event.addListener(temp, "click", this.onAddProjCat, this, true);
        div.appendChild(temp);
        this.el.appendChild(div);
		
		// Render the "create" button
		var buttonDiv = WireIt.cn("div", null, {textAlign: "center"});
		wfeditor.util.createButton({
			label: "Create",
			container: buttonDiv,
			clickFn: this.onCreate,
			clickFnScope: this
		});
		this.el.appendChild(buttonDiv);
		
		// Update shown/hidden widgets.
		this.onKindSwitch();
	},
	
	/**
	 * This method should be called by the outside code when the list of
	 * projects and categories have been updated.
	 * 
	 * @method updateProjects
	 * @param {Array} projects An array of objects which contains the project name
	 * and an array of the category names.
	 */
	updateProjects : function(projects) {
        this.projects = [];
        this.categories = [];
        
        var cat;
        var found;
        for(var i = 0; i < projects.length; i++) {       	
        	// Add the project
        	this.projects.push(projects[i].name);
        	
        	// Add the category
        	for(var j = 0; j < projects[i].categories.length; j++) {
        		cat = projects[i].categories[j];
        		
        		// ...if it's unique
        		found = false;
        		for(var k = 0; !found && k < this.categories.length; k++) {
        			if(this.categories[k] == cat) {
        				found = true;
        			}
        		}
        		
        		if(!found) {
        			this.categories.push(cat);
        		}
        	}
        }
        
        // Recreate the projects/categories form
        this._createProjCatForm();
	},
	
	/**
	 * This method should be called by the outside code when the list of data has been updated.
	 * 
	 * @method updateTypes
	 * @param {Array} types An array of the types.
	 */
	 updateTypes : function(types) {
	     var div = this.options.typeFieldOptions.parentEl;
	     div.innerHTML = "";
	     
	     this.options.typeFieldOptions.selectOptions = types.slice(0);
	     this.options.typeFieldOptions.selectValues = types.slice(0);
	     
	     this.typeField = new inputEx.SelectField(this.options.typeFieldOptions);
	 },
	
	/**
	 * This method is used to (re-)create the file form.
	 * 
	 * @method _createFileForm
	 */
	_createFileForm : function() {
		var div = this.options.fileFormOptions.parentEl;
        div.innerHTML = "";
        
        var fields = [];
        for(var i = 0; i < this.numFiles; i++) {
        	this._addFileFields(fields, i);
        }
        
        this.options.fileFormOptions.fields = fields;
        this.fileForm = new inputEx.Group(this.options.fileFormOptions);
	},
	
	/**
     * This method is used to (re-)create the project/category pairs form.
     * 
     * @method _createProjCatForm
     */
	_createProjCatForm : function() {
		var div = this.options.projCatFormOptions.parentEl;
		div.innerHTML = "";
		
		var fields = [];
		for(var i = 0; i < this.numProjCatPairs; i++) {
			this._addProjCatFields(fields, i);
		}
		
		this.options.projCatFormOptions.fields = fields;
		this.projCatForm = new inputEx.Group(this.options.projCatFormOptions);
	},
	
	/**
	 * This method is called when the user switched between "input" and "output"
	 * for the kind.
	 * 
	 * @method onKindSwitch
	 */
    onKindSwitch : function() {
    	var input = this.topForm.getFieldByName("kind").getValue() == "input";
    	this.options.fileFormOptions.parentEl.style.display = input ? "" : "none";
    	this.options.fileFormButtonsDiv.style.display = input ? "" : "none";
    	this.options.typeFieldOptions.parentEl.style.display = input ? "none" : "";
    },
	
	/**
	 * This method is called when the user clicks the "create" button.  It gathers
	 * the information and communicates with the backend.
	 * 
	 * @method onCreate
	 */
	onCreate : function() {
		if(!this.topForm.validate()) {
			return;
		}
		
        var value = {};
        
        // Kind, name
        value.kind = this.topForm.getFieldByName("kind").getValue();
        value.name = this.topForm.getFieldByName("name").getValue();
        
        // Type
        if(value.kind != "input") {
        	var el = this.typeField.el;
        	var types = [];
        	for(var i = 0; i < el.options.length; i++) {
        		if(el.options[i].selected) {
        			types.push(el.options[i].value);
        		}
        	}
        	value.types = types;
        }
        
        // Projects
        
        var projects = [];
        var projectsMap = {};
        var cat;
        for(var i = 0; i < this.numProjCatPairs; i++) {
        	cat = this.projCatForm.getFieldByName("category" + i).getValue();
        	if(cat[1] == "") {
        		cat = cat[0];
        	} else {
        		cat = cat[1];
        	}
        	projects.push({
        		project: this.projCatForm.getFieldByName("project" + i).getValue(),
        		category: cat
        	});
        	projectsMap[this.projCatForm.getFieldByName("project" + i).getValue()] = cat;
        }
        value.projects = projects;
        
        // Files
        var dataUploaderArray = [];
        if(value.kind == "input") {
            var files = [];
            var val;
            for(var i = 0; i < this.numFiles; i++) {
            	//val = this.fileForm.getFieldByName("file" + i).el;
            	val = dwr.util.getValue("file" + i);
            	var dataUploaderBean = new DataUploaderBean();
            	dataUploaderBean.inputStream = val;
            	dataUploaderBean.fileTransfer = val;
            	dataUploaderBean.projectCategoryMap = projectsMap;
            	dataUploaderBean.kind = value.kind;
            	dataUploaderBean.name = value.name;
            	dataUploaderArray.push(dataUploaderBean);
            	files.push(val);
            }
            
            // They have to enter at least one file.
            if(files.length == 0) {
            	return;
            }
            
            value.files = files;
        }
        
        editor.adapter.createNewData(dataUploaderArray, {
        	success: this.onServiceCreated,
        	scope: this
        });
	},
	
	/**
	 * This method is called when the user adds a new project/category pair.
	 * 
	 * @method onAddProjCat
	 */
	onAddProjCat : function() {
		this._addProjCatFields(this.options.projCatFormOptions.fields, this.numProjCatPairs);
		this.numProjCatPairs++;
		var val = this.projCatForm.getValue();
		this._createProjCatForm();
		this.projCatForm.setValue(val);
	},
	
	/**
	 * This method is called when the user removes the last added project/category pait.
	 * 
	 * @onRemoveProjCat
	 */
	onRemoveProjCat : function() {
		if(this.numProjCatPairs == 1) {
			return;
		}
		
		this.options.projCatFormOptions.fields = this.options.projCatFormOptions.fields.splice(
		    this.options.projCatFormOptions.length - 1, 1);
		this.numProjCatPairs--;
		var val = this.projCatForm.getValue();
		this._createProjCatForm();
		this.projCatForm.setValue(val);
	},
	
	/**
	 * This method is called when the user adds a new file field.
	 * 
	 * @method onAddFile
	 */
	onAddFile : function() {
		this._addFileFields(this.options.fileFormOptions.fields, this.numFiles);
        this.numFiles++;
        var val = this.fileForm.getValue();
        this._createFileForm();
        this.fileForm.setValue(val);
	},
	
	/**
	 * This method is called when the user removes the last added file field.
	 * 
	 * @method onRemoveFile
	 */
	onRemoveFile : function() {
		if(this.numFiles == 1) {
            return;
        }
        
        this.options.fileFormOptions.fields = this.options.fileFormOptions.fields.splice(
            this.options.fileFormOptions.length - 1, 1);
        this.numFiles--;
        var val = this.fileForm.getValue();
        this._createFileForm();
        this.fileForm.setValue(val);
	},
	
	/**
	 * This method is the callback from the backend after the service has been created (or an
	 * error has been given).  If a new module is given, it is added to the list.  If a message
	 * is given, it is displayed.
	 * 
	 * @method onServiceCreated
	 * @param {String} str The string representation for the return value of the backend, as
	 * defined in the UI specification.
	 */
	onServiceCreated : function(str) {
		var val = YAHOO.lang.JSON.parse(str);
		
		// Add the new module to the list
		// TODO should do this doing callbacks, but for now...
		if(val.module && !YAHOO.lang.isUndefined(editor)) {
			editor.modules.push(val.module);
			editor.updateModules();
		}
		
		// Show a message, if given
		if(!YAHOO.lang.isUndefined(val.success)) {
			if(YAHOO.lang.isUndefined(val.msg)) {
				val.msg = val.success ? "The data service was successfully created!" :
				    "There was a problem when creating the data service!";
			}
			
			if(!YAHOO.lang.isUndefined(editor)) {
				if(val.success) {
					editor.okay(val.msg, "Create Data Service");
				} else {
					editor.error(val.msg, "Create Data Service");
				}
			}
		}
	}
};
