const register = function (url) {
    const html =
    `<meta charset = "UTF-8">
    <head>
        <style>
            .container{
                width: 50%;
                backgroung-color: #DDDDDD;
            }
            .button{
                padding: 15px 45px;
                background-color: #3399cc;
                color: #fff;
                border: none;
            }
            .button:hover {
                cursor: pointer;
            }
            @media screen and (max-width: 1500px) {
                .container{
                    width: 100%;
                    backgroung-color: #DDDDDD;
                }
            }
        </style>
    </head>
    <body>
        <div style='min-height: max-content;'>
            <div class="container">                   
                <p style='line-height: 40px;width: 100%;text-align: center; background-color: #EEEEEE; margin: 0;'>*** This is an automatically generated email, please do not reply ***</p>
                <div style='padding: 2% 15% 2% 15%; background-color: #fff; color: #000 !important;'>
                    <h1 style='text-align: center;'>Register successful.</h1>
                    <p>We would like to inform you that your account has been registered successfully on our platform Please click the button below to activate account.</p>    
                    <table border="0" cellpadding="0" cellspacing="0" style="background-color:#766fca; border-radius:5px; margin-left:auto; margin-right:auto;">
                        <tr>
                            <td align="center" valign="middle" style="color:#FFFFFF; font-family:Helvetica, Arial, sans-serif; font-size:16px; font-weight:bold; padding-top:15px; padding-bottom:15px;">
                                <a href="` +url+`" target="_blank" style="color:#FFFFFF; text-decoration:none; padding: 19px 45px;">Activate account</a>
                            </td>
                        </tr>
                    </table>
                    <p>If you are unable to click the link above, copy and paste this URL into your browser:</p>
                    <a>`+ url + `</a>
                    <p>Thank you,</p>
                    <p>PolkaFantasy Team</p>
                </div> 
            </div>
        </div>
    </body>`;

    return html
}

const resetPassword = function (request, url) {
    const html =
    `<meta charset = "UTF-8">
    <head>
        <style>
            .container{
                width: 50%;
                backgroung-color: #DDDDDD;
            }
            .button{
                padding: 15px 45px;
                background-color: #3399cc;
                color: #fff;
                border: none;
            }
            .button:hover {
                cursor: pointer;
            }
            @media screen and (max-width: 1500px) {
                .container{
                    width: 100%;
                    backgroung-color: #DDDDDD;
                }
            }
        </style>
    </head>
    <body>
        <div style='min-height: max-content;'>
            <div class="container">                   
                <p style='line-height: 40px;width: 100%;text-align: center; background-color: #EEEEEE; margin: 0;'>*** This is an automatically generated email, please do not reply ***</p>
                <div style='padding: 2% 15% 2% 15%; background-color: #fff; color: #000 !important;'>
                    <h1 style='text-align: center;'>Your password has been reset.</h1>
                    <p>Dear ${request.username}</p>
                    <p>We would like to inform you that your password has been reset. Please click the button below to set a new password.</p>    
                    <table border="0" cellpadding="0" cellspacing="0" style="background-color:#766fca; border-radius:5px; margin-left:auto; margin-right:auto;">
                        <tr>
                            <td align="center" valign="middle" style="color:#FFFFFF; font-family:Helvetica, Arial, sans-serif; font-size:16px; font-weight:bold; padding-top:15px; padding-bottom:15px;">
                                <a href="` +url+`" target="_blank" style="color:#FFFFFF; text-decoration:none; padding: 19px 45px;">Reset password</a>
                            </td>
                        </tr>
                    </table>
                    <p>If you are unable to click the link above, copy and paste this URL into your browser:</p>
                    <a>`+ url + `</a>
                    <p>Thank you,</p>
                    <p>PolkaFantasy Team</p>
                </div> 
            </div>
        </div>
    </body>`;
    return html
}

module.exports = {
    register,
    resetPassword
}