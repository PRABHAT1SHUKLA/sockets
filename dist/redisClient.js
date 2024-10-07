"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const client = (0, redis_1.createClient)({
    url: 'redis://redis:6379' // we'll create the docker image later
});
client.on('error', (err) => {
    console.error('Redis Client Error', err);
});
client.connect();
exports.default = client;
