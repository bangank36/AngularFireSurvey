(function () {
    'use strict';

    angular.module('angularstrapApp')
        .controller('homeController', homeController);

    homeController.$inject = ["$scope", "$location", "$q" ,"$firebaseArray", "$firebaseObject"];

    function homeController($scope, $location, $q, $firebaseArray, $firebaseObject) {

            var vm = this;

            var defaultSelection = {};
			//CREATE A FIREBASE REFERENCE
			var rootInstance = new Firebase("https://fiery-heat-7231.firebaseio.com");
			//GET HEADER INFO
			var headerInstance = rootInstance.child("SurveyHeader");
			//GET REACTION INFO
			var reactionInstance = rootInstance.child("SurveyReactions");							
			//GET REACTION INFO
			var questionTemplateInstance = rootInstance.child("SurveyTemplate");

			// RETRIEVE THE HEADERS DATA FROM FIREBASE
			$scope.headersArray = [];
			$firebaseArray(headerInstance).$loaded().then(function(headerData) {
				headerData.forEach(function(header, index) {
					console.log(header);
					var duplicate = false;
					var duplicateIndex = -1;	
					var insertIndex = -1;
					$scope.headersArray.filter(function(value, index) {
						duplicate = value.company  === header.company; 
						duplicateIndex = index;
					});
					 // GROUP ALL HEADERS BELONG TO SAME COMPANY NAME
					if (!duplicate) {
						$scope.headersArray.push({company: header.company, group: []});
						insertIndex = $scope.headersArray.length - 1;
					} else {
						insertIndex = duplicateIndex;
					}
					// GET THE TEMPLATE KIND VIA TEMPLATEID
					var promiseGetKind = $firebaseObject(questionTemplateInstance.child(header.templateID)).$loaded().then(function(question) {
						header.kind = question.nameSurvey;
						
					});	
					// COUNT THE COMPLETE/INPROGRESS SURVEY
					var promiseCountSurvey = reactionInstance.orderByChild("headerID").equalTo(header.$id).once('value', function(data) {
						// data is an object with matched headerID
						if (data.exists()) {
							var reactions = Object.keys(data.val());
							// iterate over matched headerID
							reactions.forEach(function(id) {
								if (data.val()[id].complete) {
									header.complete = header.complete ? header.complete + 1 : 1;
								} else {
									header.inprogress = header.inprogress ? header.inprogress + 1 : 1;
								}
							});							
						}						
					});
					$q.all([promiseGetKind, promiseCountSurvey]).then(function() {
						// use insertIndex to select header position in array
						$scope.headersArray[insertIndex].group.push(header);
					});					
				});
			});
			
			$scope.redirectToDetail = function(headerID) {
				$location.path("report/" + headerID);
			}
						
            return vm;
       }
})();