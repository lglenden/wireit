/**
 * This class is a subclass of WireIt's Container class.  It basically has special
 * hardcoding in place to show/hide itself, change its size dynamically depending on
 * the layer, and handle packaging terminals/wires.
 * 
 * @class PackageContainer
 * @namespace wfeditor
 * @extends WireIt.Container
 * 
 * @author Laura
 * 
 */

/**
 * Constructor.
 * 
 * @constructor
 * @param {Object} options Options for constructing the container.
 * @param {WireIt.Layer} layer The layer on which the container is being placed.
 */
wfeditor.PackageContainer = function(options, layer) {
    // Call the parent class's constructor.
    wfeditor.PackageContainer.superclass.constructor.call(this, options, layer);
    
    this.layer.eventChanged.subscribe(this.onLayerChanged, this, true);

    /**
     * This property is an event that is fired when the exposed parameters/ports
     * are removed/added.
     * 
     * @property onPackageChanged
     * @type {YAHOO.util.CustomEvent}
     */
    this.onPackageChanged = new YAHOO.util.CustomEvent("onPackageChanged");
};

YAHOO.lang.extend(wfeditor.PackageContainer, WireIt.Container, {
    
    /**
     * Overrides the parent's setOptions method.  Turns off all the usual
     * container properties (such as "draggable", "resizable", etc.) and sets
     * the element ID if given.
     * 
     * @method setOptions
     * @param {Object} options
     */
    setOptions: function(options) {
        // Turn off all the usual container properties
        options.draggable = false;
        options.resizable = false;
        options.position = [0, 0];
        options.height = null;
        options.width = null;
        options.close = false;
        options.ddHandle = false;
        
        // Call the parent class.
        wfeditor.PackageContainer.superclass.setOptions.call(this, options);
        
        // Set the element ID
        this.options.elId = options.elId;
        
        // Set up input ports, output ports, and field arrays
        this.options.inputPorts = [];       
        this.options.outputPorts = [];
        this.options.fields = [];
        
        // Set whether to use a buffer around the drag-and-drop border or not.
        this.options.useBorderBuffer = options.useBorderBuffer || true;
    },
    
    /**
     * Overrides the parent's render method.  It removes the body element and
     * applies the element ID.
     * 
     * @method render
     */
    render: function() {
        // Call the parent class.
        wfeditor.PackageContainer.superclass.render.call(this);

        this.el.removeChild(this.bodyEl);
        
        if(this.options.elId) {
            this.el.id = this.options.elId;
        }
        
        /**
         * We keep a copy of the width of the border.
         * 
         * @property borderWidth
         * @type int
         */
        this.borderWidth = this.el.clientLeft;
        
        /**
         * This property is the drag-and-drop target for allowing the user to
         * package.
         * 
         * @property ddTarget
         * @type {YAHOO.util.DDTarget}
         */
        this.ddTarget = new YAHOO.util.DDTarget(this.options.elId);
    },
    
    /**
     * This method calculates whether the given position is on the border of the
     * package container or not.
     * 
     * @method
     * @param {Array} pos The position, in absolute x, y coordinates.
     * @return True if on the border, false otherwise.
     */
    isOnBorder: function(pos) {
        // Calculate offset relative to this element
        var offsetLeft = 0;
        var offsetTop = 0;      
        var offsetEl = this.el;
        
        while(offsetEl.offsetParent != null && offsetEl.offsetParent != document.body) {
            offsetLeft += offsetEl.offsetLeft;
            offsetTop += offsetEl.offsetTop;
            offsetEl = offsetEl.offsetParent;
        }
        
        pos[0] -= offsetLeft;
        pos[1] -= offsetTop;
                
        // Set up the bounding box.
        var left = this.el.clientLeft;
        var right = this.el.clientWidth;// + this.el.clientLeft;
        var top = this.el.clientTop;
        var bottom = this.el.clientHeight;// + this.el.clientTop;
                
        // Check for the border buffer.
        if(this.options.useBorderBuffer) {
            left += this.el.clientLeft + 40;
            top += this.el.clientTop + 40;
            right -= 40;//this.el.clientLeft - 40;
            bottom -= 40;//this.el.clientTop - 40;
        }
                
        var x = pos[0] <= left || pos[0] >= right;
        var y = pos[1] <= top || pos[1] >= bottom;

        return x || y;
    },
    
    /**
     * This method is used to add a new "packaging" terminal to the packaging
     * border.  It checks if the terminal is an input or an output and then
     * positions it appropriately.
     * 
     * @method addPackageTerminal
     * @param terminal {WireIt.Terminal} The terminal.
     * @param e {Event} The drag and drop event, to get the position.
     * @return {WireIt.Terminal} The newly created package terminal.
     */
    addPackageTerminal : function(terminal, e) {        

        // Calculate the offset position based on whether it's an input or an output
        isInput = terminal.options.direction[1] == -1;
        
        // Calculate whether it's a field that's been exposed
        isField = terminal.options.direction[0] == -1;
        
        // Do the positioning
        var offsetPos = {};        
        if(isInput && !isField) {
            // Input port
            offsetPos.left = -this.el.clientLeft;//(30 * (this.exposedTerminals.inputs.length + 1));
            offsetPos.top = -this.el.clientTop;
        } else if(!isField) {
            // Output port
            offsetPos.left = -this.el.clientLeft;//(30 * (this.exposedTerminals.outputs.length + 1));
            offsetPos.bottom = -this.el.clientTop;
        } else {
            // Field
            offsetPos.left = -this.el.clientLeft;
            offsetPos.top = (this.el.clientHeight / 2) - this.el.clientTop;
        }

        // Create the configuration to make the WireIt terminal
        var termConfig = {
            editable: true,
            offsetPosition: offsetPos,
            wireConfig: {
                color: '#00FF00'
            },
            alwaysSrc: true,
            xtype: "WireIt.TerminalExt",
            className: "WireIt-Terminal WireIt-ExposedTerminal" // add "exposed terminal" class
        };
        
        if(isField) {
            termConfig.direction = [1, 0];
        } else if(isInput) {
            termConfig.direction = [0, 1];
        } else {
            termConfig.direction = [0, -1];
        }

        // Set readonly
        var readOnly = this.layer.editor.editor.getCurrentPerspective().canvasReadOnly;
        termConfig.editable = !readOnly;

        // Add the terminal to this container
        var layerTerm = this.addTerminal(termConfig);
         
        if(isInput && !isField) {
            this.options.inputPorts.push(layerTerm);
        } else if(!isField) {
            this.options.outputPorts.push(layerTerm);
        } else {
            this.options.fields.push(layerTerm);
        }
        
        // Reposition port terminals
        wfeditor.Service.positionTerminals(this, this.options.inputPorts, this.options.outputPorts);
        
        // Reposition field terminals
        this.positionFieldTerminals();
        
        // Ask to be notified if the user removes the wire
        layerTerm.eventRemoveWire.subscribe(this.removePackageTerminal, this, true);
        layerTerm.options.isExposed = true;


        // emit changed event
        this.onPackageChanged.fire();

        return layerTerm;
    },
    
    /**
     * This method is called when the user removes the wire on a packaged terminal.
     * It removes that terminal and re-positions the rest of them.
     * See WireIt.TerminalProxy.eventRemoveWire.
     * 
     * @method removePackageTerminal
     * @param e {Event} The event that triggered the callback.
     * @param params The callback params.
     */
    removePackageTerminal: function(e, params) {
        var packageTerm = params[0].terminal1;
        
        var terminals = this.options.inputPorts;
        var index = -1;
        
        // Find it if it's an input
        for(var i = 0; i < terminals.length; i++) {
            if(packageTerm == terminals[i]) {
                index = i;
                break;
            }
        }
        
        // Remove the terminal and reposition the packaging input terminals
        if(index >= 0) {
            terminals.splice(index, 1);
            packageTerm.remove();
            wfeditor.Service.positionTerminals(this, this.options.inputPorts, this.options.outputPorts);
            return;
        }
        
        terminals = this.options.outputPorts;
        index = -1;
        
        // Find it if it's an output
        for(var i = 0; i < terminals.length; i++) {
            if(packageTerm == terminals[i]) {
                index = i;
                break;
            }
        }
        
        // Remove the terminal and reposition the packaging output terminals
        if(index >= 0) {
            terminals.splice(index, 1);
            packageTerm.remove();
            wfeditor.Service.positionTerminals(this, this.options.inputPorts, this.options.outputPorts);
            return;
        }
        
        terminals = this.options.fields;
        index = -1;
        
        // Find it if it's a field
        for(var i = 0; i < terminals.length; i++) {
            if(packageTerm == terminals[i]) {
                index = i;
                break;
            }
        }
        
        // Remove the terminal and reposition the packaging field terminals
        if(index >= 0) {
            terminals.splice(index, 1);
            packageTerm.remove();
            this.positionFieldTerminals();
        }

        // emit changed event
        this.onPackageChanged.fire();

    },
   
    /**
     * This method is called when the layer has changed size.  It updates the
     * package container's size accordingly.
     * 
     * @method onLayerChanged
     */ 
    onLayerChanged: function() {

        //get the most right bottom point 
        var layerContainers = this.layer.containers;
        var maxRight=0;
        var maxBottom=0;
        if(layerContainers){
            var containerCnt = layerContainers.length;          
            for(var cnt=0;cnt<containerCnt;cnt++){
                var left = layerContainers[cnt].el.style.left;
                var top = layerContainers[cnt].el.style.top;
                if(left.indexOf("px")>0)
                    left = parseInt(left.substring(0,left.indexOf("px")),10);
                if(top.indexOf("px")>0)
                    top = parseInt(top.substring(0,top.indexOf("px")),10);

                var containerDiv = document.getElementById(layerContainers[cnt].el.id);
                var right = left + containerDiv.offsetWidth;
                var bottom = top + containerDiv.offsetHeight;
                if(maxRight<right)
                    maxRight = right;
                if(maxBottom<bottom)
                    maxBottom = bottom;
            }
        }
        
        //get packageContainer width and height
        var width = this.el.style.width;
        var height = this.el.style.height;
        
        //new size of packageContainer
        var newPackageWidth = 0;
        var newPackageHeight = 0;
        if(this.canvasEl){
            var canvasObj = document.getElementById(this.canvasEl);         
            newPackageWidth = canvasObj.offsetWidth - 35 - (2 * this.borderWidth);
            newPackageHeight = canvasObj.offsetHeight - 70 -(2 * this.borderWidth);
        }
        
        //compute right bottom of packageContainer
        var packageleft = this.el.style.left;
        var packagetop = this.el.style.top;
        if(packageleft.indexOf("px")>0)
            packageleft = parseInt(packageleft.substring(0,packageleft.indexOf("px")),10);
        if(packagetop.indexOf("px")>0)
            packagetop = parseInt(packagetop.substring(0,packagetop.indexOf("px")),10);
        var packageRight = packageleft + newPackageWidth;
        var packageBottom = packagetop + newPackageHeight;      
        
            
        // Remove "px" at end.
        if(width.length > 2) width = width.substr(0, width.length - 2);
        if(height.length > 2) height = height.substr(0, height.length - 2);
        
        if((maxRight==0&&maxBottom==0)||(packageRight>maxRight&&packageBottom>maxBottom)){//no containers except packageContainer itself or containers are within the border
            if(newPackageWidth!=width || newPackageHeight!=height){
                this.el.style.width = newPackageWidth + "px";
                this.el.style.height = newPackageHeight + "px";
            }
        }else{//existing contains outside the packageContainer
            var layerWidth = this.layer.el.scrollWidth - (2 * this.borderWidth);
            var layerHeight = this.layer.el.scrollHeight - (2 * this.borderWidth);
                
            if(layerWidth != width || layerHeight != height) {
                this.el.style.width = layerWidth + "px";
                this.el.style.height = layerHeight + "px";
            }
        }
                        
        // Reposition port terminals
        wfeditor.Service.positionTerminals(this, this.options.inputPorts,
            this.options.outputPorts);
        this.positionFieldTerminals();
    },
    
    /**
     * This method positions the field terminals, depending on how many there are and
     * the current height of the container.
     * 
     * @method positionFieldTerminals
     */
    positionFieldTerminals: function() {
        var height = this.el.style.height;
        if(height.length > 2) height = height.substr(0, height.length - 2);
        
        var n = this.options.fields.length;
        var nInt = Math.floor(height / (n + 1));
        
        var term;
        for(var i = 0; i < this.options.fields.length; i++) {
            term = this.options.fields[i];
            YAHOO.util.Dom.setStyle(term.el, "top",
                (nInt * (i + 1)) - this.borderWidth + "px");

            for(j = 0; j < term.wires.length; j++) {
                term.wires[j].redraw();
            }
        }
    }
});