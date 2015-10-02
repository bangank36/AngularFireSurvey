(function () {
    'use strict';

    angular.module('angularstrapApp')
        .controller('reportController', reportController);

    reportController.$inject = ["$scope", "$q" ,"$firebaseArray", "$firebaseObject"];

    function reportController($scope, $q, $firebaseArray, $firebaseObject) {

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

			var headerID = "-JxaCSGNlbOGJVQf-XVp";
			reactionInstance.orderByChild("headerID").equalTo(headerID).once('value', function(data) {
				console.log(data.val());
			});					
			questionTemplateInstance.orderByChild("headerID").equalTo(headerID).once('value', function(data) {
				console.log(data.val());
			});	
			
            return vm;
       }
})();