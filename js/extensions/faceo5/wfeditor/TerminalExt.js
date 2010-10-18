/**
 * TerminalExt is a subclass of WireIt's Terminal class to do custom handling for our
 * application.  In particular, we have augmented this class to include more specific
 * syntactic checks and packaging code.
 * 
 * @class TerminalProxyExt
 * @namespace WireIt
 * @extends WireIt.TerminalProxy
 * 
 * @author Hector
 */
(function() {
   /**
    * Other references using in the class to avoid writing the entire variable name.
    */
   var util = YAHOO.util;
   var Event = util.Event, lang = YAHOO.lang, Dom = util.Dom, CSS_PREFIX = "WireIt-";

/**
 * Constructor. The constructor just calls the parent class to create the instance.
 * 
 * @constructor
 * @param {WireIt.Terminal} terminal Parent terminal
 * @param {Object} options Configuration object (see "termConfig" property for details)
 */
WireIt.TerminalProxyExt = function(terminal, options) {
   WireIt.TerminalProxyExt.superclass.constructor.call(this,terminal, options);
};

lang.extend(WireIt.TerminalProxyExt, WireIt.TerminalProxy, {
	
   
   /**
    * This method will handle the drag event on a terminal.
    * 
    * @method onDrag
    * @param {Object} The event object.
    */
   onDrag: function(e) {
      
      // Remove the error highlighting on this terminal
      this.terminal.setErrorHighlight(false);
      
      // Prevention when the editing wire could not be created (due to nMaxWires)
      if(!this.editingWire) { return; }
      
      if(this.terminal.container) {
         var obj = this.terminal.container.layer.el;
         var curleft = curtop = 0;
         
         this.fakeTerminal.pos = [e.clientX-curleft+this.terminal.container.layer.el.scrollLeft,
                                  e.clientY-curtop+this.terminal.container.layer.el.scrollTop];
      }
      else {
         this.fakeTerminal.pos = (YAHOO.env.ua.ie) ? [e.clientX, e.clientY] : [e.clientX+window.pageXOffset, e.clientY+window.pageYOffset];
         //this.fakeTerminal.pos = [e.clientX, e.clientY];
      }
      this.editingWire.redraw();
   },
   
   /**
    * This method is called when a wire is being dropped on a terminal.
    * 
    * @method onDragEnter
    * @param {Object} e the event object generated.
    * @param {Array} ddTargets the terminal where the connector is being dragged.
    */
   onDragEnter: function(e,ddTargets) {
      
      // Prevention when the editing wire could not be created (due to nMaxWires)
      if(!this.editingWire) { return; }
      
      /**
       * We will check that the terminal where we are droppin the wire is a valid terminal and also
       * where a connection can be made.
       */
      for(var i = 0 ; i < ddTargets.length ; i++) {
         if( this.isValidWireTerminal(ddTargets[i]) && this.terminal.connectionIsAllowed(this.terminal, ddTargets[i].terminal) ) {
            ddTargets[i].terminal.setDropInvitation(true);
         } else if(ddTargets[i].terminal) {
         	ddTargets[i].terminal.setErrorHighlight(true);
         }
      }
   },
   
   /**
    * This function overrides the parent class to remove the error highlighting for the
    * dd targets.  See documentation for TerminalProxy.
    * @method onDragOut
    */
   onDragOut: function(e,ddTargets) {
      WireIt.TerminalProxyExt.superclass.onDragOut.call(this, e, ddTargets);
      for(var i = 0; i < ddTargets.length; i++) {
      	 if(ddTargets[i].terminal) {
      	 	ddTargets[i].terminal.setErrorHighlight(false);
      	 }
      }
   },

   /**
    * This method will be calle when the wire is dropped on a connector.
    * 
    * @method onDragDrop
    * @param {Object} e the event object generated.
    * @param {Array} ddTargets the terminal where the connector is being dragged.
    */
   onDragDrop: function(e,ddTargets) {      
      // Prevention when the editing wire could not be created (due to nMaxWires)
      if(!this.editingWire) { return; }
      
      this.onDragOut(e,ddTargets);
      
      // Connect to the FIRST target terminal
      var targetTerminalProxy = null;
      
      var targetPackage = false;
      
      for(var i = 0 ; i < ddTargets.length ; i++) {
         if( this.isValidWireTerminal(ddTargets[i]) ) {
            targetTerminalProxy =  ddTargets[i];
            break;
         }
         
         // Check if the target is the package border
         else if(ddTargets[i].id == this.terminal.container.layer.editor.options.idPackageContainer) {
         	targetPackage = this.terminal.container.layer.editor.packageContainer.isOnBorder(
         	  [e.clientX, e.clientY]);
         }
      }
      
      if(targetPackage && !this.terminal.isAnyType) {
         layerTerm = this.terminal.container.layer.editor.packageContainer.addPackageTerminal(this.terminal, e);
         targetTerminalProxy = layerTerm.dd;
      }

      // Quit if no valid terminal found
      if( !targetTerminalProxy ) { 
         return;
      }
      
      // Remove the editing wire
      this.editingWire.remove();
      this.editingWire = null;
         
      // Don't create the wire if it already exists between the 2 terminals !!
      var termAlreadyConnected = false;
      for(var i = 0 ; i < this.terminal.wires.length ; i++) {
         if(this.terminal.wires[i].terminal1 == this.terminal) {
            if( this.terminal.wires[i].terminal2 == targetTerminalProxy.terminal) {
               termAlreadyConnected = true;
               break;
            }
         }
         else if(this.terminal.wires[i].terminal2 == this.terminal) {
            if( this.terminal.wires[i].terminal1 == targetTerminalProxy.terminal) {
               termAlreadyConnected = true;
               break;
            }
         }
      }
      
     // Don't create the wire if the terminals are two inputs or two outputs
     if(!targetPackage && !this.terminal.connectionIsAllowed(this.terminal, targetTerminalProxy.terminal)){
        return;
     }
      
      // Create the wire only if the terminals aren't connected yet
      if(termAlreadyConnected) {
         //console.log("terminals already connected ");
         return;
      }
         
      var parentEl = this.terminal.parentEl.parentNode;
      if(this.terminal.container) {
         parentEl = this.terminal.container.layer.el;
      }
      
      // Switch the order of the terminals if tgt as the "alwaysSrc" property
      var term1 = this.terminal;
      var term2 = targetTerminalProxy.terminal;
      if(term2.options.alwaysSrc) {
         term1 = targetTerminalProxy.terminal;
         term2 = this.terminal;
      }
      
      // Check the number of wires for this terminal
      var tgtTerm = targetTerminalProxy.terminal;
      if( tgtTerm.options.nMaxWires == 1) {
         if(tgtTerm.wires.length > 0) {
            tgtTerm.wires[0].remove();
         }
         var w = new WireIt.Wire(term1, term2, parentEl, term1.options.wireConfig);
         w.isValidWire = true;
         var command = new wfeditor.command.CommandConnectPort(w);
         editor.getCommandStack().execute(command); 
         //w.redraw();
      }
      else if(tgtTerm.wires.length < tgtTerm.options.nMaxWires) {
         var w = new WireIt.Wire(term1, term2, parentEl, term1.options.wireConfig);
         w.isValidWire = true;
         var command = new wfeditor.command.CommandConnectPort(w);
         editor.getCommandStack().execute(command); 
         //w.redraw();
      }
      /*else {
         console.log("Cannot connect to this terminal: nMaxWires = ", ddTargets[0].terminal.options.nMaxWires);
      }*/
      
   },

   /**
    * This method will check if the terminal that we are connecting to this one is compatible.
    * 
    * @method isValidWireTerminal
    * @param {WireIt.TerminalExt} DDterminal The terminal that is connected to this one.
    */
    isValidWireTerminal: function(DDterminal) {
        if( !DDterminal.isWireItTerminal ) {
            return false;
        }
        // Check the allowSelfWiring
        if(this.terminal.container) {    
            if(this.terminal.container.options.preventSelfWiring) {
                if(DDterminal.terminal.container == this.terminal.container) {
                    
                    //turn the ports red as its invalid connection
                    editor.logProgress("Invalid connection - Cannot connect ports of same service with each other","Self Connection Check: Syntactic Error Message");
    
                    return false;
                }
            }
        }

        if (this.termConfig.type === "anyType" || WireIt.indexOf(
            "anyType", this.termConfig.allowedTypes) >= 0) {
        	this.terminal.isAnyType = true;
        }
        
        if (DDterminal.termConfig.type === "anyType" || WireIt.indexOf(
            "anyType", DDterminal.termConfig.allowedTypes) >= 0) {
        	DDterminal.terminal.isAnyType = true;
        }
        
        if(!this.terminal.isAnyType && !DDterminal.terminal.isAnyType && (this.termConfig.allowedTypes.length != 0 && DDterminal.termConfig.allowedTypes.length != 0)){
        	var terminalAllowedTypes = this.termConfig.allowedTypes;
        	var ddTerminalAllowedTypes = DDterminal.termConfig.allowedTypes;
        	if(wfeditor.util.compareTwoArrays(terminalAllowedTypes,ddTerminalAllowedTypes)){
        		return true;
        	}
        	else {
	            return false; 
        	}
        }
      
        // If this terminal has the type property:
        if(!this.terminal.isAnyType && !DDterminal.terminal.isAnyType && this.termConfig.type) {

	        /*
	         * If this terminal has allowed types set, we check.
	         */
	        if(this.termConfig.allowedTypes) {
	    		
	    		/*
	    		 * We look for the type of the destination terminal in this terminal's allowed
	    		 * types. -1 means that a match wasn't found.
	    		 */
	            if( WireIt.indexOf(DDterminal.termConfig.type, this.termConfig.allowedTypes) == -1 ) {
	
                    /*
                     * If we have a set of allowed types in the destination terminal.
                     */
	                if( DDterminal.termConfig.allowedTypes ) {
	                	/*
	                	 * We look for the type of this terminal in the allowed types in the
	                	 * destination terminal. -1means that a match wasn't found.
	                	 */
	                    if( WireIt.indexOf(this.termConfig.type, DDterminal.termConfig.allowedTypes) == -1 ) {
	                    
	                        //turn the ports red as its invalid connection
	                        editor.logProgress("Invalid connection - Port types do not match","Port Type Check: Syntactic Error Message");
	                      
	                        return false; 
	                    }
	                    /*
	                     * If the destimation terminal has a type, then we compare it with the
	                     * origin terminal. If this fails, we indicate visually.
	                     */
	                } else if( DDterminal.termConfig.type ) {
	                    if(this.termConfig.type != DDterminal.termConfig.type) {
	                       
	                        //turn the ports red as its invalid connection
	                        editor.logProgress("Invalid connection - Port types do not match","Port Type Check: Syntactic Error Message");
	                       
	                        return false;
	                    }
	                }
	            }
	        }
	        /**
	         * If this terminal doesn't have allowedTypes, we check the type of the diestination
	         * and this terminal, if they don't match, we return false.
	         */
	        else {
	            if(this.termConfig.type != DDterminal.termConfig.type) {
	                return false;
	            }
	        }
        }
        // The other terminal may have type property too:
        else if(!this.terminal.isAnyType && !DDterminal.terminal.isAnyType && DDterminal.termConfig.type) {
            if(DDterminal.termConfig.allowedTypes) {
                if( WireIt.indexOf(this.termConfig.type, DDterminal.termConfig.allowedTypes) == -1 ) {
                    return false;
                }
            }
            else {
                if(this.termConfig.type != DDterminal.termConfig.type) {
                    return false;
                }
            }
        }

        return true;
    }
   
}),


   
/**
 * Terminals represent the end points of the "wires"
 * @class Terminal
 * @constructor
 * @param {HTMLElement} parentEl Element that will contain the terminal
 * @param {Object} options Configuration object
 * @param {WireIt.Container} container (Optional) Container containing this terminal
 */
WireIt.TerminalExt = function(parentEl, options, container) {
   WireIt.TerminalExt.superclass.constructor.call(this, parentEl, options, container);
   this.setOptions(options);

   // Create the TerminalProxyExt object to make the terminal editable
   if(this.options.editable) {
      this.dd = new WireIt.TerminalProxyExt(this, this.options.ddConfig);
      this.scissors = new WireIt.Scissors(this);
   }
};

lang.extend(WireIt.TerminalExt, WireIt.Terminal, {

   /**
    * This method will initialize the options for this terminal.
    * 
    * @method setOptions
    * @param {Object} options The options to set.
    */
   setOptions: function(options) {
      /**
       * <p>Object that contains the terminal configuration:</p>
       * 
       * <ul>
       *   <li><b>name</b>: terminal name</li>
       *   <li><b>direction</b>: direction vector of the wires when connected to this terminal (default [0,1])</li>
       *   <li><b>fakeDirection</b>: direction vector of the "editing" wire when it started from this terminal (default to -direction)</li>
       *   <li><b>editable</b>: boolean that makes the terminal editable (default to true)</li>
       *   <li><b>nMaxWires</b>: maximum number of wires for this terminal (default to Infinity)</li>
       *   <li><b>offsetPosition</b>: offset position from the parentEl position. Can be an array [top,left] or an object {left: 100, bottom: 20} or {right: 10, top: 5} etc... (default to [0,0])</li>
       *   <li><b>ddConfig</b>: configuration of the WireIt.TerminalProxy object (only if editable)</li>
       *   <li><b>alwaysSrc</b>: alwaysSrc forces this terminal to be the src terminal in the wire config (default false, only if editable)</li>
       *   <li><b>className</b>: CSS class name of the terminal (default to "WireIt-Terminal")</li>
       *   <li><b>connectedClassName</b>: CSS class added to the terminal when it is connected (default to "WireIt-Terminal-connected")</li>
       *   <li><b>dropinviteClassName</b>: CSS class added for drop invitation (default to "WireIt-Terminal-dropinvite")</li>
       * </ul>
       * @property options
       */  
      this.options = {};
      this.options.name = options.name;
      this.options.direction = options.direction || [0,1];
      this.options.fakeDirection = options.fakeDirection || [-this.options.direction[0],-this.options.direction[1]];
      this.options.className = options.className || CSS_PREFIX+'Terminal';
      this.options.connectedClassName = options.connectedClassName || CSS_PREFIX+'Terminal-connected';
      this.options.dropinviteClassName = options.dropinviteClassName || CSS_PREFIX+'Terminal-dropinvite';
      this.options.editable = lang.isUndefined(options.editable) ? true : options.editable;
      /* changed for our tool constraint to not allow multiple wires being connected to a single port (terminal)*/
      this.options.nMaxWires = options.nMaxWires || 1;
      this.options.wireConfig = options.wireConfig || {};
      this.options.editingWireConfig = options.editingWireConfig || this.options.wireConfig;
      this.options.offsetPosition = options.offsetPosition;
      this.options.alwaysSrc = lang.isUndefined(options.alwaysSrc) ? false : options.alwaysSrc;
      this.options.ddConfig = options.ddConfig || {};
   },
   
    /**
     * This method sets (or unsets) the error highlighting image from displaying for the
     * terminal.
     * 
     * @method setErrorHighlight
     * @param {Boolean} display True for error highlighting, false to turn it off.
     */
    setErrorHighlight: function(display) {
    	if(display) {
    		YAHOO.util.Dom.addClass(this.el, "errorHighlight");
    	} else {
    		YAHOO.util.Dom.removeClass(this.el, "errorHighlight");
    	}
    },

   /**
    * This function is a temporary test. I added the border width while traversing the DOM and
    * I calculated the offset to center the wire in the terminal just after its creation
    * 
    * @method getXY
    */
   getXY: function() {
      var layerEl = this.container && this.container.layer ? this.container.layer.el : document.body;

      var obj = this.el;
      var curleft = curtop = 0;
      
     	if (obj.offsetParent) {
     		do {
     			curleft += obj.offsetLeft;
     			curtop += obj.offsetTop;
     			obj = obj.offsetParent;
     		} while ( !!obj && obj != layerEl);
     	}
     	
        if(this.options.isExposed) {
        	curleft += this.container.layer.editor.packageContainer.el.clientLeft;
        	curtop += this.container.layer.editor.packageContainer.el.clientTop;
        }

     	return [curleft+15,curtop+15];
   },

   /** 
    * Checks if the terminal type is input or output
    * 
    * @method isInputTerminal
    * @param {Array} direction The input/output configuration for this terminal.
    * @return {Boolean} true when the terminal is input, false otherwise.
    */
   isInputTerminal: function(direction) {
        return direction[1] == -1 || direction[0] == -1;
    },
   
   /** 
    * returns true is the connection is allowed and returns false if connection is not allowed
    * Does not allow "input" to "input" and "output" to "output"
    * 
    * @method connectionIsAllowed
    * @param {WireIt.TerminalExt} terminal1 The first terminal to check.
    * @param {WireIt.TerminalExt} terminal2 The second terminal to check.
    */
   connectionIsAllowed: function(terminal1, terminal2) {
   
    if(this.isInputTerminal(terminal1.options.direction) == this.isInputTerminal(terminal2.options.direction)){
        
        //turn the ports red as its invalid connection
        editor.logProgress("Invalid connection - Cannot connect ports that are both inputs or both outputs","Ports Direction Check: Syntactic Error Message");
        
        return false;
    }
        else{
            return true;
        }
    }
});



 /**
  * Class that extends Terminal to differenciate Input/Output terminals
  * 
  * @class WireIt.util.TerminalInput
  * @extends WireIt.TerminalExt
  * @constructor
  * @param {HTMLElement} parentEl Parent dom element
  * @param {Object} options configuration object
  * @param {WireIt.Container} container (Optional) Container containing this terminal
  */
WireIt.util.TerminalInput = function(parentEl, options, container) {
   WireIt.util.TerminalInput.superclass.constructor.call(this,parentEl, options, container);
};
lang.extend(WireIt.util.TerminalInput, WireIt.TerminalExt, {
   
   /**
    * Override setOptions to add the default options for TerminalInput
    * @method setOptions
    * @param {Object} options the options to configure this object.
    */
   setOptions: function(options) {
      
      WireIt.util.TerminalInput.superclass.setOptions.call(this,options);
      
      this.options.nMaxWires = options.nMaxWires || 1;
      this.options.direction = options.direction || [0,-1];
      this.options.fakeDirection = options.fakeDirection || [0,1];
      this.options.ddConfig = {
         type: "input",
         allowedTypes: ["output"]
      };
      this.options.nMaxWires = options.nMaxWires || 1;
   }
   
});

 /**
  * Class that extends Terminal to differenciate Input/Output terminals
  * 
  * @class WireIt.util.TerminalOutput
  * @extends WireIt.TerminalExt
  * @constructor
  * @param {HTMLElement} parentEl Parent dom element
  * @param {Object} options configuration object
  * @param {WireIt.Container} container (Optional) Container containing this terminal
  */
WireIt.util.TerminalOutput = function(parentEl, options, container) {
   WireIt.util.TerminalOutput.superclass.constructor.call(this,parentEl, options, container);
};
lang.extend(WireIt.util.TerminalOutput, WireIt.TerminalExt, {
   
   /**
    * Override setOptions to add the default options for TerminalOutput
    * 
    * @method setOptions
    * @param {Object} options the options to configure this object.
    */
   setOptions: function(options) {
      
      WireIt.util.TerminalOutput.superclass.setOptions.call(this,options);
      
      this.options.direction = options.direction || [0,1];
      this.options.fakeDirection = options.fakeDirection || [0,-1];
      this.options.ddConfig = {
         type: "output",
         allowedTypes: ["input"]
      };
      this.options.alwaysSrc = true;
   }
   
});

})();
