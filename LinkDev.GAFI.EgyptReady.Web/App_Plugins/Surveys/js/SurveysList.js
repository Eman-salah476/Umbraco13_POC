(function () {
    angular.module("umbraco.directives").component("umbFormsTable", {
        template: '<div class="umb-table" ng-if="vm.items"><div class="umb-table-head"><div class="umb-table-row"><div class="umb-table-cell"></div><div class="umb-table-cell umb-table__name"><button type="button" class="umb-table-head__link"><localize key="general_name">Name</localize></button></div><div class="umb-table-cell"></div></div></div><div class="umb-table-body"><div class="umb-table-row" ng-repeat="item in vm.items track by $index" ng-class="{\'-selected\':item.selected, \'-light\':!item.published && item.updater != null}" ng-click="vm.selectItem(item, $index, $event)"><div class="umb-table-cell"></div><div class="umb-table-cell umb-table__name" ng-if="true"><a title="{{item.name}}" class="umb-table-body__link" ng-click="vm.clickItem(item, $event)" ng-bind="item.name"></a></div><div class="umb-table-cell"><button class="btn btn-success " style="margin-right: 10px;" ng-click="vm.clickItem(item, $event)">Edit</button><button style="margin-right: 10px;" class="btn btn-success" ng-click="vm.OverviewRedirect(item, $event)">Responses Overview</button><button class="btn btn-info" ng-click="vm.DeleteItem(item, $event)">Delete</button></div></div></div></div>',

        controller: function TableController() {
            var vm = this;
            vm.clickItem = function (item, $event) {
                !vm.onClick || $event.metaKey || $event.ctrlKey || (vm.onClick({ item: item }), $event.preventDefault()), $event.stopPropagation();
            }
            vm.DeleteItem = function (item, $event) {
                !vm.onDelete || $event.metaKey || $event.ctrlKey || (vm.onDelete({ item: item }), $event.preventDefault()), $event.stopPropagation();
            }
            vm.OverviewRedirect = function (item, $event) {
                !vm.onOverviewRedirect || $event.metaKey || $event.ctrlKey || (vm.onOverviewRedirect({ item: item }), $event.preventDefault()), $event.stopPropagation();
            }
        },
        controllerAs: "vm",
        bindings: { items: "<", itemProperties: "<", allowSelectAll: "<", onSelect: "&", onClick: "&", onActionClick: "&", onDelete: "&", onOverviewRedirect: "&" },
    });


    angular.module('umbraco').controller("FormsGridController",
        ['$http', '$scope', 'overlayService', 'notificationsService',
            function ($http, $scope, overlayService, notificationsService) {
                var vm = this;
                vm.uiURL = window.AppConfig.FormIODesignerUI;
                vm.APIURL = window.AppConfig.FormIODesignerAPI;
                vm.pageNumber = 1;
                vm.pageSize = 10;
                vm.dataLoaded = 0;
                vm.searchResults = { items: null, totalPages: 1 };
                $scope.ItemsCount = 0;


                //Load Data
                vm.LoadForms = function (reload) {

                    vm.dataLoaded = 0;
                    if (reload) {
                        vm.pageNumber = 1;
                    }

                    $http.get(`${vm.APIURL}/Form?skip=${(vm.pageNumber - 1) * vm.pageSize}&limit=${vm.pageSize}`).then(function (response) {
                        var res = response.data;
                        if (res == null) {
                            console.log("No data found for Surveys.");
                            return;
                        }
                        var arr = [];
                        var data = res.Items;

                        $scope.ItemsCount = res.serverCount;
                        var totalPages = Math.ceil($scope.ItemsCount / vm.pageSize);
                        if (data && data.length > 0) {
                            var length = data.length, obj, item;

                            for (var i = 0; i < length; i++) {
                                item = data[i];
                                obj = {
                                    id: item.Id,
                                    name: item.title
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

                //Show IFrame
                vm.showIFrame = function (src = null) {

                    if (src == null) {
                        src = `${vm.uiURL}/#/manager/create`;
                    }

                    const iframeContainer = document.getElementById('iframe-container');

                    const closeIframeButton = document.createElement('button');
                    closeIframeButton.className = 'close-iframe';
                    closeIframeButton.textContent = 'Close';
                    closeIframeButton.addEventListener('click', () => vm.closeIFrame());

                    const iframe = document.createElement('span');
                    iframe.innerHTML = `<iframe src="${src}" frameborder="0" class="iframe"></iframe>`;

                    iframeContainer.appendChild(closeIframeButton);
                    iframeContainer.appendChild(iframe);

                    // Show the container
                    iframeContainer.style.display = 'block';

                    // Add class to body to prevent scrolling
                    document.body.classList.add('iframe-open');
                };

                vm.closeIFrame = function () {
                    const iframeContainer = document.getElementById('iframe-container');
                    iframeContainer.style.display = 'none';
                    iframeContainer.innerHTML = '';
                    document.body.classList.remove('iframe-open');
                    vm.LoadForms(0);
                };


                //On Item Click
                vm.clickItem = function (item) {
                    if (item && item.id) {
                        var src = `${vm.uiURL}/#/manager/${item.id}/edit`;
                        vm.showIFrame(src);
                    }
                }

                vm.DeleteItem = function (item) {
                    if (item && item.id) {
                        var dialog = {
                            title: 'Delete Survey',
                            content: 'Are you sure you want to delete this Survey?',
                            close: function () {
                                overlayService.close();
                            },
                            submit: function () {
                                overlayService.close();
                                vm.DeleteForm(item.id);
                            },
                            submitButtonLabel: 'Yes',
                            closeButtonLabel: 'No'
                        };

                        overlayService.open(dialog);
                    }
                }

                vm.DeleteForm = function (formId) {
                    $http.delete(`${vm.APIURL}/Form/${formId}`)
                        .then(function (response) {
                            if (response && response.status == 200) {
                                notificationsService.success("Success", "Survey deleted successfully");
                                vm.LoadForms(1);
                            }
                            else {
                                notificationsService.error("Error", 'Failed to delete Survey')
                            }
                        }, onerror);
                }

                vm.OverviewRedirect = function (item) {
                    //Redirect to Responses overview Page 
                    console.log("FormId", item.id);
                    window.location.href = `/umbraco#/surveyBuilder/SurveyAlias/ResponsesOverview/${item.id}`;
                }

                //Pagination
                vm.next = function () {
                    vm.pageNumber++;
                    vm.LoadForms(0);
                    scrollTop();
                }

                vm.prev = function () {
                    vm.pageNumber--;
                    vm.LoadForms(0);
                    scrollTop();
                }

                vm.goToPage = function (page) {
                    vm.pageNumber = page;
                    vm.LoadForms(0);
                    scrollTop();
                }

                function onerror(res) {
                    vm.dataLoaded = 1;
                    console.log(res);
                }

                function scrollTop() {
                    var obj = $(".umb-table");
                    if (obj) {
                        var view = obj.closest('.forms-wrapper');
                        if (view && view.length > 0)
                            view[0].scrollTop = view.offset().top;
                    }
                }


                vm.LoadForms(0);
            }]);


})();