const amqp = require('amqplib');
const mysql = require("mysql2");

const dbConnection = mysql.createPool({
    connectionLimit: 10,
    host: "mysql-service",
    user: "root",
    password: "password",
    database: "devopsakademi",
});

dbConnection.getConnection((err, connection) => {
    if (err) {
        console.log("error connecting to database");
    } else {
        console.log("connected to database");
    }
});

async function consumeRabbitMq() {
    try {
        const rabbitmqConnection = await amqp.connect('amqp://10.104.100.10:5672');
        const channel = await rabbitmqConnection.createChannel();
        await channel.assertQueue("query", { durable: true });

        console.log("Waiting for messages in the queue...");

        channel.consume("query", function (message) {
            if (message !== null) {
                try {
                    const { name } = JSON.parse(message.content.toString()); // Mesajı doğrudan JSON olarak ayrıştır
                    const pgCommand = `INSERT INTO Names (name) VALUES (?)`; 
                    dbConnection.query(pgCommand, [name], (err, result) => {
                        if (err) {
                            console.error('Database query error:', err.stack);
                        }else{
                            console.log("Eklendi");
                        }
                         
                    });

                    channel.ack(message);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            }
        });
    } catch (error) {
        console.error("Error:", error);
    }
}


consumeRabbitMq();
