//Import the needed functions from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-analytics.js";
import { getFirestore, collection, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
import pako from "https://cdn.jsdelivr.net/npm/pako@2.1.0/+esm";

const chartJsScript = document.createElement('script');
chartJsScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
document.head.appendChild(chartJsScript);


const firebaseConfig = {
    apiKey: "AIzaSyCOkHMkvDkUT9cN2VKgP0j_NdK3hx-bw3o",
    authDomain: "iot-dashboard-final.firebaseapp.com",
    projectId: "iot-dashboard-final",
    storageBucket: "iot-dashboard-final.appspot.com",
    messagingSenderId: "658455397004",
    appId: "1:658455397004:web:8c6ac082a76955989cf1a9",
    measurementId: "G-YMD309505H"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const archiveCol = collection(db, 'archive');

var queryTime = "2016-06-01_0";

//Select time duration
function getSelectedTime() {
    // Get the selected value from the dropdown
    var select = document.getElementById("timeSelect");
    var selectedTime = select.options[select.selectedIndex].value;

    queryTime = "2016-06-01_" + selectedTime;

    // Display the result
    var time_div = document.getElementById("time-value");
    time_div.textContent = select.options[select.selectedIndex].innerHTML;
    console.log(queryTime);
    FetchData(queryTime);
}

function parseCSV(csvData) {
    const lines = csvData.split('\n');
    const headers = lines[0].split(','); // The first line contains headers
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i].split(',');
        if (currentLine.length === headers.length) {
            const dataObject = {};
            for (let j = 0; j < headers.length; j++) {
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
        return null; 
    }
}


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
                        padding: { top: 30, left: 0, right: 0, bottom: 0 }
                    }
                },
            },
        }
    });
};

// Retrieving Data
function FetchData(docId) {
    console.log("Retrieving data for document with ID:", docId);
    const yesterdayDocRef = doc(archiveCol, docId);

    // Record the start time
    const startTime = performance.now();

    getDoc(yesterdayDocRef)
        .then((docSnapshot) => {

            if (docSnapshot.exists) {
                const data = docSnapshot.data();
                if (data && data.data) {
                    const gzipData = data.data;

                    // Record the start time for decompression
                    const decomStartTime = performance.now();

                    // Decompress gzip data
                    const decomData = decompressGzip(gzipData);

                    // Record the end time for decompression
                    const decomEndTime = performance.now();

                    // Calculate and log the decompression time
                    const decomTime = decomEndTime - decomStartTime;
                    console.log('Decompression Time:', decomTime, 'milliseconds');

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
                            if (i % 10 == 0) {
                                accumulatedNetList.push(accumulatedNet);
                            }
                        }
                        // Call a function to update Chart.js chart with the new data
                        chartJsScript.onload = renderLineChart(timestampList, accumulatedNetList);
                        
                        // Record the end time
                        const endTime = performance.now();

                        // Calculate and log the response time
                        const queryResponseTime = endTime - startTime;
                        console.log('Response Time:', queryResponseTime, 'milliseconds');

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

const time_btn = document.getElementById('time-submit');
time_btn.addEventListener('click', getSelectedTime);
FetchData(queryTime);