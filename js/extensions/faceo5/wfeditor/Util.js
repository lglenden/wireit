/**
 * This file is meant for small, utility classes.
 */

/**
 * The list utility is a wrapper around an ordered list that sends an event when
 * the user selects an item in the list.
 * 
 * @class ListUtil
 * @namespace wfeditor.util
 * 
 * @author Laura
 *
 */
 
/**
 * Constructor.  Sets up options based on parameters that are passed in.
 * 
 * @constructor
 * @param {Object} options See this.options property.
 */
wfeditor.util.ListUtil = function(options) {
	this.setOptions(options);
	
	/**
	 * This property is the list of items.
	 * 
	 * @property items
	 * @type {Array}
	 */
	this.items = [];
	
	/**
	 * This property is the currently selected index, or -1 for none.
	 * 
	 * @property index
	 * @type {Number}
	 */
	this.index = -1;
	
	this.render();
	
	/**
	 * This property is an event that is fired when the item selection in
	 * the list changes.  The event has the oldIndex (if applicable), and the
	 * new index.
	 * 
	 * @property onItemChanged
	 * @type {YAHOO.util.CustomEvent}
	 */
	this.onItemChanged = new YAHOO.util.CustomEvent("onItemChanged");
	
	/**
	 * This property holds an array of colors that we cycle through on indented
	 * levels of the list.
	 * 
	 * @property indentColors
	 * @type {Array}
	 */
	this.indentColors = ["#B3D4FF", "#00CC33", "#FFCC00"];
};

