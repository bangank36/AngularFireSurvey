(function () {
    'use strict';

    angular.module('angularstrapApp')
        .controller('homeController', homeController);

    homeController.$inject = ["$scope", "$firebaseArray", "$firebaseObject"];

    function homeController($scope, $firebaseArray, $firebaseObject) {

            var vm = this;

            var defaultSelection = {};
			//CREATE A FIREBASE REFERENCE
			var rootInstance = new Firebase("https://fiery-heat-7231.firebaseio.com");
			//GET HEADER INFO
			var headerInstance = rootInstance.child("SurveyHeader");
			//GET REACTION INFO
			var reactionInstance = rootInstance.child("SurveyReactions");
			var userReaction = reactionInstance.child("TPP");								
			//GET REACTION INFO
			var questionTemplateInstance = rootInstance.child("SurveyTemplate");
			var questionList = questionTemplateInstance.child("TPP/questions");

			// RETRIEVE THE HEADERS DATA FROM FIREBASE
			$scope.headersArray = [];
			$firebaseArray(headerInstance).$loaded().then(function(headerData) {
				headerData.forEach(function(header) {
					console.log(header);
					var duplicate = false;
					var duplicateIndex = -1;
					$scope.headersArray.filter(function(value, index) {
						duplicate = value.company  === header.company; 
						duplicateIndex = index;
					});
					// GROUP ALL HEADERS BELONG TO SAME COMPANY NAME
					if (!duplicate) {
						$scope.headersArray.push({company: header.company, group: [header]});
					} else {
						$scope.headersArray[duplicateIndex].group.push(header);
					}
				});
			});
			
			
            return vm;
       }
})();