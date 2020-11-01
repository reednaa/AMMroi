console.log("v3");

let data;
let chart;
function fetchDataForPair(pair) {
    Papa.parse("/AMMroi/data/uniswapv2/roi/" + pair + ".csv", {
        download: true,
        complete: function(results) {
            console.log(results.data);
            data=results.data;
            let d1 = getROIFromData(data, false);
            let d2 = getILFromData(data, false);
            chart = createChart(d1, d2);
        }
    });
}

let list_of_tokens;
function fetchAllTokens() {
    let url = '/AMMroi/data/uniswapv2/tokens.json';
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
    output_Fees = [];
    const initialInv = json_data[start_index][index_ROI];
    for (arr of json_data.slice(start_index)) {
        output_Fees.push(
            {
            x: moment.unix(arr[index_time]),
            y: arr[index_ROI]/initialInv
            }
        );
    }
    output_TP = [];
    const intialPrice = json_data[start_index][index_TP];
    for (arr of json_data.slice(start_index)) {
        output_TP.push(
            {
            x: moment.unix(arr[index_time]),
            y: 2 * Math.sqrt(arr[index_TP]/intialPrice)/(1 + arr[index_TP]/intialPrice)
            }
        );
    }
    output_ROI = [];
    for (arr of json_data.slice(start_index)) {
        output_ROI.push(
            {
            x: moment.unix(arr[index_time]),
            y: (arr[index_ROI]/initialInv) * (2 * Math.sqrt(arr[index_TP]/intialPrice)/(1 + arr[index_TP]/intialPrice))
            }
        );
    }
    return [output_fees, output_TP, output_ROI]
}


function createChart(ROIdata, ILdata) {
    var ctx = document.getElementById('mainChart').getContext('2d');
    let chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'ROI',
                data: ROIdata
            },
            {
                label: 'IL',
                data: ILdata
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    type: "time",
                    time : {
                        tooltipFormat: 'll HH:mm'
                    },
                    ticks: {
                        min: ROIdata[0]["x"]
                    }
                }]
            }
        }
    });
    return chart;
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
    },
    methods: {
        addChart: function() {
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
                        scales: {
                            xAxes: [{
                                type: "time",
                                time : {
                                    tooltipFormat: 'll HH:mm'
                                },
                                // ticks: {
                                //     min: ROIdata[0]["x"]
                                // }
                            }]
                        },
                        tooltips: {
                            mode: 'interpolate',
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
                Vue.set(app.charts, dictSearch(app.charts, "name", name), new_chart);
                app.addData(chart, app.selectedAsset, false);
            }, 500);
        },
        addData: function(chart, currency, start_date) {
            if (!start_date) {
                start_date = moment.unix(1);
            }
            Papa.parse("/AMMroi/data/uniswapv2/roi/" + currency + ".csv", {
                download: true,
                complete: function(results) {
                    output_fees, output_TP, output_ROI = convertData(results, start_date)
                    chart.datasets.push(
                        {
                            label: "Collected Fees",
                            data: output_fees
                        }
                    );
                    chart.datasets.push(
                        {
                            label: "Percentage against HODL",
                            data: output_TP
                        }
                    );
                    chart.datasets.push(
                        {
                            label: "Return",
                            data: output_ROI
                        }
                    );
                }
            });
        },
        fetchAllTokens: function() {
        let url = '/AMMroi/data/uniswapv2/tokens.json';
        fetch(url).then(res => res.json()).then((out) => {
            app.listOfTokens = out["results"];
        });
}
    },
    created() {
        this.fetchAllTokens();
    }
});

