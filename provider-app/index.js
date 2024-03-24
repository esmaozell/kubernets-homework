const express = require("express");
const amqp = require('amqplib');
const port = 3001;
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

app.get('/name/:name', async (req, res) => {
    const { name } = req.params;

    try {
        await sendRabbitMq(name);
        return res.status(200).send("Message sent to RabbitMQ");
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send("Internal Server Error");
    }
});

async function sendRabbitMq(message) {
    try {
        const connection = await amqp.connect('amqp://rabbitmq-service:5672');
        const channel = await connection.createChannel();
        await channel.assertQueue('query');
        await channel.sendToQueue("query", Buffer.from(JSON.stringify({ name: message }))); 
       
    } catch (error) {
        console.error("Error:", error);
        throw error; 
    }
}
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
