const {EntitySchema} = require("typeorm");

module.exports = new EntitySchema({
    name: "user",
    tableName: "user",
    columns: {
        id: {
            primary:  true,
            type: 'int',
            generated: true
        },
        first_name: {
            type: 'varchar',
            length: 100,
            nullable: true,
        },
        last_name: {
            type: 'varchar',
            length: 100,
            nullable: true,
        },
        avatar_url: {
            type: 'varchar',
            length: 255,
            nullable: true,
        },
        background_url: {
            type: 'varchar',
            length: 255,
            nullable: true,
        },
        username: {
            type: 'varchar',
            length: 256,
            unique: true,
            nullable: true,
        },
        email: {
            type: 'varchar',
            length: 256,
            unique: true,
        },
        password: {
            type: 'varchar',
            length: 255,
        },
        is_activated: {
            type: 'tinyint',
            default: 1,
            nullable: true,
        },
        is_disabled: {
            type: 'tinyint',
            default: 0,
            nullable: true,
        },
        is_deleted: {
            type: 'tinyint',
            default: 0,
            nullable: true,
        },
        date_created: {
            type: 'datetime',
            nullable: true,
            createDate: true
        },
        date_updated: {
            type: 'datetime',
            nullable: true,
            updateDate: true,
        },
        wallet: {
            type: 'varchar',
            length: 255,
            nullable: true,
            unique: true,
        },
        role: {
            type: 'varchar',
            length: 45,
            nullable: true,
        },
        code: {
            type: 'varchar',
            length: 255,
            nullable: true,
        },
        client_id: {
            type: 'int',
            nullable: true,
        }
    },
    indices: [
        {
            name: 'email_index',
            columns: ['email']
        },
        {
            name: 'username_index',
            columns: ['username']
        },
        {
            name: 'wechatopenid_index',
            columns: ['first_name']
        },
        {
            name: 'wallet_index',
            columns: ['wallet']
        }
    ]
});