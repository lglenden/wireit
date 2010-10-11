/**
 * The filter utility uses timing mechanisms to apply filters quickly after the
 * user types in a text box.  It was taken from WireIt and abstracted out into
 * its own class so that it could be used in other places.
 * 
 * @class FilterUtil
 * @namespace wfeditor.util
 * 
 * @author Laura
 */

/**
 * Constructor.  Sets up options based on parameters that are passed in.
 * 
 * @constructor
 * @param {HTMLElement} filterEl The element that we're using to filter (such as
 * a text box).
 * @param {function} filterFn The function that we should call with the filter
 * value.
 * @param {Object} filterFnScope The scope of the filtering function.
 * @param {Object} options Any additional options.  See properties.
 */
wfeditor.util.FilterUtil = function(filterEl, filterFn, filterFnScope, options) {
    /**
     * The scope for the filter function.
     * 
     * @property {Object} scope
     */
    this.scope = filterFnScope;
    
    /**
     * The filter function.
     * 
     * @property {function} filter
     */
    this.filter = filterFn;
    
    /**
     * The filtering element.
     * 
     * @property {HTMLElement} el
     */
    this.el = filterEl;
    
    options = options || {};
    this.options = {};
    
    /**
     * Timeout option.
     * 
     * @property {int} options.timeout
     */
    this.options.timeout = options.timeout || 500;
};

wfeditor.util.FilterUtil.prototype = {

    /**
     * I don't really know what this function does -- I got it from WireIt.
     * Something with timeouts..
     * 
     * @function inputFilterTime
     */
    inputFilterTimer: function() {
        if(this.inputFilterTimeout) {
            clearTimeout(this.inputFilterTimeout);
            this.inputFilterTimeout = null;
        }
        
        var thatFn = this.filter;
        var that = this.scope;
        var valEl = this.el;
        this.inputFilterTimeout = setTimeout(function() {
            thatFn.call(that, valEl.value);
        }, this.options.timeout);
    }
};
