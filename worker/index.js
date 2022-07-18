const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

const sub = redisClient.duplicate();

function fib(num) {
    if(num < 2) {
        return 1;
    }

    return fib(num - 1) + fib(num - 2);
}

sub.on('message', (channel, message) => {
    console.log('PROCESSING NUM: ', message);
    redisClient.hset('values', message, fib(parseInt(message)));
})

sub.subscribe('insert');