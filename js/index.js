url = window.location.href.split("/")[2]
// url = "file:///Users/AlexanderLindgren/Documents/Git/AMMroi"

console.log(url + "/data/uniswapv2/roi/" + "wbtc" + ".csv");

function getDataForPair(pair) {
    return Papa.parse(url + "/data/uniswapv2/roi/" + pair + ".csv", {
        download: true,
    });
}
console.log(getDataForPair("wbtc"));

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




