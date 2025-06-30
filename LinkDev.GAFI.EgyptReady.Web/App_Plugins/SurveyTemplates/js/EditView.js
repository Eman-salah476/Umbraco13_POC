(function () {

    angular.module('umbraco').controller("EditViewGridController", ['$http', '$scope', 'overlayService', 'notificationsService',
        function ($http, $scope, overlayService, notificationsService) {
            var vm = this;
            vm.uiURL = window.AppConfig.FormIODesignerUI;
            vm.APIURL = window.AppConfig.FormIODesignerAPI;
            vm.tableName = null;
            $scope.viewName = null;
            $scope.viewType = null;
            vm.ViewId = null;
            $scope.selectedColumns = null;
            $scope.sortingContainer = null;
            $scope.columnList = [];


            vm.GetTableNameFromUrl = function () {
                const url = window.location.href;
                const parts = url.split('/EditView/');
                return parts.length > 1 ? parts[1].split('?')[0] : null;
            }

            vm.GetQueryParam = function (name) {
                const queryString = window.location.hash.split("?")[1];
                return (queryString) ? new URLSearchParams(queryString).get(name) : null;
            }

            vm.FetchTableColumns = function () {
                $scope.selectedColumns = document.getElementById("selectedColumns");
                $scope.sortingContainer = document.getElementById('sortingContainer');
                vm.ViewId = vm.GetQueryParam('viewId');

                vm.tableName = vm.GetTableNameFromUrl();
                if (!vm.tableName) {
                    notificationsService.error("Error", 'Table name is missing in the URL.');
                    throw new Error('Table name is missing in the URL.');
                }

                vm.FetchTableSchema();
                vm.FetchCalculatedColumns();

            }

            vm.FetchTableSchema = function () {

                $http.get(`${vm.APIURL}/Query/GetTableSchema?tableName=${vm.tableName}`).then(function (response) {
                    if (response == null) {
                        return;
                    }
                    var data = response.data;

                    if (data && data.schema) {
                        let treeView = document.getElementById("treeView");
                        treeView.appendChild(vm.CreateTree(data.schema));
                    }

                }, (error) => onerror(error));
            }

            vm.FetchCalculatedColumns = function () {

                $http.get(`${vm.APIURL}/Query/Columns?tableName=${vm.tableName}`).then(function (response) {
                    if (response == null) {
                        return;
                    }
                    var columns = response.data;

                    if (columns && columns.length > 0) {
                        $scope.columnList = columns;
                    }
                    if (vm.ViewId) {
                        vm.FetchView();
                    }

                }, (error) => onerror(error));
            }

            vm.FetchView = function () {
                $http.get(`${vm.APIURL}/TableView/Get?viewId=${vm.ViewId}`).then(function (response) {
                    if (response == null) {
                        return;
                    }
                    var data = response.data;

                    if (data && data.Settings) {
                        const settings = JSON.parse(data.Settings);
                        const { columnsDisplayed, sortingCriteria } = settings;

                        $scope.viewName = data.ViewName;
                        $scope.viewType = data.ViewType;

                        columnsDisplayed?.forEach(column => {
                            vm.MoveToSelected(column.Value, column.Key);
                        });
                        sortingCriteria?.forEach(criteria => {
                            vm.BindSortOptions(criteria.Column, criteria.Direction);
                        });
                    }


                }, (error) => onerror(error));
            }

            vm.CreateTree = function (data, parent = "") {
                const ul = document.createElement("ul");

                for (const key in data) {
                    const li = document.createElement("li");
                    const fullPath = parent ? `${parent}.${key}` : key;
                    li.textContent = key;
                    li.dataset.value = fullPath;
                    if (typeof data[key] === "object") {
                        li.appendChild(vm.CreateTree(data[key], fullPath));
                    }
                    li.addEventListener("click", (event) => {
                        vm.showColumnNamePrompt(li);
                    });
                    ul.appendChild(li);
                }
                return ul;
            }

            vm.showColumnNamePrompt = function (li) {
                var dialog = {
                    title: 'Enter Column Display Name',
                    view: '/App_Plugins/SurveyTemplates/views/prompt.html',
                    value: li.dataset.value,
                    close: function () {
                        overlayService.close();
                    },
                    submit: function (model) {
                        if (model && model.value) {
                            vm.MoveToSelected(li.dataset.value, model.value);
                        }
                        overlayService.close();
                    },
                    submitButtonLabel: 'Ok',
                    closeButtonLabel: 'Cancel'
                };

                overlayService.open(dialog);
            };

            vm.MoveToSelected = function (value, nameToShow = null) {
                if ($scope.selectedColumns && ![...$scope.selectedColumns.children].some(li => li.dataset.value === value)) {
                    const li = document.createElement("li");
                    li.textContent = nameToShow || value;
                    li.dataset.value = value;
                    li.addEventListener("click", () => $scope.selectedColumns.removeChild(li));
                    $scope.selectedColumns.appendChild(li);
                } else {
                    notificationsService.warning("Warning", "This item is already selected!");
                }
            }

            vm.AddSortingOption = function () {
                var dialog = {
                    title: 'Add Sorting Option',
                    view: '/App_Plugins/SurveyTemplates/views/sortOptions.html',
                    value: {
                        column: null,
                        direction: 'Asc',
                        columnList: $scope.columnList
                    },
                    submitButtonLabel: 'Save',
                    closeButtonLabel: 'Cancel',
                    close: function () {
                        overlayService.close();
                    },
                    submit: function (model) {
                        if (model && model.value.column) {
                            vm.BindSortOptions(model.value.column, model.value.direction);
                        }
                        overlayService.close();
                    }
                };

                overlayService.open(dialog);
            }

            vm.BindSortOptions = function (column, direction) {
                // Create the sorting option element
                const div = document.createElement('div');
                div.classList.add('sort-option');
                div.dataset.column = column;
                div.dataset.direction = direction;

                const sortDisplay = document.createElement('span');
                sortDisplay.className = 'sort-display';
                sortDisplay.textContent = `${column} (${direction})`;
                sortDisplay.addEventListener('click', () => vm.EditSortingOption(div));
                div.appendChild(sortDisplay);

                //Remove Button
                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remove';
                removeButton.className = 'btn btn-small umb-button__button btn-danger umb-button-- umb-outline';
                removeButton.onclick = () => $scope.sortingContainer.removeChild(div);
                div.appendChild(removeButton);
                // Add to container
                $scope.sortingContainer.appendChild(div);
            }

            vm.EditSortingOption = function (div) {
                var dialog = {
                    title: 'Edit Sorting Option',
                    view: '/App_Plugins/SurveyTemplates/views/sortOptions.html',
                    value: {
                        column: div.dataset.column,
                        direction: div.dataset.direction,
                        columnList: $scope.columnList
                    },
                    submitButtonLabel: 'Save',
                    closeButtonLabel: 'Cancel',
                    close: function () {
                        overlayService.close();
                    },
                    submit: function (model) {
                        if (model && model.value.column) {
                            div.dataset.column = model.value.column;
                            div.dataset.direction = model.value.direction;
                            div.querySelector('.sort-display').textContent =
                                `${model.value.column} (${model.value.direction})`;
                        }
                        overlayService.close();
                    }
                };
                overlayService.open(dialog);
            }

            vm.SaveView = function () {
                if (!$scope.EditViewForm || !$scope.EditViewForm.$valid) {
                    $scope.EditViewForm.viewName.$setTouched();
                    $scope.EditViewForm.viewType.$setTouched();
                    return;
                }

                const tableView = vm.CollectTableView();

                if (tableView) {
                    $http.post(`${vm.APIURL}/TableView/Update`, tableView).then(function (response) {
                        if (response && response.status == 200) {
                            notificationsService.success("Success", "Data saved successfully");
                        }
                        else {
                            notificationsService.error("Error", 'Failed to save data')
                        }
                    }, function (error) {
                        console.error('Error:', error);
                        notificationsService.error("Error", 'Failed to save data')
                    });
                }

            }

            vm.CollectTableView = function () {
                const selectedValues = [...$scope.selectedColumns.children].map(li => ({
                    Key: li.textContent, Value: li.dataset.value
                }));
                const sortingCriteria = [...$scope.sortingContainer.children].map(div => ({
                    column: div.dataset.column,
                    direction: div.dataset.direction
                }));

                const tableView = {
                    TableName: vm.tableName,
                    ViewId: vm.ViewId,
                    Settings: {
                        ColumnsDisplayed: selectedValues,
                        SortingCriteria: sortingCriteria
                    },
                    ViewName: $scope.viewName
                };
                return tableView;
            }

            function onerror(error) {
                console.log(error);
            }


            //Initial
            vm.FetchTableColumns();
        }]);


})();