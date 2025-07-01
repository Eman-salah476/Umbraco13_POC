(function () {
    angular.module("umbraco.directives").component("umbContentViews", {
        template: '<div class="umb-table" ng-if="vm.items"><div class="umb-table-head"><div class="umb-table-row"><div class="umb-table-cell"></div><div class="umb-table-cell umb-table__name"><button type="button" class="umb-table-head__link"><localize key="general_name">Name</localize></button></div><div class="umb-table-cell"></div></div></div><div class="umb-table-body"><div class="umb-table-row" ng-repeat="item in vm.items track by $index" ng-class="{\'-selected\':item.selected, \'-light\':!item.published && item.updater != null}" ng-click="vm.selectItem(item, $index, $event)"><div class="umb-table-cell"></div><div class="umb-table-cell umb-table__name" ng-if="true"><a title="{{item.name}}" class="umb-table-body__link" ng-click="vm.clickItem(item, $event)" ng-bind="item.name"></a></div><div class="umb-table-cell"><button class="btn btn-success " style="margin-right: 10px;" ng-click="vm.clickItem(item, $event)">View Data</button></div></div></div></div>',

        controller: function ViewController() {
            var vm = this;
            vm.clickItem = function (item, $event) {
                !vm.onClick || $event.metaKey || $event.ctrlKey || (vm.onClick({ item: item }), $event.preventDefault()), $event.stopPropagation();
            }
        },
        controllerAs: "vm",
        bindings: { items: "<", itemProperties: "<", allowSelectAll: "<", onSelect: "&", onClick: "&", onActionClick: "&", onSelectAll: "&", onSelectedAll: "&", onSortingDirection: "&", onSort: "&" },
    });


    angular.module('umbraco').controller("TableContentViewsController", ['$http', '$scope', 'notificationsService', function ($http, $scope, notificationsService) {
        var vm = this;
        vm.uiURL = window.AppConfig.FormIODesignerUI;
        vm.APIURL = window.AppConfig.FormIODesignerAPI;
        vm.PAGE_VIEW = '/umbraco#/content/TemplatesContentAlias';
        vm.tableName = null;

        vm.searchResults = { items: null, totalPages: 1 };
        vm.dataLoaded = 0;
        $scope.ItemsCount = 0;
        vm.pageNumber = 1;
        vm.pageSize = 5;


        vm.GetTableNameFromUrl = function () {
            const url = window.location.href;
            const parts = url.split('/ContentViewList/');
            return parts.length > 1 ? parts[1].split('?')[0] : null;
        }

        //Load Data
        vm.LoadViews = function () {

            vm.dataLoaded = 0;
            vm.tableName = vm.GetTableNameFromUrl();
            if (!this.tableName) {
                notificationsService.error("Error", 'Table name is missing in the URL.');
                throw new Error('Table name is missing in the URL.');
            }

            $http.get(`${vm.APIURL}/TableView/GetList?tableName=${vm.tableName}&skip=${(vm.pageNumber - 1) * vm.pageSize}&limit=${vm.pageSize}`).then(function (response) {
                if (response == null) {
                    return;
                }
                var arr = [];
                var result = response.data;
                var data = result.Data;
                $scope.ItemsCount = result.TotalCount;
                var totalPages = Math.ceil($scope.ItemsCount / vm.pageSize);

                if (data && data.length > 0) {
                    var length = data.length, obj, item;

                    for (var i = 0; i < length; i++) {
                        item = data[i];
                        obj = {
                            id: item.Id,
                            name: item.ViewName,
                            viewType: item.ViewType
                        };
                        arr.push(obj);
                    }
                    vm.searchResults = { items: arr, totalPages: totalPages };
                }
                else {
                    vm.searchResults = { items: null, totalPages: 0 };
                }
                vm.dataLoaded = 1;
            }, onerror);
        }

        //On Item Click
        vm.clickItem = function (item) {
            if (item && item.id && vm.tableName) {
                window.location.href = `${vm.PAGE_VIEW}/${item.viewType}/${vm.tableName}?viewId=${item.id}`;
            }
        }

        function onerror(res) {
            vm.dataLoaded = 1;
            console.log(res);
        }

        //Pagination
        vm.next = function () {
            vm.pageNumber++;
            vm.LoadViews();
            scrollTop();
        }

        vm.prev = function () {
            vm.pageNumber--;
            vm.LoadViews();
            scrollTop();
        }

        vm.goToPage = function (page) {
            vm.pageNumber = page;
            vm.LoadViews();
            scrollTop();
        }

        function scrollTop() {
            var obj = $(".umb-table");
            if (obj) {
                var view = obj.closest('.views-wrapper');
                if (view && view.length > 0)
                    view[0].scrollTop = view.offset().top;
            }
        }


        vm.LoadViews();
    }]);


})();