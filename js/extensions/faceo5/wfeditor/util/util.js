/**
 * "Package" object.
 * 
 * @module wfeditor.util
 */
wfeditor.util = {};

/**
 * This method is a helper method for children to create a button in the toolbar.
 * It can be flexible based on the passed in options.
 * 
 * @static
 * @method createButton
 * @namespace wfeditor.util
 * @param {Object} options Options to tailor the button creation.  Uses defaults if
 * none are given.  Includes: label (defaults to "Button"),
 * id (defaults to perspective's id - button name - Button),
 * container (defaults to the id of the top), clickFn, clickFnScope.
 * @return {YAHOO.widget.Button} The created button.
 */
wfeditor.util.createButton = function(options) {
    var label = options.label || "Button";
        
    // Set up button
    var id = options.label || "Button";
    var label = id;
    if(options.img) {
        label = "<img src='" + options.img + "' class='buttonImg' /><span class='buttonImgTxt'>" +
                label + "</span>";
    }
        
    // Create button
    var button = new YAHOO.widget.Button({
        type: options.type || "push",
        label: label,
        id: options.id || YAHOO.util.Dom.generateId(),
        container: options.container});
            
    // Set up click function, if given
    if(options.clickFn) {
        if(!options.clickFnScope) {
            options.clickFnScope = this;
        }
        button.on("click", options.clickFn, options.clickFnScope, true);
    }
        
    // Add CSS class, if in this.options
    if(options.buttonClass) {
        button.addClass(options.buttonClass);
    }

    return button;
};

/**
 * This method returns a copy of the given array with all the given items removed
 * from it.
 * 
 * @static
 * @method removeItems
 * @namespace wfeditor.util
 * @param {Array} arr The array to copy and remove the items from.
 * @param {Array} items The items to rmove from the copy of the array.
 * @return A copy of the array with all the given items removed.
 */
wfeditor.util.removeItems = function(arr, items) {
    var ret = [];
    for(var i in arr) {
        var found = false;
        for(var j in items) {
            if(arr[i] == items[j]) {
                found = true;
                break;
            }
        }
        
        if(!found) ret.push(arr[i]);
    }
    
    return ret;
};

/**
 * This method is a helper method to create an HTMLElement with the given characteristics.
 * 
 * @static
 * @method createEl
 * @namespace wfeditor.util
 * @param {String} tag The tag of the HTML element to create.
 * @param {Object || null} attr Any attributes to set on the element.
 * @param {Object || null} style Any style attributes to set on the element.
 * @param {String || null} innerHTML Any text to put in the inner HTML of the element.
 * @return {HTMLElement} The created element.
 */
wfeditor.util.createEl = function(tag, attr, style, innerHTML) {
    var el = document.createElement(tag);
        
    // Attributes
    if(attr) {
        for(var i in attr) {
            el[i] = attr[i];
        }
    }
        
    // Style
    if(style) {
        for(var i in style) {
            el.style[i] = style[i];
        }
    }
        
    if(innerHTML) {
        el.innerHTML = innerHTML;
    }
        
    return el;
};

/**
 * This method is a helper to make a checkbox field for inputEx with the given
 * options.
 * 
 * @static
 * @method _makeCheckboxField
 * @namespace wfeditor.util
 * @param {String} category The name of the category.
 * @param {String} value The name of the value to create the checkbox for.
 * @param {boolean} showLabel Whether to show the left-hand side label or not.
 * @param {boolean || null} startChecked Whether to start the checkbox as checked
 * or not.  (null is the same thing as false)
 */
wfeditor.util.makeCheckboxField = function(category, value, showLabel, startChecked) {
    return {
        type: "boolean",
        inputParams: {
            name: category + "_" + value,
            label: showLabel ? (category + ":") : " ",
            rightLabel: value,
            sentValues: ['Yes', 'No'],
            value: startChecked ? 'Yes' : 'No'
        }
    };
};

/**
 * This method is a helper to make a multiple select field for inputEx with the given
 * options.
 * 
 * @static
 * @method _makeMultipleSelectField
 * @namespace wfeditor.util
 * @param {String} category The name of the category.
 * @param {String} showLabel The display label for the category.
 * @param {Array} options The array of options that can be selected
 */
wfeditor.util.makeMultipleSelectField = function(category, options, showLabel){
    return {
        type: "multiselect",
        inputParams: {
            name: category,
            label: showLabel,
            selectValues: options
        }
    };
};

/**
 * This function replaces HTML characters in the given string.  It's used for sanitizing the
 * HTML strings from the backend sent in JSON format.
 * 
 * @static
 * @method replaceHTMLChars
 * @namespace wfeditor.util
 * @param {String} str The string to replace the characters.
 * @returns The string with the replaced characters.
 */
wfeditor.util.replaceHTMLChars = function(str) {
    
     return str.replace(/\/u003c/g, "<").replace(/\/u003e/g, ">").replace(/\/u0027/g, "'").replace(/\/u003d/g, "=")
     .replace(/\/n/g, "").replace(/\/t/g, "").replace(/\/r/g, "")
     .replace(/\=\//g,"=\\").replace(/\/\">/g,"\\\">").replace(/\/\"\(/g,"/\\\"(");
};

/**
 * This function does an efficient array comparison. It returns true if there is a two arrays have at least one element in common.
 * 
 * @static
 * @method compareTwoArrays
 * @namespace wfeditor.util
 * @param {Array} array1 Array1.
 * @param {Array} array2 Array1.
 * @returns Returns true if a match is found.
 */
wfeditor.util.compareTwoArrays = function(array1, array2){
   var lookup = {};
  
   for (var j in array2) {
     lookup[array2[j]] = array2[j];
   }
   var returnVal = false;
   for (var i in array1) {
      if (typeof lookup[array1[i]] != 'undefined') {
          returnVal = true;
          break;
      } 
   }
   return returnVal;
};

wfeditor.util.fitStringToWidth = function (str,width,className) {
      // str    A string where html-entities are allowed but no tags.
      // width  The maximum allowed width in pixels
      // className  A CSS class name with the desired font-name and font-size. (optional)
      // ----
      // _escTag is a helper to escape 'less than' and 'greater than'
      function _escTag(s){ return s.replace("<","&lt;").replace(">","&gt;");}

      //Create a span element that will be used to get the width
      var span = document.createElement("span");
      //Allow a classname to be set to get the right font-size.
      if (className) span.className=className;
      span.style.display='inline';
      span.style.visibility = 'hidden';
      span.style.padding = '0px';
      document.body.appendChild(span);

      var result = _escTag(str); // default to the whole string
      span.innerHTML = result;
      // Check if the string will fit in the allowed width. NOTE: if the width
      // can't be determinated (offsetWidth==0) the whole string will be returned.
      if (span.offsetWidth > width) {
        var posStart = 0, posMid, posEnd = str.length, posLength;
        // Calculate (posEnd - posStart) integer division by 2 and
        // assign it to posLength. Repeat until posLength is zero.
        while (posLength = (posEnd - posStart) >> 1) {
          posMid = posStart + posLength;
          //Get the string from the begining up to posMid;
          span.innerHTML = _escTag(str.substring(0,posMid)) + '&hellip;';

          // Check if the current width is too wide (set new end)
          // or too narrow (set new start)
          if ( span.offsetWidth > width ) posEnd = posMid; else posStart=posMid;
        }

        result = '<abbr title="' +
          str.replace("\"","&quot;") + '">' +
          _escTag(str.substring(0,posStart)) +
          '&hellip;<\/abbr>';
      }
      document.body.removeChild(span);
      return result;
    };