wfeditor.util.ListUtil.prototype = {
	
	/**
	 * The method sets the configurable options for the object.  For more
	 * information, see the this.options property.
	 * 
	 * @method setOptions
	 */
	setOptions: function(options) {
		/**
		 * The options property holds the configurable options for this list
		 * object.  It includes:
		 * - parentEl: the parent element (defaults to document.body)
		 * - id: the ID for the new element (defaults to a generated id)
		 * - selectedClass: the CSS class for selected items
		 * - unselectedClass: the CSS class for unselected items
		 */
        this.options = {};
		
		if(YAHOO.lang.isUndefined(options.parentEl)) {
			this.options.parentEl = document.body;
		} else {
            this.options.parentEl = YAHOO.util.Dom.get(options.parentEl);
		}
		
		this.options.id = options.id || YAHOO.util.Dom.generateId();
		
		this.options.selectedClass = options.selectedClass || "ListUtil-Selected";
		this.options.unselectedClass = options.unselectedClass || "ListUtil-Unselected";
	},
	
	/**
	 * This method renders the HTML for the list object.
	 * 
	 * @method render
	 */
	render: function() {
		this.el = WireIt.cn("ol", {id: this.options.id});
		this.options.parentEl.appendChild(this.el);
	},
	
	/**
	 * This method adds a new item to the list with the given text.  If switchToItem
	 * is true, it also switches to that item in the list.
	 * 
	 * @method addItem
	 * @param {String} text The text of the item to add.
	 * @param {boolean || null} switchToItem Whether to switch to the new item or
	 * not.
	 */
	addItem: function(text, switchToItem) {
		var li = WireIt.cn("li", null, null, text);
		this.el.appendChild(li);
		
		var index = this.items.length;
		this.items.push(li);
		
		YAHOO.util.Event.addListener(li, "click", this._onItemClicked, this, true);
		
		if(switchToItem) {
			this._onItemClicked({target: li});
		} else {
			this._updateItemClasses();
		}
		
		return index;
	},
	
	/**
     * This method adds a new item to the list with the given text and index.
     * If switchToItem is true, it also switches to that item in the list.
     * 
     * @method addItem
     * @param {String} text The text of the item to add.
     * @param {Number} idx The index of the item to add.
     * @param {boolean || null} switchToItem Whether to switch to the new item or
     * not.
	 */
	addItemWithIndex: function(text, idx, switchToItem) {
        if(YAHOO.lang.isUndefined(idx) || !YAHOO.lang.isNumber(idx) || idx < 0) {
            return;
        }
        
        var li = WireIt.cn("li", null, null, text);
        var before = this.items[idx];
        // If we are adding the li at the end, "before" should be undefined.
        // In this case just append li to el.
        if(before) {
            this.el.insertBefore(li, before);
        } else {
            this.el.appendChild(li);
        }

        // If we are adding the li at the end, just push li in items.
		var index = this.items.length;
		var newitems = [];
		if(idx == index) {
		    this.items.push(li);
		} else {
            for(var i = 0; i < index; i++) {
                if(i != idx) {
                    newitems.push(this.items[i]);
                } else if(i == idx) {
                    newitems.push(li);
                    newitems.push(this.items[i]);
                }
            }
            this.items = newitems;
		}
        
		YAHOO.util.Event.addListener(li, "click", this._onItemClicked, this, true);
		
		if(switchToItem) {
			this._onItemClicked({target: li});
		} else {
			this._updateItemClasses();
		}
		
		return index;
	},
	
	/**
	 * This method changes the class of the elements according to the index.
	 * 
	 * @method setIndentLevel
	 * @param {Number} index The index of the item.
	 * @param {Number} level The level to set.
	 */
	setIndentLevel: function(index, level) {
		if(YAHOO.lang.isUndefined(index) || !YAHOO.lang.isNumber(index)
           || index < 0 || index >= this.items.length) {
            return;
        }
		
		var li = this.items[index];
	    var color = this.indentColors[level % this.indentColors.length];
	    YAHOO.util.Dom.setStyle(li, "backgroundColor", color);
	    YAHOO.util.Dom.setStyle(li, "marginLeft", (level * 10) + "px");
	},
	
	/**
	 * This method removes the item at the given index.  If holdEventFire is true,
	 * then the onItemChanged event doesn't fire.
	 * 
	 * @method removeItem
	 * @param {Number} index The index of the item to remove.
     * @param {boolean || null} holdEventFire Whether to hold the changed event from
     * @param {boolean || null} goPrev Whether to move to previous element after the item is removed
	 * firing or not.
	 */
	removeItem: function(index, holdEventFire, goPrev) {
		if(YAHOO.lang.isUndefined(index) || !YAHOO.lang.isNumber(index)
		   || index < 0 || index >= this.items.length) {
			return;
		}
		if(goPrev == null) {
		    goPrev = false;
		}
		if(holdEventFire == null) {
		    holdEventFire = true;
		}
		// The new index will be the same as the old index (which will be pointing
        // to the next workflow in the list after the tab closes.  Unless the index
        // is currently pointing to the last one in the list, in which case we
        // should go back one.
        var oldIndex = index;
        var newIndex = oldIndex;
        if(goPrev) {
            if(oldIndex > 0) {
                newIndex--;
            }
        } else {
            if(oldIndex == (this.items.length - 1)) {
                newIndex--;
            }
        }
        
        // Remove from the list and GUI
        var li = this.items[oldIndex];
        this.items.splice(oldIndex, 1);
        this.el.removeChild(li);
        li = this.items[newIndex];
        
        // Update the GUI
        if(holdEventFire) {
            this.index = -1;
            this._onItemClicked({target: li});
        } else {
            this._updateItemClasses();
        }
	},
	
	/**
	 * This method removes the currently selected item in the list.
	 * 
	 * @method removeCurrentItem
	 */
	removeCurrentItem: function() { this.removeItem(this.index); },
	
	/**
	 * @method getIndex
	 * @return The currently selected index, or -1 for none.
	 */
	getIndex : function() { return this.index; },
	
	setIndex : function(index) {
        if(index == this.index) {
            // we clicked on the already selected item
            return;
        }
        
        this.index = index;
        this._updateItemClasses();
	},
	
	/**
	 * @method getElement
	 * @return The element at the given index, or null for invalid.
	 */
	getElement : function(index) {
		if(!YAHOO.lang.isUndefined(index) && YAHOO.lang.isNumber(index)
		   && index >= 0 && index < this.items.length) {
			return this.items[index];
		} else return null;
	},
	
	/**
	 * @method getCurrentElement
	 * @return The element at the current index, or null for invalid.
	 */
	 getCurrentElement : function () { return this.getElement(this.index); },
	
	/**
	 * @method getLength
	 * @return The current number of items in the list.
	 */
	getLength : function() { return this.items.length; },
	
	/** Private Methods **/
	
	/**
	 * This method is called when any list element is clicked.  It checks whether
	 * the click changed the item, and, if so, updates the classes and fires the
	 * onItemChanged event.
	 */
	_onItemClicked: function(event) {
		var oldIndex = null;
		
		var target = event.target;
		if(YAHOO.lang.isUndefined(target)) {
			target = event.srcElement; // why, IE, why??
		}

		var i = WireIt.indexOf(target, this.items);		
		
		if(i == this.index) {
			// we clicked on the already selected item
			return;
		} else if(this.index >= 0) {
			// we switched away from the item at this.index
			oldIndex = this.index;
		}
		
		this.index = i;
		this._updateItemClasses();
		
		// emit changed event
		this.onItemChanged.fire({oldIndex: oldIndex, newIndex: this.index});
	},
	
	/**
	 * This method updates the list item classes so that the selected and unselected
	 * class are applied to the proper items.
	 * 
	 * @method _updateItemClasses
	 */
	_updateItemClasses: function() {
		for(var i = 0; i < this.items.length; i++) {
			if(i == this.index) {
				// selected
				YAHOO.util.Dom.removeClass(this.items[i], this.options.unselectedClass);
                YAHOO.util.Dom.addClass(this.items[i], this.options.selectedClass);
			} else {
				// unselected
				YAHOO.util.Dom.removeClass(this.items[i], this.options.selectedClass);
                YAHOO.util.Dom.addClass(this.items[i], this.options.unselectedClass);
			}
		}
	}
};


