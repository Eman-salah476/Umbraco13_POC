(function () {
    angular.module("umbraco.directives").component("umbViewsTable", {
        template: '<div class="umb-table" ng-if="vm.items"><div class="umb-table-head"><div class="umb-table-row"><div class="umb-table-cell"></div><div class="umb-table-cell umb-table__name"><button type="button" class="umb-table-head__link"><localize key="general_name">Name</localize></button></div><div class="umb-table-cell"></div></div></div><div class="umb-table-body"><div class="umb-table-row" ng-repeat="item in vm.items track by $index" ng-class="{\'-selected\':item.selected, \'-light\':!item.published && item.updater != null}" ng-click="vm.selectItem(item, $index, $event)"><div class="umb-table-cell"></div><div class="umb-table-cell umb-table__name" ng-if="true"><a title="{{item.name}}" class="umb-table-body__link" ng-click="vm.clickItem(item, $event)" ng-bind="item.name"></a></div><div class="umb-table-cell"><button class="btn btn-success " style="margin-right: 10px;" ng-click="vm.clickItem(item, $event)">Edit</button><button class="btn btn-info" ng-click="vm.DeleteItem(item, $event)">Delete</button></div></div></div></div>',

        controller: function ViewController() {
            var vm = this;
            vm.clickItem = function (item, $event) {
                !vm.onClick || $event.metaKey || $event.ctrlKey || (vm.onClick({ item: item }), $event.preventDefault()), $event.stopPropagation();
            }
            vm.DeleteItem = function (item, $event) {
                !vm.onDelete || $event.metaKey || $event.ctrlKey || (vm.onDelete({ item: item }), $event.preventDefault()), $event.stopPropagation();
            }
        },
        controllerAs: "vm",
        bindings: { items: "<", itemProperties: "<", allowSelectAll: "<", onSelect: "&", onClick: "&", onActionClick: "&", onDelete: "&" },
    });


    angular.module('umbraco').controller("TableViewsGridController",
        ['$http', '$scope', 'overlayService', 'notificationsService',
            function ($http, $scope, overlayService, notificationsService) {
                var vm = this;
                vm.uiURL = window.AppConfig.FormIODesignerUI;
                vm.APIURL = window.AppConfig.FormIODesignerAPI;
                vm.PAGE_VIEW = '/umbraco#/surveyBuilder/TemplatesAlias';
                vm.tableName = null;
                vm.searchResults = { items: null, totalPages: 1 };
                vm.dataLoaded = 0;
                $scope.ItemsCount = 0;
                vm.pageNumber = 1;
                vm.pageSize = 10;


                vm.GetTableNameFromUrl = function () {
                    const url = window.location.href;
                    const parts = url.split('/ListView/');
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
                                    name: item.ViewName
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

                vm.CreateView = function () {
                    if (vm.tableName) {
                        window.location.href = `${vm.PAGE_VIEW}/CreateView/${vm.tableName}`;
                    }
                }

                //On Item Click
                vm.clickItem = function (item) {
                    if (item && item.id && vm.tableName) {
                        window.location.href = `${vm.PAGE_VIEW}/EditView/${vm.tableName}?viewId=${item.id}`;
                    }
                }

                vm.DeleteItem = function (item) {
                    if (item && item.id) {
                        var dialog = {
                            title: 'Delete View',
                            content: 'Are you sure you want to delete this view?',
                            close: function () {
                                overlayService.close();
                            },
                            submit: function () {
                                overlayService.close();
                                vm.DeleteView(item.id);
                            },
                            submitButtonLabel: 'Yes',
                            closeButtonLabel: 'No'
                        };

                        overlayService.open(dialog);
                    }
                }

                vm.DeleteView = function (viewId) {

                    $http.delete(`${vm.APIURL}/TableView/Delete/${viewId}`)
                        .then(function (response) {
                            if (response && response.status == 200) {
                                var data = response.data;
                                if (data.Succeeded) {
                                    notificationsService.success("Success", "View deleted successfully");
                                    vm.LoadViews();
                                }
                                else {
                                    notificationsService.error("Error", data?.Message || 'Failed to delete view')
                                }
                            }
                            else {
                                notificationsService.error("Error", 'Failed to delete view')
                            }
                        }, onerror);
                }

                function onerror(res) {
                    vm.dataLoaded = 1;
                    notificationsService.error("Error", 'Fail to complete task');
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