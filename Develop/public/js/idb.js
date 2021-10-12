const request = indexedDB.open('budget-tracker', 1);
let db;

request.onupgradeneeded = function(event) {

    const db = event.target.result;
    db.createObjectStore('new_balance', { autoIncrement: true });

};

request.onsuccess = function(event) {
    
    db = event.target.result;
    if (navigator.onLine) {
      updateBalance();
    }

};

request.onerror = function(event) {

    console.log(event.target.errorCode);

};

function saveRecord(record) {

    const transaction = db.transaction(['new_balance'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_balance');
    budgetObjectStore.add(record);

};

function updateBalance() {

    const transaction = db.transaction(['new_balance'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_balance');
    const getAll = budgetObjectStore.getAll();
  
    getAll.onsuccess = function() {
      
      if (getAll.result.length > 0) {
        fetch('/api/transaction/bulk', {
          method: 'POST',
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          }
        })

          .then(response => response.json())
          .then(serverResponse => {
            if (serverResponse.message) {
              throw new Error(serverResponse);
            }
  
            const transaction = db.transaction(['new_balance'], 'readwrite');
            const budgetObject = transaction.objectStore('new_balance');
            budgetObject.clear();
          })

          .catch(err => {
            console.log(err);
          });
      };
    };
  };
  

  window.addEventListener('online', updateBalance);


  
