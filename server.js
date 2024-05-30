// server.js

const express = require("express");
const webpush = require("web-push");
const cors = require('cors');
const dotenv = require("dotenv");
dotenv.config();

const app = express();

// Define allowed origin (replace with your client domain)
const allowedOrigin = 'http://localhost';

app.use(cors({
/*  origin: allowedOrigin,
  methods: ['GET', 'POST'], // Allowed methods
  headers: ['Content-Type', 'Authorization'], // Allowed headers*/
}));


const publicKey = Buffer.from(process.env.VAPID_PUBLIC_KEY, "utf-8"); // Replace with your key
const publicEncodedKey = Buffer.from(publicKey).toString("base64url");

const privateKey = Buffer.from(process.env.VAPID_PRIVATE_KEY, "utf-8"); // Replace with your key
const privateEncodedKey = Buffer.from(privateKey).toString("base64url");

console.log(publicEncodedKey);
console.log(privateEncodedKey);


const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
};

webpush.setVapidDetails(
    "mailto:your-support-email@example.com", // Replace with your email address
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

let subscriptions = [];

app.get("/get_keys", (req, res) => {
  //return public key
  res.json({publicKey: publicEncodedKey, privateKey: privateEncodedKey});

});

app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);

  res.status(201).json({status: "success"});
});

app.post("/send-notification", (req, res) => {
  const notificationPayload = {
    title: "New Notification",
    body: "This is a new notification",
    icon: "https://some-image-url.jpg",
    data: {
      url: "https://example.com",
    },
  };

  Promise.all(
    subscriptions.map((subscription) =>
      webpush.sendNotification(subscription, JSON.stringify(notificationPayload))
    )
  )
    .then(() => res.status(200).json({ message: "Notification sent successfully." }))
    .catch((err) => {
      console.error("Error sending notification");
      res.sendStatus(500);
    });
});

app.listen(4000, () => {
  console.log("Server started on port 4000");
});

