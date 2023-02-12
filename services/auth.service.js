const { dataSource } = require("../helpers/data-source");
const jwt = require("jsonwebtoken");
const { CustomError } = require("../helpers/custom-error");

const clientRepository = dataSource.getRepository("client");
const bcrypt = require("bcrypt");
const {connectRedis} = require("../helpers/redis-client");
const {error_codes, messages, return_codes} = require("../helpers/constants");

// redis connection
let redisClient = {};
connectRedis().then((res) => {
    redisClient = res;
}).catch(() => {
    console.log("connect redis failed!")
});

exports.getClientByClientIdAndSecret = async (client_id, client_secret) => {
    const q_client_secret = jwt.sign(client_secret, process.env.JWT_SECRET);

    return clientRepository.findOneBy({
        client_id: client_id,
        client_secret: q_client_secret,
        is_disabled: 0,
        is_deleted: 0
    });
}

exports.getClientByClientId = async (client_id) => {
    return await clientRepository.findOneBy({
        client_id: client_id,
        is_disabled: 0,
        is_deleted: 0
    });
}

exports.createClient = async (client) => {
    return await clientRepository.save(client);
}

exports.updateClient = async (client) => {
    await clientRepository.save(client);
}

exports.getClientById = async (id, is_disabled = null) => {
    if (is_disabled === null) {
        return await clientRepository.findOneBy({
            id: id,
            is_deleted: 0
        });
    } else {
        return await clientRepository.findOneBy({
            id: id,
            is_deleted: 0,
            is_disabled: is_disabled
        })
    }
}

exports.genPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

exports.genCode = async () => {
    const code_bcrypt = await bcrypt.genSalt(10);
    const code = await jwt.sign(
        {
            data: code_bcrypt
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.CODE_URL_JWT_EXPIRED
        }
    );

    await redisClient.set(`${code}`, '1', {
        EX: Number(process.env.CODE_URL_JWT_EXPIRED) / 1000
    });

    return code;
}

exports.isCodeActive = async (code) => {
    let isJwtActive = await redisClient.get(`${code}`);
    return jwt.verify(code, process.env.JWT_SECRET) && !Number(isJwtActive);
}