/**
 * This function makes a copy of the relevant parts of the given containers and wires
 * (as taken from a layer).  It should ONLY be used with the copyContainersWires
 * function below.
 * 
 * @static
 * @method makeCopyContainersWires
 * @param {Array} containers The containers to copy.
 * @param {Array} wires The Wires to copy.
 * @returns {Object} An object containing the copy of the containers and wires.
 */
wfeditor.util.makeCopyContainersWires = function(containers, wires) {
	var ret = {
		containers: [],
		wires: []
	};
	
	// copy containers	
	for(var i = 0; i < containers.length; i++) {
		var container = containers[i];
        ret.containers[i] = {
        	options: YAHOO.lang.merge(container.options),
        	config: container.getConfig(),
			value: container.getValue(),
        	getConfig: function() { return this.config; },
			getValue: function() {return this.value; }
        };
	}
	
	// copy wires
	for(var i = 0; i < wires.length; i++) {
		var wire = wires[i];
		
		ret.wires[i] = {
			options: YAHOO.lang.merge(wire.options),
			terminal1: {
				container: ret.containers[WireIt.indexOf(wire.terminal1.container, containers)],
				options: {
					name: wire.terminal1.options.name
				},
				isField: wire.terminal1.isField
			},
			terminal2: {
				container: ret.containers[WireIt.indexOf(wire.terminal2.container, containers)],
				options: {
                    name: wire.terminal2.options.name
                },
                isField: wire.terminal2.isField
			}
		};
	}
	
	return ret;
};


/**
 * This method copies the given containers and wires to the new layer,
 * in read only mode if that flag is set.
 * 
 * @method copyContainersWires
 * @param {wfeditor.WorkflowEditor} editor The parent WorkflowEditor.
 * @param {Array} containers The containers to copy.
 * @param {Array} wires The wires to copy.
 * @param {WireIt.Layer} newLayer The layer to copy onto.
 * @param {boolean} readOnly Whether to copy in read-only mode or not.
 */
