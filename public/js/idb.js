// Variable to hold db connection
let db;

// Make a connection with indexedDB database called 'budget_tracker' and set to version 1
const request = indexedDB.open('budget_tracker', 1);

// open objectstore with this request
request.onupgradeneeded = function(event) {
    db = event.target.result;
    db.createObjStore('new_transaction', { autoIncrement: true });
};

// with a successful request...
request.onsuccess = function(event) {
    db = event.target.result;
    if (window.navigator.onLine) {
        console.log('Success!');
        findRecord();
    }
};

// request with an error
request.onerror = function(event) {
    console.log(event.target.error);
};