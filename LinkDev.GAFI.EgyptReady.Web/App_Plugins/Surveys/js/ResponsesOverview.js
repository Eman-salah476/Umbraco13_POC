(function () {

    angular.module('umbraco').controller("OverviewController",
        ['$http', '$scope', 'notificationsService', 'overlayService', 'navigationService',
            function ($http, $scope, notificationsService, overlayService, navigationService) {
                var vm = this;
                vm.APIURL = window.AppConfig.FormIODesignerAPI;
                vm.surveyId = null;
                $scope.totalResponses = 0;
                $scope.textFieldTypes = ["textarea", "textfield", "email"];
                $scope.CountFieldTypes = ["selectboxes", "radio", "select"];
                $scope.numberFieldTypes = ["number"];
                $scope.checkboxFieldTypes = ["checkbox"];


                vm.GetSurveyIdFromUrl = function () {
                    const url = window.location.href;
                    const parts = url.split('/ResponsesOverview/');
                    return parts.length > 1 ? parts[1].split('?')[0] : null;
                }

                vm.GetProcessedData = function () {
                    vm.surveyId = vm.GetSurveyIdFromUrl();
                    if (!vm.surveyId) {
                        notificationsService.error("Error", 'Survey Id is missing in the URL.');
                        return;
                    }
                    $http.get(`${vm.APIURL}/SubmissionsOverview/GetOverview/${vm.surveyId}`).then(function (response) {
                        if (response && response.status == 200) {
                            let overview = response.data;
                            if (overview) {
                                $scope.totalResponses = overview.TotalResponses;
                                if (overview.ProcessedData) {
                                    let processedData = JSON.parse(overview.ProcessedData);
                                    vm.renderCharts(processedData);
                                }
                            }
                        }
                    }, function (error) {
                        notificationsService.error("Error", 'Failed to load data');
                    });
                }

                vm.renderCharts = function (questions) {
                    const container = document.getElementById('chartsContainer');
                    container.innerHTML = '';

                    questions.forEach((q, idx) => {
                        const wrapper = document.createElement('div');
                        wrapper.className = 'overview-card';


                        // Title
                        const title = document.createElement('h4');
                        title.innerText = `${idx + 1}.${q.label}`;
                        title.className = 'overview-title';
                        wrapper.appendChild(title);

                        // Text/Email/Textarea: Show count and list
                        if ($scope.textFieldTypes.includes(q.type)) {
                            const countDiv = document.createElement('div');
                            countDiv.className = 'overview-count';

                            const Value = document.createElement('div');
                            Value.innerText = q.answers ? q.answers.length : 0;
                            Value.className = 'overview-number-value';
                            countDiv.appendChild(Value);
                            // Label
                            const Label = document.createElement('div');
                            Label.innerText = "Responses";
                            Label.className = 'overview-number-label';
                            countDiv.appendChild(Label);
                            wrapper.appendChild(countDiv);

                            if (q.answers && q.answers.length > 0) {
                                const ul = document.createElement('ul');
                                ul.className = 'overview-response-list';
                                q.answers.forEach(ans => {
                                    const li = document.createElement('li');
                                    li.innerText = ans;
                                    ul.appendChild(li);
                                });
                                wrapper.appendChild(ul);
                            }
                            container.appendChild(wrapper);
                        }
                        // Number: Horizontal Bar Chart + Average
                        else if ($scope.numberFieldTypes.includes(q.type)) {
                            const leftDiv = document.createElement('div');
                            leftDiv.className = 'overview-count';
                            // Average value
                            const avg = typeof q.average !== 'undefined' ? q.average.toFixed(2) : '-';
                            const avgValue = document.createElement('div');
                            avgValue.innerText = avg;
                            avgValue.className = 'overview-number-value';
                            leftDiv.appendChild(avgValue);
                            // Label
                            const avgLabel = document.createElement('div');
                            avgLabel.innerText = "Average";
                            avgLabel.className = 'overview-number-label';
                            leftDiv.appendChild(avgLabel);
                            wrapper.appendChild(leftDiv);

                            // Chart
                            const chartDiv = document.createElement('div');
                            chartDiv.className = 'overview-chart';
                            const canvas = document.createElement('canvas');
                            canvas.id = `chart_${idx}`;
                            chartDiv.appendChild(canvas);
                            wrapper.appendChild(chartDiv);
                            container.appendChild(wrapper);

                            // Prepare data for horizontal bar
                            let counts = {};
                            (q.answers || []).forEach(val => {
                                let key = Math.round(val);
                                counts[key] = (counts[key] || 0) + 1;
                            });
                            const labels = Object.keys(counts);
                            const dataVals = Object.values(counts);
                            setTimeout(() => {
                                new Chart(document.getElementById(canvas.id), {
                                    type: 'bar',
                                    data: {
                                        labels: labels,
                                        datasets: [{
                                            label: 'Responses',
                                            data: dataVals,
                                            backgroundColor: 'rgba(54, 162, 235, 0.5)'
                                        }]
                                    },
                                    options: {
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        indexAxis: 'y',
                                        plugins: {
                                            legend: { display: false }
                                        },
                                        scales: {
                                            x: { beginAtZero: true }
                                        }
                                    }
                                });
                            }, 0);
                        }
                        // CountFieldTypes: Doughnut Chart with counts in labels
                        else if ($scope.CountFieldTypes.includes(q.type)) {
                            const chartDiv = document.createElement('div');
                            chartDiv.className = 'overview-chart';
                            const canvas = document.createElement('canvas');
                            canvas.id = `chart_${idx}`;
                            chartDiv.appendChild(canvas);
                            wrapper.appendChild(chartDiv);
                            container.appendChild(wrapper);

                            // Prepare data
                            const counts = q.counts || {};
                            const labels = Object.keys(counts).map(k => `${k} (${counts[k]})`);
                            const dataVals = Object.values(counts);
                            setTimeout(() => {
                                new Chart(document.getElementById(canvas.id), {
                                    type: 'doughnut',
                                    data: {
                                        labels: labels,
                                        datasets: [{
                                            label: 'Responses',
                                            data: dataVals,
                                            backgroundColor: [
                                                '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
                                            ]
                                        }]
                                    },
                                    options: {
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { display: true, position: 'left' }
                                        }
                                    }
                                });
                            }, 0);
                        }
                        //Checkbox : Pie Chart with Yes/No counts
                        else if ($scope.checkboxFieldTypes.includes(q.type)) {
                            const chartDiv = document.createElement('div');
                            chartDiv.className = 'overview-chart';
                            const canvas = document.createElement('canvas');
                            canvas.id = `chart_${idx}`;
                            chartDiv.appendChild(canvas);
                            wrapper.appendChild(chartDiv);
                            container.appendChild(wrapper);

                            setTimeout(() => {
                                new Chart(document.getElementById(canvas.id), {
                                    type: 'pie',
                                    data: {
                                        labels: ['Yes', 'No'],
                                        datasets: [{
                                            data: [q.true || 0, q.false || 0],
                                            backgroundColor: ['#36A2EB', '#FF6384']
                                        }]
                                    },
                                    options: {
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { display: true, position: 'left' }
                                        }
                                    }
                                });
                            }, 0);
                        }


                    });
                }

                //Initialize
                vm.GetProcessedData();

            }]);


})();