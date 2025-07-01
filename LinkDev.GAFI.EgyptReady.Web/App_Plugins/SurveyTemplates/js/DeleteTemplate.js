(function () {

    angular.module('umbraco').controller("DeleteTableController",
        ['$http', '$scope', 'notificationsService', 'navigationService', 'treeService', '$location',
            function ($http, $scope, notificationsService, navigationService, treeService, $location) {
                var vm = this;
                vm.APIURL = window.AppConfig.FormIODesignerAPI;


                $scope.performDelete = function () {

                    if (!$scope.currentNode.id) return;

                    $scope.deleting = true; // Set loading state

                    $http.delete(`${vm.APIURL}/Query/Delete/${$scope.currentNode.id}`)
                        .then(function (response) {

                            $scope.deleting = false;

                            if (response && response.status == 200) {
                                var data = response.data;
                                if (data.Succeeded) {
                                    notificationsService.success("Success", "Template deleted successfully");

                                    treeService.removeNode($scope.currentNode);

                                    $location.path('/surveyBuilder/SurveyTemplatesAlias/Templates');
                                }
                                else {
                                    notificationsService.error("Error", data?.Message || 'Failed to delete Template')
                                }
                            }
                            else {
                                notificationsService.error("Error", 'Failed to delete Template')
                            }
                        })
                        .catch(function (error) {
                            $scope.deleting = false;
                            notificationsService.error("Error", 'Failed to delete Template');
                            console.log(error);
                        })
                        .finally(function () {
                            navigationService.hideDialog();
                        });
                }

                $scope.cancel = function () {
                    navigationService.hideDialog();
                }


            }]);


})();