wfeditor.util.copyContainersWires = function(editor, containers, wires, newLayer, readOnly) {
	// Clear new layer
    newLayer.clear();
    
    // Add containers to new layer
    for(var i = 0; i < containers.length; i++) {
        var container = containers[i];
            
        // Get the base configuration from the editor's module list.
        var module = editor.modulesByName[container.options.title];
            
        // Augment with the options from the compose perspective's container
        // (for position, etc.).
        var containerConfig = container.options;
        if(module) {
            YAHOO.lang.augmentObject(containerConfig, module.container);
            containerConfig.title = module.name;
        } 
        containerConfig.position = container.getConfig().position;
        
        // Add the container (as read only if needed)
        var newContainer = wfeditor.util.addContainer(containerConfig, newLayer, readOnly);

        if(module) {
        	YAHOO.util.Dom.addClass(newContainer.el, "WiringEditor-module-"+module.name.split(' ').join(''));
        }

        newContainer.setValue(container.value);
    }
        
    // Add wires to new layer
    for(var i = 0; i < wires.length; i++) {
        var wire = wires[i];
        var wireConfig = wire.options;

        wireConfig.src = {
            moduleId: WireIt.indexOf(wire.terminal1.container, containers),
                terminal: wire.terminal1.options.name};
        if(wire.terminal1.isField) {
        	wireConfig.src.field = wireConfig.src.terminal;
        	delete wireConfig.src.terminal;
        }
        wireConfig.tgt = {
            moduleId: WireIt.indexOf(wire.terminal2.container, containers),
                terminal: wire.terminal2.options.name};
        if(wire.terminal2.isField) {
        	wireConfig.tgt.field = wireConfig.tgt.terminal;
            delete wireConfig.tgt.terminal;
        }

        newLayer.addWire(wireConfig);
    }
};

/**
 * This method copies the workflow (i.e. the containers and wires) from the old
 * layer to the new layer.
 * 
 * @static
 * @namespace wfeditor.util
 * @method copyWorkflow
 * @param {wfeditor.WorkflowEditor} editor The parent WorkflowEditor object, to
 * get module information from.
 * @param {WireIt.Layer} oldLayer The old layer (to copy from).
 * @param {WireIt.Layer} newLayer The new layer (to copy to).
 * @param readOnly the flag to specify whether to copy in read only mode (true: read only).
 */
wfeditor.util.copyWorkflow = function(editor, oldLayer, newLayer, readOnly) {
    this.copyContainersWires(editor, oldLayer.containers, oldLayer.wires, newLayer, readOnly);
};

/**
 * This method adds a container to the given layer using the given configuration,
 * except that it makes it read only if that flag is set.
 * 
 * @static
 * @namespace wfeditor
 * @method addContainer
 * @param {Object} containerConfig The container configuration parameters.
 * @param {WireIt.Layer} layer The layer to add the container to.
 * @param {boolean} readOnly Whether to add it as read only or not.
 * @return {WireIt.Container} The container that's been added.
 */
wfeditor.util.addContainer = function(containerConfig, layer, readOnly) {
    for(var j = 0; j < containerConfig.inputPorts.length; j++) {
       containerConfig.inputPorts[j].editable = !readOnly;
    }

    for(var j = 0; j < containerConfig.outputPorts.length; j++) {
        containerConfig.outputPorts[j].editable = !readOnly;
    }

    for(var j = 0; j < containerConfig.fields.length; j++) {
        containerConfig.fields[j].inputParams.editable = !readOnly;
    }
    
    containerConfig.draggable = !readOnly;
    containerConfig.resizeable = !readOnly;
    containerConfig.close = !readOnly;
    containerConfig.readOnly = readOnly;
    
    // Add "nonDraggable" to the list of CSS classes.  This lets us
    // change the cursor so that it doesn't look like the user can move around
    // the containers like they can in the compose perspective.
    if(readOnly) {
        if(containerConfig.className) {
            containerConfig.className = containerConfig.className + " nonDraggable";
        }
    }
            
    // Add it to the layer.
    var newContainer = layer.addContainer(containerConfig);
    
    if(readOnly) {
        // Disable the form, if present. (Data services don't have a form.)
        if(newContainer.form) {
            newContainer.form.disable();
        }
        
        // Add nondraggable to element
        YAHOO.util.Dom.addClass(newContainer.el, "nonDraggable");
    }
    
    return newContainer;
};


