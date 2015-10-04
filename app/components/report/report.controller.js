(function () {
    'use strict';

    angular.module('angularstrapApp')
        .controller('reportController', reportController);

    reportController.$inject = ["$scope", "$q" ,"$firebaseArray", "$firebaseObject"];

    function reportController($scope, $q, $firebaseArray, $firebaseObject) {

            var vm = this; 
			$scope.reportInfo = [];
			$scope.cultureSummary = {};
			$scope.questionTheme = {};
			$scope.questionThemeTableData = {};

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
								
			questionTemplateInstance.orderByChild("headerID").equalTo(headerID).once('value', function(data) {
				var reportInfoTemplate  = {
					responder: "",
					company: "",
					date: "",
					question: "",
					questionTitle: "",
					questionSubject: "",
					questionTheme: "",
					answer: "",
					answerTitle: "",
					answerCulture: "",
					answerResult: ""
				};
				var reportInfoList = [];
				var questionTemplate = data.val()[Object.keys(data.val())[0]];
				questionTemplate.questions.forEach(function(question, index) {
					var reportInfoRow = angular.copy(reportInfoTemplate);
					reportInfoRow.question = index + 1;
					reportInfoRow.questionID = question.ID; // TODO: make the ID field consistent
					reportInfoRow.questionTitle = question.titleEN;
					reportInfoRow.questionSubject = question.subject;
					reportInfoRow.questionTheme = question.theme;
					// Iterate over answers
					question.answers.forEach(function(answer, index) {
						var reportInfoRowWithAnswer = angular.copy(reportInfoRow);
						reportInfoRowWithAnswer.answer = index + 1;
						reportInfoRowWithAnswer.answerID = answer.id; // TODO: make the ID field consistent
						reportInfoRowWithAnswer.answerTitle = answer.titleEN;
						reportInfoRowWithAnswer.answerCulture = answer.culture;
						// Put the row into array
						reportInfoList.push(reportInfoRowWithAnswer);
					});
				});
				var combinedReportList = []
				// Combine with reactions
				reactionInstance.orderByChild("headerID").equalTo(headerID).once('value', function(data) {
					var reactionsList = Object.keys(data.val());
					reactionsList.forEach(function(key) {
						var reaction = data.val()[key];
						var copyReportInfoList = angular.copy(reportInfoList);
						copyReportInfoList.forEach(function(infoRow) {
							infoRow.responder = reaction.companyContactPerson; // TODO: may need changed later
							infoRow.date = reaction.date;
							infoRow.company = reaction.company;
							// Combine the rows list to object answer, access by question and answer id
							infoRow.answerResult = reaction.answers[infoRow.questionID][infoRow.answerID];
						});
						combinedReportList = combinedReportList.concat(copyReportInfoList);
					});
					$scope.reportInfo = combinedReportList;
					getCultureSummary();
					getQuestionTheme();
					$scope.$apply();
				});
				function getCultureSummary() {
					var cultureSummary = {
						"proactive": 0,
						"reactive": 0,
						"active": 0
					};
					$scope.reportInfo.forEach(function(info) {
						var culture = info.answerCulture;
						cultureSummary[culture] = cultureSummary[culture] + info.answerResult;
					});
					$scope.cultureSummary = cultureSummary;
					getPieChartData();
					$scope.$apply(); 
				};
				function getQuestionTheme() {
					var questionThemeTemplate = {
						"theme": "",
						"subject": {}						
					}
					var questionThemeArray = [];
					$scope.reportInfo.forEach(function(info) {
						// Copy template structure
						var questionTheme = null;
						var questionThemeIndex = -1;
						// Use theme name as property name
						questionThemeArray.filter(function(data, index) {
							if (data.theme === info.questionTheme) {
								questionTheme = data;
								questionThemeIndex = index;
								return;
							}
						});
						if (!questionTheme) {
							questionTheme = angular.copy(questionThemeTemplate);
							questionTheme.theme = info.questionTheme;
						}
						// If the questionTheme doesn't have subjet yet, make it object
						if (!questionTheme.subject[info.questionSubject]) {
							questionTheme.subject[info.questionSubject] = {};
						} 
						// Sum all answer culture, if not exist, set value to 0
						if (!(questionTheme.subject[info.questionSubject] && questionTheme.subject[info.questionSubject].hasOwnProperty(info.answerCulture))) {
							questionTheme.subject[info.questionSubject][info.answerCulture] = 0; 						
						} 
						questionTheme.subject[info.questionSubject][info.answerCulture] += info.answerResult; 
						// Add theme data to array
						if (questionThemeIndex !== -1) {
							questionThemeArray[questionThemeIndex] = questionTheme;
						} else {
							questionThemeArray.push(questionTheme);
						}						
					});
					$scope.questionTheme = questionThemeArray;
					$scope.questionThemeTableData = transformQuestionThemeTableData();
					getBarChartData();
					$scope.$apply();
				};
				// Combine data to merge nested object into array
				function transformQuestionThemeTableData() {
					var tableData = [];
					$scope.questionTheme.forEach(function(themeData, index) {
						for (var subjectKey in themeData.subject) {
							var subjectData = themeData.subject[subjectKey];
							subjectData.theme = themeData.theme;
							subjectData.subject = subjectKey;
							tableData.push(subjectData);
						}
					});
					return tableData;
				}
				// Get data and set up for pie chart
				function getPieChartData() {
					$scope.pieChartCulture = [];
					for (var key in $scope.cultureSummary) {
						var pie = {
							key: key,
							y: $scope.cultureSummary[key]
						}	
						$scope.pieChartCulture.push(pie);						
					}					
					$scope.xFunction = function(){
						return function(d) {
							return d.key;
						};
					}
					$scope.yFunction = function(){
						return function(d) {
							return d.y;
						};
					}
					$scope.$apply();
				}
				// Get data and set up for multi horizontal bar chart
				function getBarChartData() {
					// Group code name to display on chart
					var themeGroupName = {"goals": "G", "organization": "O", "leadership": "L", "emotional affection": "E"};
					$scope.options = {
						chart: {
							type: 'multiBarHorizontalChart',
							width: 700,
							height: 450,
							x: function(d){return d.label;},
							y: function(d){return d.value;},
							showControls: true,
							showValues: true,
							transitionDuration: 500,
							xAxis: {
								showMaxMin: false
							},
							yAxis: {
								axisLabel: 'Values',
								tickFormat: function(d){
									return d3.format(',.2f')(d);
								}
							}
						}
					};
					// Set bar chart initilize data 
					var barChartData = [
						{
							"key": "Reactive", 
							"color": "#4f81bd",
							"values": []
						},
						{
							"key": "Proactive", 
							"color": "#819b4b",
							"values": []
						},
						{
							"key": "Active", 
							"color": "#c0504d",
							"values": []
						}					
					];
					// Iterate over questionThemeTableData to add additional data
					barChartData.forEach(function(chartValue) {
						// Culture name to get value
						var culture = chartValue.key.toLowerCase();
						$scope.questionThemeTableData.forEach(function(groupData) {
							// Get the code name of group plus subject to get "O - feeling"
							var labelTheme = themeGroupName[groupData.theme] + " - " + groupData.subject.toLowerCase();
							var chartData = {
								label: labelTheme,
								value: groupData[culture]
							}
							chartValue.values.push(chartData);
						});
					});
					$scope.barChartData = barChartData;
					$scope.$apply();					
				}							
			});					       
            return vm;
       }
})();