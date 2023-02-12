const { dataSource } = require("../helpers/data-source");
const jwt = require("jsonwebtoken");
const { CustomError } = require("../helpers/custom-error");
const nodemailer = require("nodemailer");

exports.sendMail = async (email, subject, html) => {
    var transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    var mailOptions = {
        from: 'Polkafantasy <testmail@polkafantasy.com>',
        to: email,
        subject: subject,
        html: html
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
    }
}