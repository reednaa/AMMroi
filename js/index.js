
window.chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};

let data;
let chart;
function fetchDataForPair(pair) {
    Papa.parse("/data/uniswapv2/roi/" + pair + ".csv", {
        download: true,
        complete: function(results) {
            console.log(results.data);
            data=results.data;
        }
    });
}

let list_of_tokens;
function fetchAllTokens() {
    let url = '/data/uniswapv2/tokens.json';
    fetch(url).then(res => res.json()).then((out) => {
    list_of_tokens = out;
    });
}
// console.log(fetchDataForPair("wbtc"));

function convertData(json_data, start_date) {
    if (!start_date) {
        start_date = moment.unix(1);
    }
    let index_ROI = json_data[0].indexOf("ROI");
    let index_TP = json_data[0].indexOf("Token Price");
    let index_time = json_data[0].indexOf("timestamp");
    let start_index;
    for (arr_index in json_data.slice(1)) {
        if (moment.unix(json_data[arr_index][index_time]) >= start_date) {
            start_index = arr_index+1;
            break;
        }
    }
    console.log(start_index);
    if (!start_index) {
        start_index = 1;
    }
    let outputFees = [];
    const initialInv = json_data[start_index][index_ROI];
    for (arr of json_data.slice(start_index)) {
        outputFees.push(
            {
            x: moment.unix(arr[index_time]),
            y: arr[index_ROI]/initialInv
            }
        );
    }
    let outputTP = [];
    const intialPrice = json_data[start_index][index_TP];
    for (arr of json_data.slice(start_index)) {
        outputTP.push(
            {
            x: moment.unix(arr[index_time]),
            y: 2 * Math.sqrt(arr[index_TP]/intialPrice)/(1 + arr[index_TP]/intialPrice)
            }
        );
    }
    let outputROI = [];
    for (arr of json_data.slice(start_index)) {
        outputROI.push(
            {
            x: moment.unix(arr[index_time]),
            y: (arr[index_ROI]/initialInv) * (2 * Math.sqrt(arr[index_TP]/intialPrice)/(1 + arr[index_TP]/intialPrice))
            }
        );
    }
    return [outputFees, outputTP, outputROI]
}


function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}

function removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
    chart.update();
}

// var chart = createChart()

// fetchDataForPair("wbtc");

function dictSearch(arr, key, value) {
    for (element of arr) {
        if (element[key] == value) {
            return arr.indexOf(element);
        }
    }
}


let app = new Vue({
    el: "#structure",
    data: {
        charts: [],
        listOfTokens: [],
        selectedAsset: false,
        selectedDate: "",
        isShake: false,
        calender: "",
    },
    methods: {
        addChart: function() {
            if (!this.selectedAsset) {
                this.isShake = true;
                setTimeout(function() {
                    app.isShake = false;
                }, 820);
                return this.selectedAsset;
            }
            let name = this.charts.length
            let new_chart = {name: name};
            this.charts.push(new_chart);
            setTimeout(function() {
                var ctx = document.getElementById(name).getContext('2d');
                let chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        datasets: [
                        //     {
                        //     label: 'ROI',
                        //     data: ROIdata
                        // },
                        // {
                        //     label: 'IL',
                        //     data: ILdata
                        // }
                    ]
                    },
                    options: {
                        elements: {
                            line: {
                                tension: 0 // disables bezier curves
                            }
                        },
                        scales: {
                            xAxes: [{
                                type: "time",
                                time : {
                                    tooltipFormat: 'll HH:mm'
                                },
                                ticks: {
                                //     min: ROIdata[0]["x"]
                                }
                            }]
                        },
                        tooltips: {
                            mode: 'index',
                            intersect: false
                          },
                          plugins: {
                            crosshair: {
                              line: {
                                color: '#F66',        // crosshair line color
                                width: 1,             // crosshair line width
                                dashPattern: [5, 5]   // crosshair line dash pattern
                              },
                              sync: {
                                enabled: true,            // enable trace line syncing with other charts
                                group: 1,                 // chart group
                                suppressTooltips: false   // suppress tooltips when showing a synced tracer
                              },
                              zoom: {
                                enabled: true,                                      // enable zooming
                                zoomboxBackgroundColor: 'rgba(66,133,244,0.2)',     // background color of zoom box 
                                zoomboxBorderColor: '#48F',                         // border color of zoom box
                                zoomButtonText: 'Reset Zoom',                       // reset zoom button text
                                zoomButtonClass: 'reset-zoom',                      // reset zoom button class
                              },
                              callbacks: {
                                beforeZoom: function(start, end) {                  // called before zoom, return false to prevent zoom
                                  return true;
                                },
                                afterZoom: function(start, end) {                   // called after zoom
                                }
                              
                            }
                            }
                        }       
                } 
                });
                new_chart["chart"] = chart;
                new_chart["name"] = app.selectedAsset + " " + new_chart.name
                Vue.set(app.charts, dictSearch(app.charts, "name", name), new_chart);
                app.addData(chart, app.selectedAsset, moment(app.selectedDate));
            }, 500);
        },
        addData: function(chart, currency, start_date) {
            if (!start_date) {
                start_date = moment.unix(1);
            }
            Papa.parse("/data/uniswapv2/roi/" + currency + ".csv", {
                download: true,
                complete: function(results) {
                    let [outputFees, outputTP, outputROI] = convertData(results.data, start_date)
                    chart.data.datasets.push(
                        {
                            label: "Collected Fees",
                            data: outputFees,
                            backgroundColor: window.chartColors.blue,
                            borderColor: window.chartColors.blue,
                            fill: false,
                        }
                    );
                    chart.data.datasets.push(
                        {
                            label: "Impermanent loss",
                            data: outputTP,
                            backgroundColor: window.chartColors.red,
					        borderColor: window.chartColors.red,
                            fill: false,
                        }
                    );
                    chart.data.datasets.push(
                        {
                            label: "Return",
                            data: outputROI,
                            backgroundColor: window.chartColors.green,
					        borderColor: window.chartColors.green,
                            fill: false,
                        }
                    );
                    chart.options.scales.xAxes[0].ticks.min = outputFees[0]["x"];
                    chart.update();
                }
            });
        },
        fetchAllTokens: function() {
            let url = '/data/uniswapv2/tokens.json';
            fetch(url).then(res => res.json()).then((out) => {
                app.listOfTokens = out["results"];
            });
        }
    },
    watch: {
        selectedAsset: function() {
            calender.destory();
            Papa.parse("/data/uniswapv2/roi/" + pair + ".csv", {
                download: true,
                complete: function(results) {
                    calender = flatpickr("#startDate", { "enableTime": true, "locale": "da", minDate: moment.unix(results.data[1][0]), maxDate: "today", defaultDate: moment.unix(results.data[1][0])});
                }
            });

        }
    },
    created() {
        this.fetchAllTokens();
    }
});

let calender = flatpickr("#startDate", { "enableTime": true, "locale": "da" });