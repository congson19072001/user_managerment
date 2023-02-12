const { dataSource } = require("../helpers/data-source");
const userRepository = dataSource.getRepository("user");

exports.getActiveUserByEmail = async function (email, isActive = true) {
    let user = await userRepository
        .findOneBy({
            email: email,
            is_activated: isActive,
            is_deleted: 0,
            is_disabled: 0
        });

    return user;
}

exports.getActiveUserByUsername = async function (username, isActive = true) {
    let user = await userRepository
        .findOneBy({
            username: username,
            is_activated: isActive,
            is_deleted: 0,
            is_disabled: 0
        });

    return user;
}

exports.getUserByUsername = async function(username) {
    let user = await userRepository
        .findOneBy({
            username: username,
            is_deleted: 0,
        });
    return user;
}

exports.updateCodeByEmail = async function (code, email) {
    await userRepository.update({ email }, {
        code
    });
}

exports.updateWalletById = async function (userId, wallet) {
    await userRepository.update({ id: userId }, {
        wallet
    });
}

exports.getActiveUserByWallet = async function (wallet, isActive = true) {
    let user = await userRepository.findOneBy({
        wallet: wallet,
        is_activated: isActive,
        is_deleted: 0,
        is_disabled: 0
    });

    return user;
}

exports.getActiveUserByCode = async function (code, isActive = true) {
    console.log(code);
    let user = await userRepository.findOneBy({
        code: code,
        is_activated: isActive,
        is_deleted: 0,
        is_disabled: 0
    });

    return user;
}

exports.getActiveUserById = async function (userId, isActive = true, isFull = false) {
    let user = await userRepository
        .findOneBy({
            id: userId,
            is_activated: isActive,
            is_deleted: 0,
            is_disabled: 0
        });

    if (!isFull && user) {
        delete user.password;
        delete user.code;
    }
    return user;
}

exports.getUserById = async function (userId, isFull = false) {
    let user = await userRepository
        .findOneBy({
            id: userId
        });

    if (!isFull && user) {
        delete user.password;
        delete user.code;
    }
    return user;
}

exports.deleteUserById = async function(userId) {
    return await userRepository.delete(userId);
}

exports.getUserByEmail = async function (email, isActive = true, isFull = false) {
    let user = await userRepository
        .findOneBy({
            email: email,
            is_activated: isActive,
            is_deleted: 0,
        });

    if (!isFull && user) {
        delete user.password;
        delete user.code;
    }
    return user;
}

exports.getFullUserByEmail = async function (email, isFull = false) {
    let user = await userRepository
        .findOneBy({
            email: email,
            is_deleted: 0,
        });

    if (!isFull && user) {
        delete user.password;
        delete user.code;
    }
    return user;
}

exports.updatePassById = async function (userId, password) {
    await userRepository.update({ id: userId }, {
        password
    });
}

exports.updatePassByCode = async function (code, password) {
    await userRepository.update({ code }, {
        password
    });
}

exports.updateIsActiveByCode = async function (code, isActive) {
    await userRepository.update({ code }, {
        is_activated: isActive
    });
}

exports.createUser = async function (user) {
    const newUser = await userRepository.save(user);
    delete newUser.password;
    delete newUser.code;

    return newUser;
}

exports.updateUser = async function(user) {
    const updatedUser = await userRepository.save(user);
    delete updatedUser.password;
    delete updatedUser.code;

    return updatedUser;
}

exports.getUserByRequest = async function (data, isActive = true) {
    if (data.email) {
        return this.getActiveUserByEmail(data.email, isActive);
    }

    if (data.username) {
        return this.getActiveUserByUsername(data.username, isActive);
    }

    if (data.wallet) {
        return this.getActiveUserByWallet(data.wallet, isActive);
    }

}

exports.getNoOfUser = async function(client_id) {
    return await userRepository.count({
        where: {
            client_id: client_id,
            is_activated: 1,
        }
    });
}

