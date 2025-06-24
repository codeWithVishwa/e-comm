import { Resend } from 'resend';
import dotenv from 'dotenv'
dotenv.config()

if(process.env.RESEND_API){
    console.log("Provide RESENT_API in side the .env file")
}
const resend = new Resend(process.env.RESENT_API);

const sendEmail=async({sendTo,subject,html})=>{
    try {
         const { data, error } = await resend.emails.send({
    from: 'Firework <onboarding@resend.dev>',
    to: sendTo,
    subject: subject,
    html: html,
      
  });
    if(error){
        return console.error({error});
    }
    return data
        
    } catch (error) {
        console.log(error);
        
    }

}

export default sendEmail