/**
 * This function "hacks" the clip of a YUI layout unit to add a title for when the
 * unit is collapsed.  If none of that makes sense to you, you probably shouldn't
 * change this method. :P
 * 
 * @static
 * @method hackLayoutClip
 * @param {YAHOO.widget.Layout} layout The layout to "hack."
 * @param {String} position The unit's position to "hack."
 * @param {String} text The text to "hack" as a collapse title.
 */
wfeditor.util.hackLayoutClip = function(layout, position, text) {
	var unit = layout.getUnitByPosition(position);
	if(!unit) {
		return;
	}
	
	var clip = unit._clip;
	if(!clip) {
		unit._createClip();
		clip = unit._clip;
		if(!clip) {
			return;
		}
	}
	
	var temp = WireIt.cn("div", {className: "collapseTitle " + position + "CollapseTitle"});
	temp.appendChild(WireIt.cn("p", {className: position}, null, text));
	clip.appendChild(temp);
};

/**
 * This method will allow the objects or arrays to be copied and not just get
 * a reference to it.
 *
 * @static
 * @method cloneObject
 * @param {Object} The object or array to clone.
 * @return The cloned object.
 */
wfeditor.util.cloneObject = function(objOrigin) {
    if(!objOrigin) return null;
	
  var newObj = (objOrigin instanceof Array) ? [] : {};
  for (i in objOrigin) {
    if (i == 'clone') continue;
    if (objOrigin[i] && typeof objOrigin[i] == "object") {
      newObj[i] = wfeditor.util.cloneObject(objOrigin[i]);
    } else newObj[i] = objOrigin[i]
  } return newObj;
};

/**
 * This method will create the string title for the services once the user sets a prefix for it.
 * The format that is currently used is prefix:ServiceName.
 * 
 * @method createAltName
 * @param {String} userPrefix The prefix set by the user.
 * @param {String} originalTitle The service's original title.
 * @return {String} The new title for the service with the prefix in it.
 */
wfeditor.util.creatAltName = function(userPrefix, originalTitle) {
	// When we don't have an originalTitle, we return the empty string.
	if (YAHOO.lang.isUndefined(originalTitle)) {
		return "";
	}
	
	// When we don't have a prefix or it's empty, then we return the original title.
	if (YAHOO.lang.isUndefined(userPrefix) || userPrefix === "") {
		return originalTitle;
	}
	
	// If we have data to work with, we create the new title and return it.
	return userPrefix + ":" + originalTitle;
};

/**
 * This method will be called when the user double clicks on the title of the service to change
 * (append a prefix) the name of it. This method will show a prompt to request the new title.
 * 
 * @method changeName
 */
wfeditor.util.changeName = function() {
    // We look for the editor instance and then call a prompt
    if(this.layer) {
        var editor = this.layer.editor.editor;
    
        editor.prompt({
            msg: "Please prefix for this service (empty to remove it):",
            callback: wfeditor.util.setNewName,
            value: this.options.userServiceName || "",
            scope: this
        });
    }
};

/**
 * This callback method will be called when the user enters the new name (prefix) of the
 * service. It will store the new name under the option userServiceName, the prefix will be
 * removed when the user enters an empty string.
 * 
 * @method setNewName
 * @param {String} value The new prefix for this service, empty removes the prefix.
 */
