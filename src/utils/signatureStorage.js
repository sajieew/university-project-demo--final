const DATABASE_NAME = 'uniportal-signatures';
const STORE_NAME = 'signature-images';
const DATABASE_VERSION = 1;

const openDatabase = () => new Promise((resolve, reject) => {
  if (!('indexedDB' in window)) {
    reject(new Error('This browser does not support persistent signature uploads.'));
    return;
  }

  const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
  request.onupgradeneeded = () => {
    const database = request.result;
    if (!database.objectStoreNames.contains(STORE_NAME)) {
      database.createObjectStore(STORE_NAME);
    }
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error || new Error('Unable to open signature storage.'));
});

const runTransaction = async (mode, operation) => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = operation(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Signature storage operation failed.'));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error('Signature storage transaction failed.'));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error || new Error('Signature storage transaction was aborted.'));
    };
  });
};

export const getSignatureImage = (applicationId, section) =>
  runTransaction('readonly', store => store.get(`${applicationId}:${section}`));

export const saveSignatureImage = (applicationId, section, image) =>
  runTransaction('readwrite', store => store.put(image, `${applicationId}:${section}`));

export const removeSignatureImage = (applicationId, section) =>
  runTransaction('readwrite', store => store.delete(`${applicationId}:${section}`));
