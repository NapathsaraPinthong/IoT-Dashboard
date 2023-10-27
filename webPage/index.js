getDocs(tempCol).then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
    const data = doc.data();
    console.log(data);
    //const div = document.getElementById("your_div_id");
    //div.innerHTML = JSON.stringify(data);
});
})
.catch((error) => {
console.error("Error getting documents: ", error);
});