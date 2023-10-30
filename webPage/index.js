// Import the needed functions from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-analytics.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

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

// Collection of data
const tempList = [];
const humidList = [];
const genList = [];
const useList = [];
const netList = [];

// Retriving Data
function test() {
    console.log("testtt")
    const tempCol = collection(db, 'temporary');
    getDocs(tempCol).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            tempList.push(data.temperature);
            humidList.push(data.humidity);
            genList.push(data["gen [kW]"]);
            useList.push(data["use [kW]"]);
            netList.push(data["net [kW]"]);
        });
    })
        .catch((error) => {
            console.error("Error getting documents: ", error);
        });
}

const test_btn = document.getElementById('test-btn');
test_btn.addEventListener('click', test)

// Calculating Data
function AvgData(list) {
    const avg = list.reduce((a, b) => a + b, 0) / list.length;
    return avg
}

function SumData(list) {
    const sum = list.reduce((a, b) => a + b, 0);
    return sum
}


// Showing data on webpage
function ShowData(list, divID, postfix) {
    let data = 0;
    if (list == tempList) {
        data = AvgData(list);
    } else if (list == humidList) {
        data = 100 * AvgData(list);
    }
    else {
        data = SumData(list);
    }
    const div = document.getElementById(`${divID}`);
    div.innerHTML = data.toFixed(2) + postfix;
}

ShowData(tempList, "temp-value", " °C");
ShowData(humidList, "humid-value", " %");
ShowData(genList, "gen-value", " kW");
ShowData(useList, "use-value", " kW");
ShowData(netList, "net-value", " kW");
