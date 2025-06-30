(function () {

    angular.module('umbraco').controller("CreateTableGridController",
        ['$http', '$scope', 'notificationsService', 'overlayService', 'navigationService',
            function ($http, $scope, notificationsService, overlayService, navigationService) {
                var vm = this;
                vm.uiURL = window.AppConfig.FormIODesignerUI;
                vm.APIURL = window.AppConfig.FormIODesignerAPI;
                $scope.columnTypes = [{ Key: "text", Value: "Text" }, { Key: "number", Value: "Number" }, { Key: "textarea", Value: "Textarea" }, { Key: "password", Value: "Password" }, { Key: "checkbox", Value: "Checkbox" }, { Key: "select", Value: "Select" }, { Key: "email", Value: "Email" }, { Key: "dateTime", Value: "DateTime" }, { Key: "selectboxes", Value: "Select Boxes" }, { Key: "radio", Value: "Radio" }, { Key: "any", Value: "Any" }, { Key: "object", Value: "Object" }];

                $scope.tableName = null;
                $scope.tableNameValid = true;
                $scope.TableSchema = null;
                $scope.ModalTitle = "";




                vm.AddContentItem = function (name, type, parentElement = null) {
                    let contentList;
                    if (parentElement) {
                        let childList = parentElement.querySelector('.child-list');
                        if (!childList) {
                            childList = document.createElement('div');
                            childList.className = 'child-list';
                            parentElement.appendChild(childList);
                        }
                        contentList = childList;
                    } else {
                        contentList = document.getElementById('content-list');
                    }

                    const newItem = document.createElement('div');
                    newItem.className = 'content-item';

                    const contentHeader = document.createElement('div');
                    contentHeader.className = 'content-header';

                    //CheckBox
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'select-item';
                    contentHeader.appendChild(checkbox);

                    //Add Child Button 
                    const addChildButton = document.createElement('span');
                    addChildButton.className = 'add-child';
                    addChildButton.textContent = '+';
                    addChildButton.addEventListener('click', () => vm.showAddModal(newItem));

                    //Remove Button
                    const removeButton = document.createElement('span');
                    removeButton.className = 'remove-item';
                    removeButton.textContent = '−';
                    removeButton.addEventListener('click', () => contentList.removeChild(newItem));

                    const contentName = document.createElement('span');
                    contentName.className = 'content-name';
                    contentName.textContent = name;
                    contentName.dataset.value = type;
                    contentName.addEventListener('click', () => vm.showEditModal(contentName));

                    contentHeader.appendChild(addChildButton);
                    contentHeader.appendChild(removeButton);
                    contentHeader.appendChild(contentName);
                    newItem.appendChild(contentHeader);
                    contentList.appendChild(newItem);

                    return newItem; // Return the newly created item
                }

                vm.showEditModal = function (contentName) {
                    var dialog = {
                        title: 'Edit Content',
                        view: '/App_Plugins/SurveyTemplates/views/tableContent.html',
                        value: { columnName: contentName.textContent, columnType: contentName.dataset.value, columnTypesList: $scope.columnTypes },
                        close: function () {
                            overlayService.close();
                        },
                        submit: function (model) {
                            if (model && model.value.columnName && model.value.columnType) {
                                contentName.textContent = model.value.columnName;
                                contentName.dataset.value = model.value.columnType;
                            }
                            overlayService.close();
                        },
                        submitButtonLabel: 'Save',
                        closeButtonLabel: 'Cancel'
                    };

                    overlayService.open(dialog);
                }

                vm.showAddModal = function (parentElement) {
                    var dialog = {
                        title: 'Add New Content',
                        view: '/App_Plugins/SurveyTemplates/views/tableContent.html',
                        value: { columnName: null, columnType: null, columnTypesList: $scope.columnTypes },
                        close: function () {
                            overlayService.close();
                        },
                        submit: function (model) {
                            if (model && model.value.columnName && model.value.columnType) {
                                vm.AddContentItem(model.value.columnName, model.value.columnType, parentElement);
                            }
                            overlayService.close();
                        },
                        submitButtonLabel: 'Save',
                        closeButtonLabel: 'Cancel'
                    };

                    overlayService.open(dialog);

                }

                vm.Save = function () {
                    if (!$scope.tableForm || !$scope.tableForm.$valid) {
                        $scope.tableForm.tableName.$setTouched();
                        return;
                    }
                    vm.CollectTableSchema();

                    $http.post(`${vm.APIURL}/Query/AddTableSchema`, $scope.TableSchema).then(function (response) {
                        if (response && response.status == 200) {
                            let data = response.data;

                            if (data.Succeeded) {
                                notificationsService.success("Success", "Data saved successfully");
                                navigationService.syncTree({
                                    tree: 'TablesAlias',
                                    path: "-1," + $scope.tableName,
                                    forceReload: true
                                });

                                window.location.href = `/umbraco#/surveyBuilder/TemplatesAlias/EditTemplate?tableName=${$scope.tableName}`;
                            }
                            else {
                                notificationsService.error("Error", data?.Message);

                            }
                        }
                        else {
                            notificationsService.error("Error", 'Failed to save data')
                        }
                    }, function (error) {
                        console.error('Error:', error);
                        notificationsService.error("Error", 'Failed to save data')
                    });

                }

                //Collect Content Items
                vm.BuildContentTree = function (element) {
                    const tree = {};
                    for (let item of element.children) {
                        if (item.classList.contains('content-item')) {
                            const name = item.querySelector('.content-name').textContent;
                            const type = item.querySelector('.content-name').dataset.value;
                            const childList = item.querySelector('.child-list');

                            tree[name] = childList && childList.children.length > 0
                                ? vm.BuildContentTree(childList)
                                : type;
                        }
                    }
                    return tree;
                }

                //Collect Calculated Items
                vm.GetSelectedItemsWithPath = function (element, path = '') {
                    const selectedItems = [];
                    for (let item of element.children) {
                        if (item.classList.contains('content-item')) {
                            const name = item.querySelector('.content-name').textContent;
                            const fullPath = path ? `${path}.${name}` : name;
                            const checkbox = item.querySelector('.select-item');

                            if (checkbox && checkbox.checked) {
                                selectedItems.push(fullPath);
                            }

                            const childList = item.querySelector('.child-list');
                            if (childList) {
                                selectedItems.push(...vm.GetSelectedItemsWithPath(childList, fullPath));
                            }
                        }
                    }
                    return selectedItems;
                }

                vm.CollectTableSchema = function () {

                    const schema = vm.BuildContentTree(document.getElementById('content-list'));
                    const calculatedColumns = vm.GetSelectedItemsWithPath(document.getElementById('content-list'));

                    $scope.TableSchema = { TableName: $scope.tableName, Schema: schema, CalculatedColumns: calculatedColumns };
                }


            }]);


})();