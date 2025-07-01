(function () {

    angular.module('umbraco').controller("OverviewController",
        ['$http', '$scope', 'notificationsService', 'overlayService', 'navigationService',
            function ($http, $scope, notificationsService, overlayService, navigationService) {
                var vm = this;
                vm.APIURL = window.AppConfig.FormIODesignerAPI;
                vm.surveyId = null;


                vm.GetSurveyIdFromUrl = function () {
                    const url = window.location.href;
                    const parts = url.split('/ResponsesOverview/');
                    return parts.length > 1 ? parts[1].split('?')[0] : null;
                }

                vm.GetProcessedData = function () {

                    vm.surveyId = vm.GetSurveyIdFromUrl();
                    if (!vm.surveyId) {
                        notificationsService.error("Error", 'Survey Id is missing in the URL.');
                    }
                    console.log(vm.surveyId);
                    $http.get(`${vm.APIURL}/SubmissionsOverview/GetOverview/${vm.surveyId}`).then(function (response) {
                        if (response && response.status == 200) {
                            let data = response.data;
                            if (data) {
                                //Draw the charts
                            }
                        }
                    }, function (error) {
                        console.error('Error:', error);
                        notificationsService.error("Error", 'Failed to load data')
                    });

                }




                //Initialize
                vm.GetProcessedData();

            }]);


})();