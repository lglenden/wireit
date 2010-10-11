/**
 * A wrapper around the DWR exposed backend methods.
 * @module DWRAdapter
 */

wfeditor.adapters.DWRAdapter = {
	
	/**
	 * adapter default options
	 * 
	 * @property config
	 */
	config: {
		// ...
	},

	/**
	 * Initialization method called by the WiringEditor
	 * @method init
	 */
	init: function() {
		
	},

	/**
     * This method is used to call the backend's method
     * saveWorkflow.  See the documentation for that method.
     * 
     * @method validateWorkflow
     * @param {Object} workflow to save.
     * @param {Object} callbacks What callbacks to call upon completion of backend work.
     */
	saveWorkflow: function(val, callbacks) {


        function createSaveWorkflowParameter(val){
            var tempSavedWiring = val[0];
            var tempParentSavedWiring = val[1];
            
            var workflowId = tempSavedWiring.workflowId;            

            //create the saveWorkflowParameter
            var saveWorkflowParameter = new SaveWorkflowParameter();
            saveWorkflowParameter.currentWorkflowId = workflowId;
            saveWorkflowParameter.newWorkflow = tempSavedWiring.isNewWorkflow;
            saveWorkflowParameter.moduleCounter = tempSavedWiring.moduleCounter;
            saveWorkflowParameter.workflowOnCanvases = {};

            //create the workflowcanvas object
            var workflowOnCanvas = new WorkflowOnCanvas();
            workflowOnCanvas.workflowName = tempSavedWiring.name;
            workflowOnCanvas.json = tempSavedWiring.working;
            workflowOnCanvas.childModules = {};

            //create the childWorkflowObject
            var modules = tempSavedWiring.workingObj.modules;
            for(var i = 0; i < modules.length; i++) {
                if(modules[i].type == "workflow") {
                    var childModule = new ChildModule();

                    childModule.originalWorkflowId = modules[i].originalWorkflowId;
                    childModule.moduleName = modules[i].name;
                    childModule.moduleType = modules[i].type;
                    childModule.uri = modules[i].url;
                    childModule.parentWorkflowId = workflowId;

                    workflowOnCanvas.childModules[modules[i].uniqueId] = childModule;
                }
            }
            saveWorkflowParameter.workflowOnCanvases[workflowId] = workflowOnCanvas;

            // if it has a parent workflow (propagation)
            if(tempParentSavedWiring.workflowId) {
                //create the workflowcanvas object
                var parentWorkflowOnCanvas = new WorkflowOnCanvas();
                parentWorkflowOnCanvas.json = tempParentSavedWiring.working;
                saveWorkflowParameter.workflowOnCanvases[tempParentSavedWiring.workflowId] = parentWorkflowOnCanvas;
            }

            return saveWorkflowParameter;
        }

        WfFacade.saveWorkflow(createSaveWorkflowParameter(val), handleGetData);

        function handleGetData(str) {
            callbacks.success.call(callbacks.scope, str);
        }

	},
	
	/**
     * This method is used to call the backend's method
     * executeWorkflow.  See the documentation for that method.
     * 
     * @method executeWorkflow
     * @param {Object} workflow to execute.
     * @param {Object} callbacks What callbacks to call upon completion of backend work.
     */
	executeWorkflow: function(val, callbacks) {
		
		function handleGetData(str)
		{
			callbacks.success.call(callbacks.scope, str);
		}
		WfFacade.executeWorkflow(YAHOO.lang.JSON.stringify(val), handleGetData);
	},
	
	/**
     * This method is used to call the backend's method
     * validateWorkflow.  See the documentation for that method.
     * 
     * @method validateWorkflow
     * @param {Object} workflow to validate.
     * @param {Object} callbacks What callbacks to call upon completion of backend work.
     */
	validateWorkflow : function(workflowId, callbacks){
		function handleGetData(str) {
			callbacks.success.call(callbacks.scope, str);
		}
		WfFacade.validateWorkflow(workflowId, handleGetData);
	},

	/**
     * This method is used to call the backend's method
     * deleteWiring.  See the documentation for that method.
     * 
     * @method deleteWiring
     * @param {Object} value to delete.
     * @param {Object} callbacks What callbacks to call upon completion of backend work.
     */
	deleteWiring: function(val, callbacks) {
		function handleGetData(str)
		{
			callbacks.success.call(callbacks.scope, "ok");
		}
		WfFacade.deleteWorkflow(val.workflowId,handleGetData);
	},

	/**
     * This method is used to call the backend's method
     * login.  See the documentation for that method.
     * 
     * @method loadWorkflows
     * @param {Object} the language to which this workflow belongs.
     * @param {Object} callbacks What callbacks to call upon completion of backend work.
     * @return An xml string with list of workflows.
     */
    loadWorkflows: function(language, callbacks) {
        
        function handleGetData( str )
        {
              
            var xmlDoc;
            if (window.DOMParser)
            {
                parser=new DOMParser();
                xmlDoc=parser.parseFromString(str,"text/xml");
            }
            else // Internet Explorer
            {
                xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async="false";
                xmlDoc.loadXML(str);
            }
            var workflows =  xmlDoc.getElementsByTagName("workflow");
            var results = [];
            for(i = 0 ; i < workflows.length; i ++)
            {
                if(window.DOMParser){
                    results.push({
                    uniqueId: workflows[i].getElementsByTagName("uniqueId")[0].textContent,
                    name: workflows[i].getElementsByTagName("name")[0].textContent,
                    working: workflows[i].getElementsByTagName("working")[0].textContent,
                    user: workflows[i].getElementsByTagName("userid")[0].textContent,
                    moduleCounter: workflows[i].getElementsByTagName("modulecounter")[0].textContent,
                    composepermission: workflows[i].getElementsByTagName("composepermission")[0].textContent,
                    executepermission: workflows[i].getElementsByTagName("executepermission")[0].textContent
                  });
                    
                } else {
                    results.push({
                    uniqueId: workflows[i].getElementsByTagName("uniqueId")[0].text,
                    name: workflows[i].getElementsByTagName("name")[0].text,
                    working: workflows[i].getElementsByTagName("working")[0].text,
                    user: workflows[i].getElementsByTagName("userid")[0].text,
                    moduleCounter: workflows[i].getElementsByTagName("modulecounter")[0].text,
                    composepermission: workflows[i].getElementsByTagName("composepermission")[0].text,
                    executepermission: workflows[i].getElementsByTagName("executepermission")[0].text
                  });
                }
            }
            callbacks.success.call(callbacks.scope, results);
        }
        WfFacade.listWorkflows(handleGetData);
    },
	
    /**
     * This method is used to call the backend's method
     * login.  See the documentation for that method.
     * 
     * @method login
     * @param {Object} callbacks What callbacks to call upon completion of backend work.
     * @return Services as json string
     */
    login : function(val, callbacks) {
    	function handleGetData(str) {
            callbacks.success.call(callbacks.scope, str);
        }
        
        WfFacade.login(YAHOO.lang.JSON.stringify(val), handleGetData);
    },
    
    /**
     * This method is used to call the backend's method
     * getServices.  See the documentation for that method.
     * 
     * @method getServices
     * @param {Object} callbacks What callbacks to call upon completion of backend work.
     * @return Services as json string
     */
    getServices : function(callbacks) {
    	function handleGetData(str) {
            callbacks.success.call(callbacks.scope, str);
        }
        WfFacade.getServicesAsJSONString(handleGetData);
    },
    
    /**
     * This method is used to call the backend's method
     * isLoggedIn.  See the documentation for that method.
     * 
     * @method isLoggedIn
     * @param {Object} callbacks What callbacks to call upon completion of backend work.
     * @return boolean true or false depending on whether the user is logged in.
     */
    isLoggedIn : function(callbacks) {
        function handleGetData(val) {
            callbacks.success.call(callbacks.scope, val);
        }
        WfFacade.isLoggedIn(handleGetData);
    },

	/**
     * This method is used to call the backend's method
     * getWorkflowModel.  See the documentation for that method.
     * 
     * @method loadWorkflow
     * @param {Object} strId workflowid.
     * @param {Object} callbacks What callbacks to call upon completion of backend work.
     */
	loadWorkflow : function(strId, callbacks) {
		function handleGetData(strWorkflow) {
			callbacks.success.call(callbacks.scope, strWorkflow);
		}
		WfFacade.getWorkflowModel(strId, handleGetData);
    },
    
    /**
     * This method is used to call the backend's method
     * searchServicesAsJSONString.  See the documentation for that method.
     * 
     * @method searchSearches
     * @param {Object} filterKey See documentation for searchServicesAsJSONString.
     * @param {Object} categorizeKey See documentation for searchServicesAsJSONString.
     * @param {Object} callbacks What callbacks to call upon completion of backend work.
     */
    searchServices : function(filterKey, categorizeKey, callbacks) {
        WfFacade.searchServicesAsJSONString(
            YAHOO.lang.JSON.stringify(filterKey),
            YAHOO.lang.JSON.stringify(categorizeKey),
            function(str) {
            	callbacks.success.call(callbacks.scope, str);
            }
        );
    },
    
    /**
     * This method is used to call the backend's method
     * getReorganizedServicesAsJSONString.  See the documentation for that method.
     * 
     * @method getReorganizedServices
     * @param {Object} categorizeKey See documentation for getReorganizedServicesAsJSONString.
     * @param {Object} callbacks What callbacks to call upon completion of backend work.
     */
     getReorganizedServices : function(filterKey, categorizeKey, callbacks) {
     	WfFacade.filterReorganizeServicesAsJSONString(
            YAHOO.lang.JSON.stringify(filterKey),
            YAHOO.lang.JSON.stringify(categorizeKey),
            function(str) {
                callbacks.success.call(callbacks.scope, str);
            }
        );
     },
     
     /**
      * This method is used to call the analysis plugin facade's method
      * getParameters.  See the documentation for that method.
      * 
      * @method getAnalysisParameters
      * @param {Number} index The index to pass back to the callback.
      * @param {String} url The url of the analysis to get the parameters for.
      * @param {Object} callbacks What callbacks to call upon completion of backend work.
      */
     getAnalysisParameters : function(index, url, callbacks) {
     	AnalysesFacade.getParameters(YAHOO.lang.JSON.stringify({
     		url: url
     	}), function(str) {
     		callbacks.success.call(callbacks.scope, index, eval('(' + str + ')'));
     	}
     	);
     },
     
     /**
      * This method is used to call the analysis plugin facade's method analyze.
      * See the documentation for that method.
      * 
      * @method analyze
      * @param {Object} obj The object to send to the analyze method.
      * @param {Object} callbacks What callbacks to call upon completion of backend work.
      */
     analyze : function(obj, callbacks) {
     	AnalysesFacade.analyze(YAHOO.lang.JSON.stringify(obj), function(res) {
     		callbacks.success.call(callbacks.scope, eval('(' + res + ')'));
     	});
     },
     
     /**
      * This method is used to call the userSetFavorites facade method.
      * See the documentation for that method.
      * 
      * @method userSetFavorites
      * @param {Array} The favorites that have been set.
      */
      userSetFavorites : function(favorites) {
          WfFacade.userSetFavorites(YAHOO.lang.JSON.stringify(favorites));
      },
      
	/**
	 * This method will retrieve the favorites of the current logged user
	 * @method getUserFavorites
	 * @return {String} A Json string with an array of favorites.
	 */
    getUserFavorites : function(callbacks) {
        function handleGetData(result) {
        	var favorites = YAHOO.lang.JSON.parse(result);
            callbacks.success.call(callbacks.scope, favorites);
        }
        
        WfFacade.getUserFavorites(handleGetData);
    },
      
      /**
       * This method is used to call the uiServiceExecuted method on the WfFacade
       * backend class.  See the documentation for that method.
       * 
       * @method uiServiceExecuted
       * @param {Object} values The entered values.
       * @param {Number} contextId The context id that was passed forward by the front-end.
       */
      uiServiceExecuted : function(values, contextId) {
          WfFacade.uiServiceExecuted(YAHOO.lang.JSON.stringify(values), contextId);
      },

      /**
       * This method is used to retrieve the workflow by original workflow id
       * and unique id.
       * 
       * @method getWorkflowByIds
       * @param {Object} ids The list of original/unique id of the workflow.
       * @param {Object} callbacks What callbacks to call upon completion of backend work.
       */
    getWorkflowByIds : function(ids, callbacks){
        function handleGetData(result) {
            var workflow = {
                workflowId: result.uniqueId,
                name: result.name,
                working: YAHOO.lang.JSON.parse(result.json),
                moduleCounter: result.moduleCounter
            };
            callbacks.success.call(callbacks.scope, workflow);
        }
        WfFacade.getWorkflowModel(ids.uniqueId, ids.originalWorkflowId, handleGetData);
    },

      /**
       * This method is used to retrieve the workflow by url.
       * 
       * @method getWorkflowByURL
       * @param {Object} arg The url of the workflow.
       * @param {Object} callbacks What callbacks to call upon completion of backend work.
       */
    getWorkflowByURL : function(arg, callbacks){
        function handleGetData(result) {
            var workflow = {
                workflowId: result.uniqueId,
                name: result.name,
                working: YAHOO.lang.JSON.parse(result.json),
                moduleCounter: result.moduleCounter
            };
            callbacks.success.call(callbacks.scope, workflow);
        }
        WfFacade.getWorkflowModelByURL(arg.url, handleGetData);
    },
    
    /**
     * This method calls the WfFacade.createNewData method on the backend.
     * 
     * @method createNewData
     * @param {String} The String form of the JSON object.
     * @param {Object} The callbacks.
     */
    createNewData : function(str, callbacks) {
    	function handleResult(result) {
    		callbacks.success.call(callbacks.scope, result);
    	}
    	WfFacade.createNewData(str, handleResult);
    }

	// + private methods or properties
};


