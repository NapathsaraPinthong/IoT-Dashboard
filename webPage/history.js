//Import the needed functions from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-analytics.js";
import { getFirestore, collection, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
import pako from "https://cdn.jsdelivr.net/npm/pako@2.1.0/+esm";

const chartJsScript = document.createElement('script');
chartJsScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
document.head.appendChild(chartJsScript);


const firebaseConfig = {
    apiKey: "AIzaSyCieUJHOvKpPm7OT0jgI7uTfzLtC3fCBsM",
    authDomain: "iot-dashboard-66709.firebaseapp.com",
    projectId: "iot-dashboard-66709",
    storageBucket: "iot-dashboard-66709.appspot.com",
    messagingSenderId: "336370107618",
    appId: "1:336370107618:web:536306a4fe5ce6ff80cabb",
    measurementId: "G-X8PN718VWN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const archiveCol = collection(db, 'archive');


// Collection of data
const tempList = [];
const humidList = [];
const genList = [];
const useList = [];
const netList = [];
var date = "";
var queryTime = "2016-06-01_0";

// Calculating Data
function AvgData(list) {
    const avg = list.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / list.length;
    return avg
}

function SumData(list) {
    const sum = list.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
    return sum
}

//Select time duration
function getSelectedTime() {
    // Get the selected value from the dropdown
    var select = document.getElementById("timeSelect");
    var selectedTime = select.options[select.selectedIndex].value;

    // Format the selected value as "2016-06-01_{value}"
    queryTime = "2016-06-01_" + selectedTime;

    // Display the result
    var time_div = document.getElementById("time-value");
    time_div.textContent = select.options[select.selectedIndex].innerHTML;
    console.log(queryTime);
    FetchData(queryTime);
}

// Showing data on webpage
function ShowData(list, divID, postfix) {
    let data = 0;
    if (list == tempList || list == humidList) {
        data = AvgData(list);
    } else {
        data = SumData(list);
    }
    const div = document.getElementById(`${divID}`);
    div.innerHTML = data.toFixed(2) + postfix;
}

function parseCSV(csvData) {
    const lines = csvData.split('\n');
    const headers = lines[0].split(','); // Assuming the first line contains headers
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i].split(',');
        if (currentLine.length === headers.length) {
            const dataObject = {};
            for (let j = 0; j < headers.length; j++) {
                // Use trim() to remove leading/trailing whitespace, including newline characters
                dataObject[headers[j].trim()] = currentLine[j].trim();
            }
            result.push(dataObject);
        }
    }

    return result;
}


function decompressGzip(gzipData) {
    try {
        const compressedBytes = gzipData.toUint8Array();
        const inflatedData = pako.inflate(compressedBytes, { to: 'string' });
        const parseData = parseCSV(inflatedData);
        return parseData;
    } catch (error) {
        console.error("Error during decompression: ", error);
        return null; // Handle the error as needed
    }
}





const time_btn = document.getElementById('time-submit');
time_btn.addEventListener('click', getSelectedTime);



function renderLineChart(timestampList, accumulatedNetList) {
    
    const ctx = document.getElementById('line-chart').getContext('2d');
    if (window.lineChart) {
        window.lineChart.destroy(); // Destroy the existing chart
    }
    window.lineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timestampList,
                datasets: [{
                    label: 'Accumulated Net Energy',
                    data: accumulatedNetList
                }]
            },
            options: {
                maintainAspectRatio: true,
                scales: {
                    x: {},
                    y: {
                        max: 1000,
                        display: true,
                        title: {
                            display: true,
                            text: 'Accumulated Net Energy',
                            color: '#000000',
                            font: {
                                family: 'Times',
                                size: 16,
                                style: 'normal',
                                lineHeight: 1.2
                        },
                        padding: {top: 30, left: 0, right: 0, bottom: 0}
                    }
                    },
                },
            }
        });
};

// Retrieving Data
// Modify the FetchData function to accumulate net energy and timestamps

function FetchData(docId) {
    console.log("Retrieving data for document with ID:", docId);

    const yesterdayDocRef = doc(archiveCol, docId);

    getDoc(yesterdayDocRef)
    .then((docSnapshot) => {
        if (docSnapshot.exists) {
            const data = docSnapshot.data();
            if (data && data.data) {
                const gzipData = data.data;
                // Decompress gzip data
                const decomData = decompressGzip(gzipData);

                if (decomData) {
                    let accumulatedNet = 0; // Initialize accumulated net energy
                    let i = 0;
                    const accumulatedNetList = [];

                    const arrayRange = (start, stop, step) =>
                        Array.from(
                        { length: (stop - start) / step + 1 },
                        (value, index) => start + index * step
                        );
                    const timestampList = arrayRange(1, 60, 1);

                    for (const dataPoint of decomData) {
                    
                        // Calculate and store accumulated net energy for each minute
                        accumulatedNet += parseFloat(dataPoint.net);

                        i++;
                        if (i%10 == 0){
                            accumulatedNetList.push(accumulatedNet);
                        }
                    }
                    
                    // Call a function to update your Chart.js chart with the new data
                    chartJsScript.onload = renderLineChart(timestampList, accumulatedNetList);
                }
            } else {
          console.log("No data field found in the document.");
            }
        } else {
            console.log("Document with ID not found.");
        }
    })
    .catch((error) => {
        console.error("Error fetching data: ", error);
    });
}

FetchData(queryTime);