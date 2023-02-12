"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitDatabases1665737574741 = void 0;
class InitDatabases1665737574741 {
    constructor() {
        this.name = 'InitDatabases1665737574741';
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`first_name\` varchar(100) NULL, \`last_name\` varchar(100) NULL, \`avatar_url\` varchar(255) NULL, \`background_url\` varchar(255) NULL, \`username\` varchar(256) NULL, \`email\` varchar(256) NOT NULL, \`password\` varchar(255) NOT NULL, \`is_activated\` tinyint NULL DEFAULT '1', \`is_disabled\` tinyint NULL DEFAULT '0', \`is_deleted\` tinyint NULL DEFAULT '0', \`date_created\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6), \`date_updated\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`wallet\` varchar(255) NULL, \`role\` varchar(45) NULL, \`code\` varchar(255) NULL, \`client_id\` int NULL, INDEX \`email_index\` (\`email\`), INDEX \`username_index\` (\`username\`), INDEX \`wechatopenid_index\` (\`first_name\`), INDEX \`wallet_index\` (\`wallet\`), UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`), UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), UNIQUE INDEX \`IDX_5f6f511ea673346697a431de82\` (\`wallet\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
            yield queryRunner.query(`CREATE TABLE \`client\` (\`id\` int NOT NULL AUTO_INCREMENT, \`client_id\` varchar(255) NOT NULL, \`client_secret\` varchar(500) NOT NULL, \`redirect_uri\` varchar(200) NULL, \`is_disabled\` tinyint NULL DEFAULT '0', \`is_deleted\` tinyint NULL DEFAULT '0', \`date_created\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6), \`date_updated\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`private_key\` text NOT NULL, \`public_key\` text NOT NULL, INDEX \`clientid_index\` (\`client_id\`), INDEX \`clientsecret_index\` (\`client_secret\`), UNIQUE INDEX \`IDX_7510ce0a84bde51dbff978b4b4\` (\`client_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`DROP INDEX \`IDX_7510ce0a84bde51dbff978b4b4\` ON \`client\``);
            yield queryRunner.query(`DROP INDEX \`clientsecret_index\` ON \`client\``);
            yield queryRunner.query(`DROP INDEX \`clientid_index\` ON \`client\``);
            yield queryRunner.query(`DROP TABLE \`client\``);
            yield queryRunner.query(`DROP INDEX \`IDX_5f6f511ea673346697a431de82\` ON \`user\``);
            yield queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
            yield queryRunner.query(`DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` ON \`user\``);
            yield queryRunner.query(`DROP INDEX \`wallet_index\` ON \`user\``);
            yield queryRunner.query(`DROP INDEX \`wechatopenid_index\` ON \`user\``);
            yield queryRunner.query(`DROP INDEX \`username_index\` ON \`user\``);
            yield queryRunner.query(`DROP INDEX \`email_index\` ON \`user\``);
            yield queryRunner.query(`DROP TABLE \`user\``);
        });
    }
}
exports.InitDatabases1665737574741 = InitDatabases1665737574741;
