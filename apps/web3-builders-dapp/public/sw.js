self.addEventListener('push', (event)=>{
    if(event.data){
        const data = event.data.json();
        console.log('Push received' );

const options = {
    body: data.body,
    icon: data.icon,
    data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
        url: data.url
    }
}


event.waitUntil(self.registration.showNotification(data.title, options));
    }
});

self.addEventListener('notificationclick', (event)=>{
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data.url));
});



self.addEventListener('notificationclose', (event)=>{
    console.log('Notification closed');
})