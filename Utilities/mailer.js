




const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nijhum0891@gmail.com',
        pass: 'wnir oxqy iiuq qtjd'  
    }
})


const sendEmail = async (to, subject, text) => {
    try {
        const mailOptions = {
            from: 'nijhum0891@gmail.com',
            to,
            subject,
            text
        }
        const info = await transporter.sendMail(mailOptions)
        console.log('Email sent: ', info.response);
    }
    catch (err) {
        console.log("Error sendng Email ", err)
    };
}

module.exports = {sendEmail};