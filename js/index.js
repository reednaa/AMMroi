console.log("v1");

let data;
function fetchDataForPair(pair) {
    Papa.parse("/AMMroi/data/uniswapv2/roi/" + pair + ".csv", {
        download: true,
        complete: function(results) {console.log(results.data);data=results.data}
    });
}
console.log(fetchDataForPair("wbtc"));

function getFeesFromData(json, start_date, end_date) {

}

function getILFromData(json, start_date, end_date) {
    
}


var ctx = document.getElementById('mainChart').getContext('2d');
var mixedChart = new Chart(ctx, {
    type: 'bar',
    data: {
        datasets: [{
            label: 'Bar Dataset',
            data: [10, 20, 30, 40],
            // this dataset is drawn below
            order: 1
        }, {
            label: 'Line Dataset',
            data: [10, 10, 10, 10],
            type: 'line',
            // this dataset is drawn on top
            order: 2
        }],
        labels: ['January', 'February', 'March', 'April']
    },
});




