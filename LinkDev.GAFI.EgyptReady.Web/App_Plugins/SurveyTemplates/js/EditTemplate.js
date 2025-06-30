(function () {

    angular.module('umbraco').controller("EditTableGridController", ['$http', '$scope', 'notificationsService', 'overlayService',
        function ($http, $scope, notificationsService, overlayService) {
            var vm = this;
            vm.uiURL = window.AppConfig.FormIODesignerUI;
            vm.APIURL = window.AppConfig.FormIODesignerAPI;
            $scope.columnTypes = [{ Key: "text", Value: "Text" }, { Key: "number", Value: "Number" }, { Key: "textarea", Value: "Textarea" }, { Key: "password", Value: "Password" }, { Key: "checkbox", Value: "Checkbox" }, { Key: "select", Value: "Select" }, { Key: "email", Value: "Email" }, { Key: "dateTime", Value: "DateTime" }, { Key: "selectboxes", Value: "Select Boxes" }, { Key: "radio", Value: "Radio" }, { Key: "any", Value: "Any" }, { Key: "object", Value: "Object" }];

            $scope.tableName = "";
            $scope.tableNameValid = true;
            $scope.TableSchema = null;
            vm.tableId = null;
            $scope.ModalTitle = "";

            vm.GetQueryParam = function (name) {
                const queryString = window.location.hash.split("?")[1];
                return queryString ? new URLSearchParams(queryString).get(name) : null;
            }

            vm.LoadTableSchema = function () {
                // Fetch data from the API when the page loads
                const tableName = vm.GetQueryParam("tableName");
                if (tableName) {
                    $http.get(`${vm.APIURL}/Query/GetTableConfiguration?tableName=${tableName}`).then(function (response) {
                        if (response && response.status == 200) {
                            let data = response.data;
                            if (data) {
                                vm.tableId = data.Id;
                                // Fill the table name input field
                                $scope.tableName = data.TableName;

                                let structure = JSON.parse(data.Structure);
                                // Build the tree structure
                                vm.BuildTreeFromSchema(structure.schema);

                                // Check the calculated columns
                                vm.CheckCalculatedColumns(structure.calculatedColumns);
                            }

                        }
                        else {
                            notificationsService.error("Error", 'Failed to load data')
                        }
                    }, function (error) {
                        console.error('Error:', error);
                        notificationsService.error("Error", 'Failed to load data')
                    });
                }
            }

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

                vm.CollectTableSchema();

                if ($scope.tableNameValid) {
                    $http.post(`${vm.APIURL}/Query/UpdateTableSchema`, $scope.TableSchema).then(function (response) {
                        if (response && response.status == 200) {

                            let data = response.data;
                            if (data.Succeeded) {
                                notificationsService.success("Success", 'Data Saved Successfully');
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

            }

            vm.Apply = function () {

                vm.CollectTableSchema();

                if ($scope.tableNameValid) {
                    $http.post(`${vm.APIURL}/Query/CreateTable`, $scope.TableSchema).then(function (response) {
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

            vm.GenerateForm = function () {

                var dialog = {
                    title: 'Enter Survey Name',
                    view: '/App_Plugins/SurveyTemplates/views/prompt.html',
                    close: function () {
                        overlayService.close();
                    },
                    submit: function (model) {
                        if (model && model.value) {
                            vm.PostForm(model.value);
                        }
                        overlayService.close();
                    },
                    submitButtonLabel: 'Submit',
                    closeButtonLabel: 'Cancel'
                };

                overlayService.open(dialog);
                
            }

            vm.PostForm = function (formName) {
                if (vm.tableId) {
                    vm.CollectTableSchema();

                    if ($scope.tableNameValid) {
                        $http.post(`${vm.APIURL}/Query/GenerateForm?formName=${formName}`, $scope.TableSchema).then(function (response) {
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
            }

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
                const tableName = $scope.tableName;

                if (!tableName || tableName.trim() == "" || /\s/.test(tableName)) {
                    $scope.tableNameValid = false;
                    return;
                }
                else {
                    $scope.tableNameValid = true;
                }

                const schema = vm.BuildContentTree(document.getElementById('content-list'));
                const calculatedColumns = vm.GetSelectedItemsWithPath(document.getElementById('content-list'));

                $scope.TableSchema = { TableId: vm.tableId, TableName: tableName, Schema: schema, CalculatedColumns: calculatedColumns };
            }

            vm.BuildTreeFromSchema = function (schema, parentElement) {
                if (!schema || typeof schema !== 'object') {
                    console.warn('Invalid schema data.');
                    return;
                }

                for (const key in schema) {
                    if (typeof schema[key] === 'object') {
                        // If the value is an object, it has children
                        const newItem = vm.AddContentItem(key, 'object', parentElement);
                        vm.BuildTreeFromSchema(schema[key], newItem);
                    }
                    else {
                        // If the value is a string, it's a leaf node
                        vm.AddContentItem(key, schema[key], parentElement);
                    }
                }
            }

            vm.CheckCalculatedColumns = function (calculatedColumns) {
                if (!Array.isArray(calculatedColumns)) {
                    console.warn('Invalid calculated columns data.');
                    return;
                }

                calculatedColumns.forEach(path => {
                    const parts = path.split('.');
                    let element = document.getElementById('content-list');
                    for (const part of parts) {
                        const contentNameElement = Array.from(element.querySelectorAll('.content-name'))
                            .find(el => el.textContent === part);
                        if (!contentNameElement) {
                            console.error(`Element with text "${part}" not found`);
                            return;
                        }
                        element = contentNameElement.closest('.content-item');
                        if (!element) {
                            console.error(`Parent .content-item not found for "${part}"`);
                            return;
                        }
                    }
                    const checkbox = element.querySelector('.select-item');
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
            }


            //Initial
            vm.LoadTableSchema();

        }]);


})();