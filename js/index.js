
window.chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};

function round(num, n) {
    const rounder = Math.pow(10, n);
    return Math.round(num * rounder) / rounder;
}

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
    if (!(typeof start_date === 'number')) {
        for (arr_index in json_data.slice(1)) {
            if (moment.unix(json_data[arr_index][index_time]) >= start_date) {
                start_index = Number(arr_index)+1;
                break;
            }
        }
    } else {
        start_index = start_date;
    }
    
    if (!start_index) {
        start_index = 1;
    }
    let outputFees = [];
    const initialInv = json_data[start_index][index_ROI];
    for (arr of json_data.slice(start_index)) {
        outputFees.push(
            {
            x: moment.unix(arr[index_time]),
            y: round((arr[index_ROI]/initialInv - 1)*100, 2)
            }
        );
    }
    let outputTP = []; // Impermanent loss, I can't remember why it is named TP
    const intialPrice = json_data[start_index][index_TP];
    for (arr of json_data.slice(start_index)) {
        outputTP.push(
            {
            x: moment.unix(arr[index_time]),
            y: round((2 * Math.sqrt(arr[index_TP]/intialPrice)/(1 + arr[index_TP]/intialPrice) - 1)*100, 2)
            }
        );
    }
    let outputROI = [];
    for (arr of json_data.slice(start_index)) {
        outputROI.push(
            {
            x: moment.unix(arr[index_time]),
            y: round(((arr[index_ROI]/initialInv) * (2 * Math.sqrt(arr[index_TP]/intialPrice)/(1 + arr[index_TP]/intialPrice))-1)*100, 2)
            }
        );
    }
    let outputProtected = [];
    for (arr of json_data.slice(start_index)) {
        outputProtected.push(
            {
            x: moment.unix(arr[index_time]),
            y: round(((arr[index_ROI]/initialInv-1) * ( 2 * Math.sqrt(arr[index_TP]/intialPrice)/(1 + arr[index_TP]/intialPrice)) + 1-1)*100, 2)
            }
        );
    }
    let bancorProtected = [];
    for (arr of json_data.slice(start_index)) {
        let IL = 2 * Math.sqrt(arr[index_TP]/intialPrice)/(1 + arr[index_TP]/intialPrice);
        let ROI = arr[index_ROI]/initialInv;
        let t = moment.unix(arr[index_time]).diff(moment.unix(json_data.slice(start_index)[0][index_time]), "minutes");
        let protection = 0;
        if ((0 <= t/1440) && (t/1440 < 30)) {
            protection = 0;
        } else if ((30 <= t/1440) && (t/1440 < 100)) {
            protection = (t/1440)/100;
        } else {
            protection = 1;
        }
        bancorProtected.push(
            {
            x: moment.unix(arr[index_time]),
            y: round(
                (ROI*IL + protection*(1-IL)-1)*100
                , 2)
            }
        );
    }
    return [outputFees, outputTP, outputROI, outputProtected, bancorProtected, start_index]
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
        help: true,
        listOfTokens: [],
        selectedAsset: false,
        selectedDate: "",
        isShake: false,
        calender: "",
        showProtected: true,
        lastChart: "",
        bancorProtected: false,
    },
    methods: {
        addChart: function(selectedDate = this.selectedDate) {
            if (!this.selectedAsset) {
                this.isShake = true;
                setTimeout(function() {
                    app.isShake = false;
                }, 820);
                return this.selectedAsset;
            }
            let id = this.charts.length;
            let new_chart = {name: id, id: id};
            this.charts.push(new_chart);
            this.lastChart = id;
            setTimeout(function() {
                var ctx = document.getElementById(id).getContext('2d');
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
                            }],
                            yAxes: [{
                                ticks: {
                                       callback: function(value){return value+ "%"}
                                    }}
                                ]
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
                new_chart["name"] = app.selectedAsset;
                Vue.set(app.charts, dictSearch(app.charts, "name", name), new_chart);
                app.addData(chart, app.selectedAsset, selectedDate);
            }, 500);
        },
        addData: function(chart, currency, sstart_date) {
            let start_date;
            if (!(typeof sstart_date === 'number')) {
                start_date = new moment(sstart_date)
            } else if (!sstart_date) {
                start_date = new moment.unix(1);
            } else {
                start_date = sstart_date
            }
            Papa.parse("/data/uniswapv2/roi/" + currency + ".csv", {
                download: true,
                complete: function(results) {
                    let [outputFees, outputTP, outputROI, outputProtected, bancorProtected, start_index] = convertData(results.data, start_date);
                    if (app.showProtected) {
                        chart.data.datasets.push(
                            {
                                label: "Return w.o. IL.",
                                data: outputProtected,
                                backgroundColor: window.chartColors.yellow,
                                borderColor: window.chartColors.yellow,
                                fill: false,
                                steppedLine: "middle"
                            }
                        );
                    };
                    if (app.bancorProtected) {
                        chart.data.datasets.push(
                            {
                                label: "Bancor Protected",
                                data: bancorProtected,
                                backgroundColor: window.chartColors.yellow,
                                borderColor: window.chartColors.yellow,
                                fill: false,
                                steppedLine: "middle"
                            }
                        );
                    }
                    chart.data.datasets.push(
                        {
                            label: "Collected Fees",
                            data: outputFees,
                            backgroundColor: window.chartColors.blue,
                            borderColor: window.chartColors.blue,
                            fill: false,
                            steppedLine: "middle"
                        }
                    );
                    chart.data.datasets.push(
                        {
                            label: "Impermanent Loss",
                            data: outputTP,
                            backgroundColor: window.chartColors.red,
					        borderColor: window.chartColors.red,
                            fill: false,
                            steppedLine: "middle"
                        }
                    );
                    chart.data.datasets.push(
                        {
                            label: "Uniswap Return",
                            data: outputROI,
                            backgroundColor: window.chartColors.green,
					        borderColor: window.chartColors.green,
                            fill: false,
                            steppedLine: "middle"
                        }
                    );
                    chart.options.scales.xAxes[0].ticks.min = outputFees[0]["x"];
                    chart.update();
                    app.charts[app.lastChart]["name"] = app.selectedAsset + " " + outputProtected[0]["x"].format('YYYY-MM-DD hh:mm') + " to " + outputProtected[outputProtected.length-2]["x"].format('YYYY-MM-DD hh:mm');
                    app.charts[app.lastChart]["start_index"] = start_index;
                    app.charts[app.lastChart]["token"] = app.selectedAsset;
                }
            });
        },
        fetchAllTokens: function() {
            let url = '/data/uniswapv2/tokens.json';
            fetch(url).then(res => res.json()).then((out) => {
                app.listOfTokens = (out["results"]).sort((a,b) => ((a.id).localeCompare(b.id)));
            });
        }
    },
    watch: {
        selectedAsset: function() {
            calender.destroy();
            Papa.parse("/data/uniswapv2/roi/" + this.selectedAsset + ".csv", {
                download: true,
                complete: function(results) {
                    calender = flatpickr("#startDate", { "enableTime": true, "locale": "da", minDate: moment.unix(results.data[1][1]).toDate(), maxDate: "today", defaultDate: moment.unix(results.data[1][1]).toDate(),
                    onClose: function(selectedDates, dateStr, instance){
                        app.selectedDate = dateStr;
                     }}
                    );
                    app.selectedDate = moment.unix(results.data[1][1]).format("YYYY-MM-DD HH:mm");
                }
            });
        },
        showProtected: function(val, oldval) {
            if (val) {
                if (this.bancorProtected) {
                    this.bancorProtected = !this.bancorProtected;
                }
            }
        },
        bancorProtected: function(val, oldval) {
            if (val) {
                if (this.showProtected) {
                    this.showProtected = !this.bancorProtected;
                }
            }
        },
    },
    created() {
        this.fetchAllTokens();

        let counter = 1;
        if (window.location.search.substr(1)) {
            for (let graph of window.location.search.substr(1).split("&")) {
                let [element, value] = graph.split("=");
                if (element == "P") {
                    if (value == 0) {
                        this.showProtected = false;
                        this.bancorProtected = false;
                    } else if (value == 1) {
                        this.showProtected = true;
                        this.bancorProtected = false;
                    } else if (value == 2) {
                        this.showProtected = false;
                        this.bancorProtected = true;
                    }
                }
            }
            for (let graph of window.location.search.substr(1).split("&")) {
                if (graph.split("=")[0] == "P") {
                    continue
                }
                setTimeout(function() {
                    let [asset, date] = graph.split("=");
                    app.selectedAsset = asset;
                    app.addChart(Number(date));
                }, counter);
                counter += 800;
            }

        }
    }
});

let calender = flatpickr("#startDate", { "enableTime": true, "locale": "da" });