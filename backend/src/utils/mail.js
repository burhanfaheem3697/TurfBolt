import Mailgen from 'mailgen'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

dotenv.config()

export const sendMail = async (options) => {
    const mailGenerator = new Mailgen({
        theme : "default",
        product : {
            name : "Turf Bolt",
            link : 'https://mailgen.js'
        }
    })

    const emailText = mailGenerator.generatePlaintext(options.mailGenContent)
    const emailBody = mailGenerator.generate(options.mailGenContent)

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST,
        port: process.env.MAILTRAP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.MAILTRAP_USER,
            pass: process.env.MAILTRAP_PASS,
        },
    })

    const mail = {
        from: process.env.MAILTRAP_SENDEREMAIL,
        to: options.email,
        subject: options.subject,
        text: emailText, // plain‑text body
        html: emailBody, // HTML body
    }

    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.log("email failed",error)
    }


}

export const emailVerificationMailgenToken = (username,verificationUrl) => {
    return {
        body : {
            name : username,
            intro : "Welcome to turfBolt! We're very excited to have you on board.",
            action : {
                instructions : "To get started, please click here:",
                button : {
                    color: '#22BC66', // Optional action button color
                    text: 'Verify your email',
                    link: verificationUrl
                }
            },
            outro : "Need help or have questions? Just reply to this email, we'd love to help."
        }
    }
}

export const forgotPasswordMailgenToken = (username,passwordResetUrl) => {
    return {
        body : {
            name : username,
            intro : "Welcome to turfBolt! We're very excited to have on board",
            action : {
                instructions : "To get started, please click here:",
                button : {
                    color: '#22BC66', // Optional action button color
                    text: 'Verify your email',
                    link: passwordResetUrl
                }
            },
            outro : "Need help or have questions? Just reply to this email, we'd love to help."

        }
    }
}