const {EntitySchema} = require("typeorm");

module.exports = new EntitySchema({
    name: "client",
    tableName: "client",
    columns: {
        id: {
            primary:  true,
            type: 'int',
            generated: true
        },
        client_id: {
            type: 'varchar',
            length: 255,
            unique: true,
        },
        client_secret: {
            type: 'varchar',
            length: 500,
        },
        redirect_uri: {
            type: 'varchar',
            nullable: true,
            length: 200,
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
            updateDate: true
        },
        private_key: {
            type: 'text',
        },
        public_key: {
            type: 'text',
        },
    },
    indices: [
        {
            name: 'clientid_index',
            columns: ['client_id']
        },
        {
            name: 'clientsecret_index',
            columns: ['client_secret']
        },
    ]
});