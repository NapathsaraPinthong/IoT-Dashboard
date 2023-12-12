const chartJsScript = document.createElement('script');
chartJsScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
document.head.appendChild(chartJsScript);

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-analytics.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyA0yQ8OHzvWLLV012WbT1juEyYDNDmr9jg",
    authDomain: "test2-iotdashboard.firebaseapp.com",
    projectId: "test2-iotdashboard",
    storageBucket: "test2-iotdashboard.appspot.com",
    messagingSenderId: "671987302107",
    appId: "1:671987302107:web:5bd61f97f4a2cb1bd596fe",
    measurementId: "G-D7N3MRDL7F"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app);

const collectionName = 'primary';

// Define the start and end time for the query
const date = '1/6/2016';
const startTime = '21:00:00';
const endTime = '22:00:00';
let accumulatedNet = 0; // Initialize accumulated net energy
let i = 0;
const accumulatedNetList = [];

const arrayRange = (start, stop, step) =>
        Array.from(
            { length: (stop - start) / step + 1 },
            (value, index) => start + index * step
        );
const timestampList = arrayRange(1, 60, 1);

// Create a reference to the collection
const collectionRef = collection(db, collectionName);

// Record the start time
const startResTime = performance.now();

// Perform the query
const q = query(collectionRef, where('date', '==', date), where('time', '>=', startTime), where('time', '<', endTime));

getDocs(q)
  .then((snapshot) => {
    // Process the query results
    snapshot.forEach((doc) => {
      const data = doc.data();
    
    // Calculate and store accumulated net energy for each minute
        accumulatedNet += parseFloat(data.net);
        i++;
        if (i % 10 == 0) {
            accumulatedNetList.push(accumulatedNet);
        }
    });
    // Call a function to update Chart.js chart with the new data
    chartJsScript.onload = renderLineChart(timestampList, accumulatedNetList)

    // Record the end time
    const endResTime = performance.now();
    console.log(endResTime-startResTime);  

  })
  .catch((error) => {
    console.error('Error getting documents: ', error);
  });


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