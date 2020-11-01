console.log("v3");

let data;
let plotting_data;
function fetchDataForPair(pair) {
    Papa.parse("/AMMroi/data/uniswapv2/roi/" + pair + ".csv", {
        download: true,
        complete: function(results) {
            console.log(results.data);
            data=results.data;
            plotting_data = getROIFromData(data, false);
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

function getILFromData(json, start_date) {
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



var ctx = document.getElementById('mainChart').getContext('2d');
var mixedChart = new Chart(ctx, {
    type: 'bar',
    data: {
        datasets: [
        //     {
        //     label: 'Bar Dataset',
        //     data: [10, 20, 30, 40],
        //     // this dataset is drawn below
        //     order: 1
        // }, 
        {
            label: 'Line Dataset',
            data: plotting_data,
            type: 'line',
            // this dataset is drawn on top
            order: 2
        }],
        //labels: ['January', 'February', 'March', 'April']
    },
});




