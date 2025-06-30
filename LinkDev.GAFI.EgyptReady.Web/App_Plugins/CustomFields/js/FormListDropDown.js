angular.module('umbraco').controller("FormListDropDownController", ['$scope', '$http', '$controller', function ($scope, $http, $controller) {
    $scope.APIURL = window.AppConfig.FormIODesignerAPI;
    $scope.Forms = null;


    $scope.LoadForms = function () {
        if ($scope.Forms == null || $scope.Forms.length === 0) {
            $http.get(`${$scope.APIURL}/Form`).then(function (response) {

                if (response.status != 200) {
                    console.log("An error occurred during fetching Forms ");
                    return;
                }

                if (response && response.data) {
                    $scope.Forms = response.data.Items;
                }

            }, function (err) {
                console.log(err);
            }).catch(function (ex) {
                console.log(ex);
            });
        }
    }

    //Initalize
    $scope.LoadForms();

}]);