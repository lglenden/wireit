/**
 * This class will contain the customization that team FACEO5 needs on the Group class provided by
 * WireIt.
 * 
 * @class GroupExt
 * @extends inputEx.Group
 * 
 * @author Hector
 */

(function() {

/**
 * A reference used in the class to avoid using the entire YAHOO.lang.
 */
var lang = YAHOO.lang;

/**
 * Constructor.  Calls the parent class constructor and then builds the object.
 * 
 * @constructor
 * @param {Object} options Options for constructing the service. 
 */
GroupExt = function(options) {
	// We call the parent constructor.
   GroupExt.superclass.constructor.call(this,options);
};

lang.extend(GroupExt, inputEx.Group, 
/**
 * @scope inputEx.Group.prototype   
 */   
{
   /**
    * This method will set the call back service reference. This represents the service that is
    * related to this group. Basically a group is an set of HTML form fields.
    * 
    * @method setCallBackService
    * @param {Object} objService The service reference to call back.
	*/
   setCallBackService: function(objService) {
		/**
		 * This new variable will be a reference to the Service(.js) that call the
		 * construction of this Group.
		 * 
		 * @property objCall
		 * @type {inputEx.ContainerExt} The service that is associated with this Group
		 */
       this.objCall = objService;
   },

   /**
    * This method gets called when one of the group subfields is updated.
    * 
    * @method onChange
    * @param {String} eventName Event name, this is a required parameter for this callback function.
    * @param {Array} args Array of [fieldValue, fieldInstance] This array represents a the set of
    * field modified (args[1]) and value set (args[0]).
    */
   onChange: function(eventName, args) {
      // Run interactions
      var fieldValue = args[0];
      var fieldInstance = args[1];
      this.runInteractions(fieldInstance,fieldValue);
	  if (this.objCall) this.objCall.fieldUpdate(args);
      
      this.fireUpdatedEvt();
   },

   /**
    * This method will handle the event when the group collapse state changes. This method will call
    * the service associated to this form to handle the resizing of the service.
    * 
    * @method toggleCollapse
    */
   toggleCollapse: function() {
	  // If it's expanded then we are going to collapse
      if(YAHOO.util.Dom.hasClass(this.fieldset, 'inputEx-Expanded')) {
         YAHOO.util.Dom.replaceClass(this.fieldset, 'inputEx-Expanded', 'inputEx-Collapsed');
      }
      else {
         YAHOO.util.Dom.replaceClass(this.fieldset, 'inputEx-Collapsed','inputEx-Expanded');
      }
	 this.objCall.resizeMe();
   }

});

})();
