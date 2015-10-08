(function () {
    'use strict';
    var controllerId = 'aboutController';
    angular.module('angularstrapControllers', []).controller(controllerId, ["$scope", "$firebaseArray", "$firebaseObject",

        /**
         * Primary entry point for application
         * @param {array} [scope] The global scope for Angular
         * @param {object} [http] Http object (not in use)
         * @param {object} [q] Queing object
         * @param {object} [asyncService] our async service for http calls
         * @param {string} [APIHOST] constant for pointing to REST server
         *
         **/
          function aboutController($scope, $firebaseArray, $firebaseObject) {
            var vm = this;

            function reloadPage() {
                $window.location.reload();
            }
			
			$scope.headerID = window.location.hash.split("#/about/")[1] || "-JxaCSGNlbOGJVQf-XVp";			
			$scope.point = 0;
			$scope.buttonText = "Put the email in text box";
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

			//GET QUESTION HEADER
			var headersArray = $firebaseObject(headerInstance.child($scope.headerID));
			var templateId = "";
			headersArray.$loaded().then(function(result) {
				$scope.Company = result.company;
				$scope.closeDate = result.closeDate;
				$scope.createdBy = result.createdBy;
				$scope.emails = result.emails;
				$scope.openDate = result.openDate;
				getQuestionTemplate(result.templateID);
			});
			
			//GET QUESTION TEMPLATE
			var getQuestionTemplate = function(templateId) {
				$scope.questions = $firebaseArray(questionTemplateInstance.child(templateId + "/questions"));
				$scope.questions.$loaded().then(function(list) {
					list.forEach(function(question) {
						defaultSelection[question.ID] = {};
						question.answers.forEach(function(answer) {
							defaultSelection[question.ID][answer.id] = 0;
						});	
					});
				});
			}

			// GET USER SELECT				
			var $selectionArray = null;				 
			$scope.checkUserEmail = function() {
				$scope.loadingUserInfo = true;
				reactionInstance.orderByChild("companyContactPersonEmail").equalTo($scope.userEmail).once('value', function(data) {					
				    $scope.userSelection = {};		
					if (data.exists()) {
						var answerRef = reactionInstance.child(Object.keys(data.val())[0] + "/answers");
						$selectionArray = $firebaseArray(answerRef);		
						$selectionArray.$loaded().then(function(result) {
							$scope.loadingUserInfo = false;
							angular.forEach(result, function(selection) {
								$scope.userSelection[selection.$id] = selection;		
							});
							$scope.showAnswers = true;
						});
						$scope.userStatus = "Resume Survey";
						$scope.doSurvey = true;
					} else {
						var newUserRef = reactionInstance;
						var reactionList = $firebaseArray(newUserRef);
						reactionList.$loaded().then(function() {
							$scope.newUser = true;
							reactionList.$add({
								answers: defaultSelection,
								company: $scope.userCompany || "FireBase",
								companyContactPersonEmail: $scope.userEmail,
								companyContactPerson: $scope.userName || $scope.userEmail.split("@")[0],
								complete: false,
								headerID: $scope.headerID
							}).then(function(newReaction) {
								$selectionArray = $firebaseArray(newReaction.child("answers"));
							});
							$scope.loadingUserInfo = false;
							$scope.userStatus = "Start New Survey";
							$scope.doSurvey = true;
						});							
					}
				});
			};
			
			$scope.saveAnswer = function(questionID, answerID, point) {
				$scope.errorID = null;
				var choices = $selectionArray.$getRecord(questionID);
				var totalPoints = point;
				for (var key in choices) {
					if (key.indexOf("$") === -1) {
						totalPoints += choices[key];
					}
				}
				if (totalPoints > 3) {
					$scope.errorID = questionID;
					for (var key in choices) {
						if (key.indexOf("$") === -1) {
							choices[key] = 0;
						}
					}
					$scope.userSelection[questionID] = choices;
					$selectionArray.$save(choices);
				} else {
					choices[answerID] = point;
					$selectionArray.$save(choices);
				}
			}
				
			$scope.processSurvey = function() {
				$scope.showQuestions = true;
			}
			
            return vm;
        }
    ]);
})();