wfeditor.util.setNewName = function(value) {
    var span = wfeditor.util.getContainerTitleSpan(this);

    // If we don't have a span, we just return.
    if (YAHOO.lang.isUndefined(span)) {
        return;
    }
    
    // If we have a string
    if (!YAHOO.lang.isUndefined(value)) {
        // We save the preference
        this.options.userServiceName = value;
       
        // We set the name visually
		// Empty string means: "remove the prefix I set in the title"
		var newTitle = (value === "")
		   ? this.options.title
		   : wfeditor.util.creatAltName(value, this.options.title);
		   
		// We only have one span in the title.
		span.innerHTML = newTitle;
		// We notify that this workflow has been modified
		this.layer.eventChanged.fire(this);
    }
};

/**
 * This method will set the title of a service. This method will be called when rendering the
 * service.
 * @method setTitle
 * @param {WireIt.Container} title The container that where title will be set.
 */
wfeditor.util.setTitle = function(container) {
    span = wfeditor.util.getContainerTitleSpan(container);

	// If we don't have a span, we just return.
	if (YAHOO.lang.isUndefined(span)) {
		return;
	}
	
	var title = container.options.title;
	var userServiceName = container.options.userServiceName;
	
    // Set title
    if(title) {
    	/*
    	 * If we have a user service name set, we will use that for the container, if not then we
    	 * use the title. 
    	 */
        var newTitle = (YAHOO.lang.isUndefined(userServiceName))
            ? title
            : wfeditor.util.creatAltName(userServiceName, title);
        
        // When we cannot close the service we won't be able to modify its title.
        if (container.options.close) {
            YAHOO.util.Event.addListener(span, "dblclick", wfeditor.util.changeName, container,
                true);
        }
        // We set the title.
        span.innerHTML = newTitle;
    }
};

/**
 * This method will allow us to access the span that contains the title of a container.
 * @method getContainerTitleSpan
 * @param {WireIt.Container} The container from where we will find the title's span.
 * @return {HTMLELement||null} The span element in the title or null if not found.
 */
wfeditor.util.getContainerTitleSpan = function(container) {
    var span = container.labelSpan;

	/**
	 * The only container that has labelSpan defined is the data services. When we don't have this
	 * attribute we need to deal with the other services (services, workflows, utilities, etc).
	 */
	if (YAHOO.lang.isUndefined(container.labelSpan)) {        
        var spanElement = container.ddHandle.getElementsByTagName("span");
        if (spanElement) {
        	/*
        	 * Since we know that the first span found in the handler is the title's span, we
        	 * select that.
        	 */
            span = spanElement[0];
        }
	}
	
	return span;	
};

/**
 * This function removes all the "add" and "move" commands associated with the given service
 * container.
 * 
 * @static
 * @method removeServiceCommands
 * @param {Object} container The container.
 */
wfeditor.util.removeServiceCommands = function(container, commands) {
	var remove = function(stack) {
		var command;
		for(var i = 0; i < stack.length; i++) {
			command = stack[i];
			
			for(var j = 0; j < commands.length; j++) {
				if(command.getLabel() == commands[j] && command.container == container) {
					editor.commandStack.removeCommand(command);
					i--;
				}
			}
		}
	}
	
	remove(editor.commandStack.undostack);
	remove(editor.commandStack.redostack);
};

/**
 * This function intercedes in the normal Container's "onServiceClose" method to use the
 * command system.
 * 
 * @static
 * @method onServiceCloseButton
 * @param {Object} container The container.
 * @param {String} e See Container.onCloseButton.
 * @param {Array} args See Container.onCloseButton.
 */
wfeditor.util.onServiceCloseButton = function(container, e, args) {
	YAHOO.util.Event.stopEvent(e);
    var command = new wfeditor.command.CommandRemoveService(container);
    editor.getCommandStack().execute(command);
};

/**
 * This function is a helper for containers to use the move command.
 * 
 * @static
 * @method onServiceStartDrag
 * @param {Object} container The container.
 */
