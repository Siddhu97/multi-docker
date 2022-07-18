const keys = require("./keys");

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const redis = require("redis");

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
})

const redisPublisher = redisClient.duplicate();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const { Pool } = require("pg");

const pgClient = new Pool({
    user: keys.pgUser,
    password: keys.pgPassword,
    host: keys.pgHost,
    port: keys.pgPort,
    database: keys.pgDatabase
});

pgClient.on("error", (err) => {
    console.log("Failed to connect to database ", err);
})

pgClient.on("connect", (client) => {
    client.query("CREATE TABLE IF NOT EXISTS values (number INT)")
        .catch(err => console.log("Failed to run the query:", err));
})

app.get("/", (req, res) => {
    res.send("Hi!");
})

app.get("/values/all", async (req, res) => {
    const values = await pgClient.query("SELECT * FROM values");
    console.log('All values from table: ', values);

    res.send(values.rows);
})

app.get("/values/current", (req, res) => {
    redisClient.hgetall("values", (err, values) => {
        res.send(values);
    })
})

app.post("/values", (req, res) => {
    var ind = req.body.index;

    if(ind > 40) {
        res.status(422).send("Index value too high!");
        return;
    }

    redisClient.hset("values", ind, "Nothing yet!");
    redisPublisher.publish("insert", ind);
    pgClient.query("INSERT INTO values(number) VALUES ($1)", [ind]);

    res.send({ working: true })
})

app.listen(5000, err => {
    if(!err) {
        console.log("Listening");
    } else {
        console.log("Connection error for server", err);
    }
})