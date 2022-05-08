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

// save record
function saveRecord(record) {
    // create transaction in objectstore
    const createTransaction = db.transaction('new_transaction', 'readwrite');
    // create access to the objectstore
    const accessStore = createTransaction.objectStore('new_transaction');
    // store record
    accessStore.add(record);
};

// get record
function findRecord() {
    // create transaction in objectstore
    const createTransaction = db.transaction('new_transaction', 'readwrite');
    // create access to the objectstore
    const accessStore = createTransaction.objectStore('new_transaction');
    // get every record from objectstore
    const allRecords = accessStore.allRecords();
    console.log(allRecords);

    // if getting records is successful, post them
    allRecords.onsuccess = function() {
        if (allRecords.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(allRecords.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            // clear indexdb storage
            .then(response => response.json())
            .then(() => {
                const clearTransaction = db.transaction([ 'new_transaction' ], 'readwrite');
                const clearStore = clearTransaction.objectStore('new_transaction');
                clearStore.clear();
            });
        }
    };
};

window.addEventListener('online', findRecord);