// Import the needed functions from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-analytics.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

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
const tempCol = collection(db, 'temporary');

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

function findMostFrequest(arr) {
    let compare = "";
    let mostFreq = "";
    
    arr.reduce((acc, val) => {
      if(val in acc){               // if key already exists
         acc[val]++;                // then increment it by 1
      }else{
         acc[val] = 1;      // or else create a key with value 1
      }
      if(acc[val] > compare){   // if value of that key is greater
                                // than the compare value.
         compare = acc[val];    // than make it a new compare value.
         mostFreq = val;        // also make that key most frequent.
      }
      return acc;
    }, {})
}


// Showing data on webpage
function ShowData(list, divID, postfix) {
    let data = 0;
    if (list == tempList) {
        data = AvgData(list);
        if(round(data) = 11) {
            data = "31 - 33"
        }
    } else if (list == humidList){
        data = findMostFrequest(list);
    }
    else {
        data = SumData(list).toFixed(2);
    }
    const div = document.getElementById(`${divID}`);
    div.innerHTML = data + postfix;
}

// Retrieving Data
function FetchData() {
    console.log("Retrieving data")
    getDocs(tempCol).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            tempList.push(data.temperture);
            humidList.push(data.humidity);
            genList.push(data.gen);
            useList.push(data.use);
            netList.push(data.net);
            date = data.date;
            time = data.time;
        });

        ShowData(tempList, "temp-value", " °C");
        ShowData(humidList, "humid-value", " %");
        ShowData(genList, "gen-value", " kW");
        ShowData(useList, "use-value", " kW");
        ShowData(netList, "net-value", " kW");
        const date_div = document.getElementById("date-value");
        const time_div = document.getElementById("time-value");
        date_div.innerHTML = date;
        time_div.innerHTML = time;
    })
        .catch((error) => {
            console.error("Error getting documents: ", error);
        });
}

FetchData();


// Schedule to run the compressData function hourly
function CompressData() {
    console.log("Compressing and archiving data...");

    let querySnapshot; 
    getDocs(tempCol)
        .then((tempColSnapshot) => {
            querySnapshot = tempColSnapshot; 

            if (querySnapshot.empty) {
                console.log("No data in the temporary collection to compress and archive.");
                return;  
            }

            const jsonData = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                jsonData.push(data);
            });

            //Gzip the JSON data
            const jsonString = JSON.stringify(jsonData);
            const uint8Array = pako.deflate(jsonString, { to: 'string' }); 
            const gzippedDataBase64 = btoa(uint8Array);

            // Extract the hour from the time of the first document
            const documentDate = new Date(jsonData[0].date); 
            const year = documentDate.getFullYear();
            const month = (documentDate.getMonth() + 1).toString().padStart(2, '0'); 
            const day = documentDate.getDate().toString().padStart(2, '0');
            const hour = jsonData[0].time.split(":")[0];

            // Create the document ID in the desired format
            const documentId = `${year}-${day}-${month}_${hour}`;

            // Update the archive collection with the gzipped data and the custom document ID
            return setDoc(doc(archiveCol, documentId), { data: gzippedDataBase64 });

        })
        .then(() => {
            // Clear the temporary collection after successful archiving
            querySnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });
        })
        .catch((error) => {
            console.error("Error in CompressData: ", error);
        });
}
setInterval(CompressData, 3600000);
