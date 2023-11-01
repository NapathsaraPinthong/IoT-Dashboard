// Import the needed functions from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-analytics.js";
import { getFirestore, collection, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
import pako from "https://cdn.jsdelivr.net/npm/pako@2.1.0/+esm";

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
var time = "";

// Calculating Data
function AvgData(list) {
    const avg = list.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / list.length;
    return avg
}

function SumData(list) {
    const sum = list.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
    return sum
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




// Retrieving Data
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
                console.log(decomData);
                //console.log(decomData[0].humidity);



                
                /*
                tempList.push(decomData.temperature);
                humidList.push(decomData.humidity);
                genList.push(decomData.gen);
                useList.push(decomData.use);
                netList.push(decomData.net);
                date = decomData.date;
                time = decomData.time;

                // Update the webpage with the retrieved data
                ShowData(tempList, "temp-value", " °C");
                ShowData(humidList, "humid-value", " %");
                ShowData(genList, "gen-value", " kW");
                ShowData(useList, "use-value", " kW");
                ShowData(netList, "net-value", " kW");
                const date_div = document.getElementById("date-value");
                const time_div = document.getElementById("time-value");
                date_div.innerHTML = date;
                time_div.innerHTML = time;
                */
                
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

const yesterdayId = "2016-06-01_0";
FetchData(yesterdayId);