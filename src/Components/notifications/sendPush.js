import admin from 'firebase-admin';
import serviceAccount from '../../../pu-smart-tracker-firebase-adminsdk-fbsvc-fbe91e2197.json' assert { type: 'json' };

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const token = 'cGVSWVUGQ0WWCt3PRMYGIo:APA91bEePe-KxW6qW-FHMXkdt3FNRekF5cG0Or5M6MzTVuj4lmC36V2qgANNpGnf1EwyFLkAmBMlupV7nMAXiul0GT1OOQRH-eqsmc7jeJ7eVC70lPCbX-w';

const message = {
    token: token,
    notification: {
        title: 'Hello!',
        body: 'This is a test push notification.'
    }
};

admin.messaging().send(message)
    .then(response => console.log('Message sent successfully:', response))
    .catch(error => console.log('Error sending message:', error));
