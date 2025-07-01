(function () {
    angular.module("umbraco.directives").component("umbContentTableView", {
        template: '<div id="data-table" class="umb-table" ng-if="vm.items"><div class="umb-table-head" style="color: #1b264f"><div class="umb-table-row"><div class="umb-table-cell"></div><div class="umb-table-cell" ng-repeat="column in vm.itemProperties"><span ng-bind="column"></span></div></div></div><div class="umb-table-body"><div class="umb-table-row umb-outline" ng-repeat="item in vm.items track by $index" ><div class="umb-table-cell"></div><div class="umb-table-cell" ng-repeat="column in vm.itemProperties"><span title="{{column}}: {{item[column]}}"><div>{{item[column]}}</div></span></div></div></div></div>',

        controller: function ViewController() {
            var vm = this;
        },
        controllerAs: "vm",
        bindings: { items: "<", itemProperties: "<", allowSelectAll: "<", onSelect: "&", onClick: "&", onActionClick: "&", onSelectAll: "&", onSelectedAll: "&", onSortingDirection: "&", onSort: "&" },
    });


    angular.module('umbraco').controller("TableListViewController", ['$http', '$scope', 'notificationsService', function ($http, $scope, notificationsService) {
        var vm = this;
        vm.uiURL = window.AppConfig.FormIODesignerUI;
        vm.APIURL = window.AppConfig.FormIODesignerAPI;
        vm.tableName = null;
        vm.ViewId = null;
        $scope.toDate = null;
        $scope.fromDate = null;
        vm.searchResults = { items: null, keys: null, totalPages: 1 };
        vm.dataLoaded = 0;
        $scope.DateInvalid = false;
        $scope.datePickerSingle = {
            view: "datepicker",
            config: {
                pickDate: true,
                pickTime: false,
                pick12HourFormat: false,
                format: "D MMM YYYY"
            }
        };
        vm.formsList = [];
        $scope.formId = null;
        vm.pageNumber = 1;
        vm.pageSize = 10;
        $scope.CanExport = true;

        vm.GetQueryParam = function (name) {
            const queryString = window.location.hash.split("?")[1];
            return queryString ? new URLSearchParams(queryString).get(name) : null;
        }

        vm.GetTableNameFromUrl = function () {
            const url = window.location.href;
            const parts = url.split('/Table/');
            return parts.length > 1 ? parts[1].split('?')[0] : null;
        }

        //Load Data
        vm.LoadData = function (reload) {

            vm.dataLoaded = 0;
            if (reload) {
                vm.pageNumber = 1;
            }

            if (!$scope.DateInvalid) {
                vm.ViewId = vm.GetQueryParam('viewId');

                let searchObj = vm.GetSearchFilter();

                $http.post(`${vm.APIURL}/TableView/Data/${vm.tableName}`, searchObj).then(function (response) {
                    if (response == null) {
                        return;
                    }
                    var result = response.data;
                    if (result) {
                        var totalPages = Math.ceil(result.TotalCount / vm.pageSize);
                        var data = result.Data;
                        if (data && data.length > 0) {

                            const dataKeys = Object.keys(data[0]).filter(key => key !== 'Id');
                            vm.searchResults = { items: data, keys: dataKeys, totalPages: totalPages };
                            $scope.CanExport = true;
                        }
                        else {
                            vm.searchResults = { items: null, keys: null, totalPages: 0 };
                            $scope.CanExport = false;
                        }
                    }
                    else {
                        vm.searchResults = { items: null, keys: null, totalPages: 0 };
                        $scope.CanExport = false;
                    }
                    vm.dataLoaded = 1;
                }, onerror);
            }
        }

        vm.LoadForms = function () {
            vm.tableName = vm.GetTableNameFromUrl();
            if (!this.tableName) {
                notificationsService.error("Error", 'Table name is missing in the URL.');
                throw new Error('Table name is missing in the URL.');
            }

            $http.get(`${vm.APIURL}/Form/table/${vm.tableName}`).then(function (response) {
                if (response == null) {
                    return;
                }
                var data = response.data;

                if (data) {
                    $scope.formsList = data;
                }
                vm.LoadData();
            }, onerror);
        }

        vm.GetSearchFilter = function () {
            let searchObj = {
                viewId: vm.ViewId,
                fromDate: $scope.fromDate,
                toDate: $scope.toDate,
                formId: $scope.formId,
                limit: vm.pageSize,
                skip: (vm.pageNumber - 1) * vm.pageSize
            }
            return searchObj;
        }

        vm.Clear = function () {
            $scope.formId = null;
            $scope.fromDate = null;
            $scope.toDate = null;
            $scope.DateInvalid = false;
            vm.ClearDate("fromDate");
            vm.ClearDate("toDate");
            vm.LoadData();
        }

        vm.ClearDate = function (date) {
            $scope[date] = null;
            let currentFlatpickrInstance = document.querySelector("#" + date + " .flatpickr-input")._flatpickr;
            currentFlatpickrInstance.setDate(null);
            $scope.DateInvalid = false;
        }

        $scope.dateFromPickerChange = function (selectedDates, dateStr, instance) {
            $scope.fromDate = dateStr;
            $scope.ValidateDate();
        }

        $scope.dateToPickerChange = function (selectedDates, dateStr, instance) {
            $scope.toDate = dateStr;
            $scope.ValidateDate();
        }

        $scope.ValidateDate = function () {
            $scope.DateInvalid = $scope.fromDate && $scope.toDate && new Date($scope.fromDate) > new Date($scope.toDate);

        }

        function onerror(res) {
            vm.dataLoaded = 1;
            console.log(res);
        }

        //Pagination
        vm.next = function () {
            vm.pageNumber++;
            vm.LoadData();
            scrollTop();
        }

        vm.prev = function () {
            vm.pageNumber--;
            vm.LoadData();
            scrollTop();
        }

        vm.goToPage = function (page) {
            vm.pageNumber = page;
            vm.LoadData();
            scrollTop();
        }

        function scrollTop() {
            var obj = $(".umb-table");
            if (obj) {
                var view = obj.closest('.table-wrapper');
                if (view && view.length > 0)
                    view[0].scrollTop = view.offset().top;
            }
        }


        vm.GeneratePDF = function () {
            if (vm.searchResults && vm.searchResults.keys && vm.searchResults.items) {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();

                const headers = ['#', ...vm.searchResults.keys];

                // Prepare data rows
                const data = vm.searchResults.items.map((item, index) => {
                    const row = [index + 1];
                    vm.searchResults.keys.forEach(key => {
                        row.push(item[key] || '');
                    });
                    return row;
                });

                // Add table to PDF
                doc.autoTable({
                    head: [headers],
                    body: data,
                    styles: {
                        fontSize: 8,
                        cellPadding: 2,
                        overflow: 'linebreak'
                    },
                    margin: { top: 10 }
                });

                doc.save(vm.tableName + '_data.pdf');
            }

        }

        vm.GenerateExcel = function () {
            if (vm.searchResults && vm.searchResults.keys && vm.searchResults.items) {

                // Prepare header row
                const headers = ['#', ...vm.searchResults.keys];

                // Prepare data rows
                const data = vm.searchResults.items.map((item, index) => {
                    const row = [index + 1];
                    vm.searchResults.keys.forEach(key => {
                        row.push(item[key] || '');
                    });
                    return row;
                });

                // Create worksheet
                const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

                // Create workbook
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

                // Generate and download Excel file
                XLSX.writeFile(wb, vm.tableName + '_data.xlsx');
            }
        }


        vm.LoadForms();
    }]);


})();