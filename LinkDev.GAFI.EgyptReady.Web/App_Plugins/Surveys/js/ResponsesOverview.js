(function () {

    angular.module('umbraco').controller("OverviewController",
        ['$http', '$scope', 'notificationsService', 'overlayService', 'navigationService',
            function ($http, $scope, notificationsService, overlayService, navigationService) {
                var vm = this;
                vm.APIURL = window.AppConfig.FormIODesignerAPI;
                vm.surveyId = null;
                vm.dataLoaded = 0;
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
                    vm.dataLoaded = 0;

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
                        vm.dataLoaded = 1;

                    }, function (error) {
                        notificationsService.error("Error", 'Failed to load data');
                    });
                }

                vm.renderCharts = function (questions) {
                    const container = document.getElementById('chartsContainer');
                    container.innerHTML = '';

                    RegisterChartDataLabels();

                    questions.forEach((q, idx) => {
                        const wrapper = document.createElement('div');
                        wrapper.className = 'overview-card';
                        wrapper.style.position = 'relative';

                        // Title
                        const title = document.createElement('h4');
                        title.innerText = `${idx + 1}.${q.label}`;
                        title.className = 'overview-title';
                        wrapper.appendChild(title);

                        // Text/Email/Textarea: Show count and list (first 4 only)
                        if ($scope.textFieldTypes.includes(q.type)) {
                            vm.RenderTextFieldTypes(q, container, wrapper);
                        }
                        // Number: Horizontal Bar Chart + Average
                        else if ($scope.numberFieldTypes.includes(q.type)) {
                            vm.BuildNumberFieldTypesChart(idx, q, container, wrapper);
                        }
                        // CountFieldTypes: Doughnut Chart 
                        else if ($scope.CountFieldTypes.includes(q.type)) {
                            vm.BuildCountFieldTypesChart(idx, q, container, wrapper);
                        }
                        //Checkbox : Pie Chart with Yes/No counts
                        else if ($scope.checkboxFieldTypes.includes(q.type)) {
                            vm.BuildCheckboxFieldTypesChart(idx, q, container, wrapper);
                        }


                    });
                }

                //Helpers to create charts according to question types
                vm.RenderTextFieldTypes = function (question, container, wrapper) {
                    const countDiv = document.createElement('div');
                    countDiv.className = 'overview-count';

                    const Value = document.createElement('div');
                    Value.innerText = question.answers ? question.answers.length : 0;
                    Value.className = 'overview-number-value';
                    countDiv.appendChild(Value);
                    // Label
                    const Label = document.createElement('div');
                    Label.innerText = "Responses";
                    Label.className = 'overview-number-label';
                    countDiv.appendChild(Label);
                    wrapper.appendChild(countDiv);

                    if (question.answers && question.answers.length > 0) {
                        const list = document.createElement('div');
                        list.className = 'overview-response-list-container';
                        const span = document.createElement('span');
                        span.innerText = "Latest Responses";
                        list.append(span);

                        const ul = document.createElement('ul');
                        ul.className = 'overview-response-list';
                        // Show only first 4 responses
                        question.answers.slice(0, 4).forEach(ans => {
                            const li = document.createElement('li');
                            li.innerText = ans;
                            ul.appendChild(li);
                        });
                        list.appendChild(ul);
                        wrapper.appendChild(list);
                        // If more than 4, add Show All button
                        if (question.answers.length > 4) {
                            const showAllBtn = document.createElement('span');
                            showAllBtn.textContent = 'More Details';
                            showAllBtn.className = 'overview-showall-btn';

                            showAllBtn.addEventListener('click', () => vm.showAllResponses(question.label, question.answers));
                            wrapper.appendChild(showAllBtn);
                        }
                    }
                    container.appendChild(wrapper);
                }
                vm.BuildNumberFieldTypesChart = function (idx, question, container, wrapper) {
                    const leftDiv = document.createElement('div');
                    leftDiv.className = 'overview-count';
                    // Average value
                    const avg = typeof question.average !== 'undefined' ? question.average.toFixed(2) : '-';
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
                    (question.answers || []).forEach(val => {
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
                                indexAxis: 'x',
                                plugins: {
                                    legend: { display: false },
                                    datalabels: {
                                        color: '#222',
                                        font: { weight: 'bold' },
                                        anchor: 'center',
                                        align: 'center',
                                        formatter: function (value, context) {
                                            const data = context.chart.data.datasets[0].data;
                                            const total = data.reduce((a, b) => a + b, 0);
                                            const percentage = total ? (value / total * 100).toFixed(1) : 0;
                                            return percentage + '%';
                                        }
                                    }
                                }
                            },
                            plugins: window.ChartDataLabels ? [window.ChartDataLabels] : []
                        });
                    }, 0);
                }
                vm.BuildCountFieldTypesChart = function (idx, question, container, wrapper) {
                    const chartDiv = document.createElement('div');
                    chartDiv.className = 'overview-chart';
                    const canvas = document.createElement('canvas');
                    canvas.id = `chart_${idx}`;
                    chartDiv.appendChild(canvas);
                    wrapper.appendChild(chartDiv);
                    container.appendChild(wrapper);

                    // Prepare data
                    const counts = question.counts || {};
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
                                    backgroundColor:
                                        Array.from({ length: labels.length }, getRandomColor)
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: true, position: 'left' },
                                    datalabels: {
                                        color: '#222',
                                        font: { weight: 'bold' },
                                        formatter: function (value, context) {
                                            const data = context.chart.data.datasets[0].data;
                                            const total = data.reduce((a, b) => a + b, 0);
                                            const percentage = total ? (value / total * 100).toFixed(1) : 0;
                                            return percentage + '%';
                                        }
                                    }
                                }
                            },
                            plugins: window.ChartDataLabels ? [window.ChartDataLabels] : []
                        });
                    }, 0);
                }
                vm.BuildCheckboxFieldTypesChart = function (idx, question, container, wrapper) {
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
                                    data: [question.true || 0, question.false || 0],
                                    backgroundColor: Array.from({ length: 2 }, getRandomColor)
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: true,
                                        position: 'left',
                                        labels: {
                                            generateLabels: function (chart) {
                                                const data = chart.data;
                                                const dataset = data.datasets[0];
                                                return data.labels.map((label, i) => {
                                                    return {
                                                        text: `${label} (${dataset.data[i]})`,
                                                        fillStyle: dataset.backgroundColor[i],
                                                        strokeStyle: dataset.backgroundColor[i],
                                                        index: i
                                                    };
                                                });
                                            }
                                        }
                                    },
                                    datalabels: {
                                        color: '#222',
                                        font: { weight: 'bold' },
                                        formatter: function (value, context) {
                                            const data = context.chart.data.datasets[0].data;
                                            const total = data.reduce((a, b) => a + b, 0);
                                            const percentage = total ? (value / total * 100).toFixed(1) : 0;
                                            return percentage + '%';
                                        }
                                    }
                                }
                            },
                            plugins: window.ChartDataLabels ? [window.ChartDataLabels] : []
                        });
                    }, 0);
                }

                // Helper to show all responses in a modal
                vm.showAllResponses = function (label, answers) {
                    var dialog = {
                        title: label,
                        view: '/App_Plugins/Surveys/views/DetailsView.html',
                        value: { responses: answers },
                        closeButtonLabel: 'Close',
                        disableBackdropClick: false,
                        close: function () {
                            overlayService.close();
                        },
                    };
                    overlayService.open(dialog);

                };

                function getRandomColor() {
                    // Generates a random pastel color
                    const hue = Math.floor(Math.random() * 360);
                    return `hsl(${hue}, 70%, 60%)`;
                }

                function RegisterChartDataLabels() {
                    if (window.ChartDataLabels && Chart.registry && !Chart.registry.plugins.get('datalabels')) {
                        Chart.register(window.ChartDataLabels);
                    }
                }

                //Initialize
                vm.GetProcessedData();

            }]);


})();