wfeditor.util.onServiceStartDrag = function(container) {
	container.startDragPos = container.getConfig().position;
};

/**
 * This function is a helper for containers to use the move command.
 * 
 * @static
 * @method onServiceDragDrop
 * @param {Object} container The container.
 */
wfeditor.util.onServiceDragDrop = function(container) {
	if(!container.startDragPos) { // shouldn't happen
		return;
	}
	
	var endDragPos = container.getConfig().position;
	
	var command = new wfeditor.command.CommandMoveService(container, container.startDragPos, endDragPos);
    editor.getCommandStack().execute(command);
    
    delete container.startDragPos;
};

/**
 * This function creates the value from containers/wires/properties to be stored
 * in middle tier.
 * 
 * @static
 * @method getValue
 * @param {Object} originalContainers The containers.
 * @param {Object} originalWires The wires.
 * @param {Object} originalProperties The properties.
 */
wfeditor.util.getValue = function(originalContainers, originalWires, originalProperties) {
    // Instantiate the object.
    var obj = {modules: [], wires: [], properties: null};
    
    // Add the module properties to the object.
    var i;
    for(i = 0; i < originalContainers.length; i++) {
        var newModule = {
                uniqueId: originalContainers[i].options.uniqueId,
                name: originalContainers[i].options.title,
                moduleId: i,
                userServiceName: originalContainers[i].options.userServiceName,
                type: originalContainers[i].options.type,
                url: originalContainers[i].options.url,
                value: originalContainers[i].getValue(),
                config: originalContainers[i].getConfig(),
                originalWorkflowId: originalContainers[i].options.originalWorkflowId
        };
        if(YAHOO.lang.isFunction(originalContainers[i].uiModel)) {
            newModule.uiModel = originalContainers[i].uiModel();
        }
        if(!YAHOO.lang.isUndefined(originalContainers[i].bottomPorts)) {
            newModule.dynPorts = [];
            for(var j = 0; j < originalContainers[i].bottomPorts.length; j++) {
                newModule.dynPorts.push(originalContainers[i].bottomPorts[j].options.name);
            }
        }
        if(!YAHOO.lang.isUndefined(originalContainers[i].connectedType)) {
            newModule.connectedType = originalContainers[i].connectedType;
        }
        
        if(originalContainers[i].options.type == "workflow" ||
           originalContainers[i].options.type == "composite") {
        	newModule.config.inputPorts = originalContainers[i].options.inputPorts.slice(0);
        	newModule.config.outputPorts = originalContainers[i].options.outputPorts.slice(0);
        	newModule.config.fields = originalContainers[i].options.fields.slice(0);
        	
        	// remove the "container" reference from fields.inputParams
        	for(var j = 0; j < newModule.config.fields.length; j++) {
        		delete newModule.config.fields[j].inputParams.container;
        	}
        }
        
        obj.modules.push(newModule);
    }

    var buildWireObj = function(containers, wire) {
        var ret = {
            src: {moduleId: WireIt.indexOf(wire.terminal1.container, containers)},
            tgt: {moduleId: WireIt.indexOf(wire.terminal2.container, containers)}
        }
        
        // Check if the wire is attached to a field
        if(wire.terminal1.isField) {
            ret.src.field = wire.terminal1.options.name;
        } else {
            ret.src.terminal = wire.terminal1.options.name;
        }
        
        // Check if the wire is attached to a field
        if(wire.terminal2.isField) {
            ret.tgt.field = wire.terminal2.options.name;
        } else {
            ret.tgt.terminal = wire.terminal2.options.name;
        }
        
        return ret;
    };

    // Add the wire properties to the object
    for(i = 0; i < originalWires.length; i++) {
        obj.wires.push(buildWireObj(originalContainers, originalWires[i]));
    }

    // Add the workflow properties to the object
    obj.properties = originalProperties;

    return {
        name: obj.properties.name,
        working: obj
    };
};
