console.log("v3");

let data;
function fetchDataForPair(pair) {
    Papa.parse("/AMMroi/data/uniswapv2/roi/" + pair + ".csv", {
        download: true,
        complete: function(results) {
            console.log(results.data);
            data=results.data;
            let d1 = getROIFromData(data, false);
            let d2 = getILFromData(data, false);
            createChart(d1, d2);
        }
    });
}
// console.log(fetchDataForPair("wbtc"));

function getROIFromData(json_data, start_date) {
    if (start_date) {
        start_date = moment.unix(1);
    }
    let index_data = json_data[0].indexOf("ROI");
    let index_time = json_data[0].indexOf("timestamp");
    let start_index;
    for (arr_index in json_data.slice(1)) {
        if (moment.unix(json_data[arr_index][index_time]) >= start_date) {
            start_index = arr_index+1;
            break;
        }
    }
    output_data = [];
    const initialInv = json_data[start_index][index_data];
    for (arr of json_data.slice(start_index)) {
        output_data.push(
            {
            x: moment.unix(arr[index_time]),
            y: arr[index_data]/initialInv
            }
        );
    }
    return output_data;
}

function getILFromData(json_data, start_date) {
    if (start_date) {
        start_date = moment.unix(1);
    }
    let index_data = json_data[0].indexOf("Token Price");
    let index_time = json_data[0].indexOf("timestamp");
    let start_index;
    for (arr_index in json_data.slice(1)) {
        if (moment.unix(json_data[arr_index][index_time]) >= start_date) {
            start_index = arr_index+1;
            break;
        }
    }
    output_data = [];
    const intialPrice = json_data[start_index][index_data];
    for (arr of json_data.slice(start_index)) {
        output_data.push(
            {
            x: moment.unix(arr[index_time]),
            y: 2 * Math.sqrt(arr[index_data]/intialPrice)/(1 + arr[index_data]/intialPrice)
            }
        );
    }
    return output_data;
}

function createChart(ROIdata, ILdata) {
    var ctx = document.getElementById('mainChart').getContext('2d');
    let chart = new Chart(ctx, {
        type: 'scatter',
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
                    }
                }]
            }
        }
    });
    return chart;
}

// var chart = createChart()




