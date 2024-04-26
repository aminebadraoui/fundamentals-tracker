import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "../../../lib/mongodb";  // Ensure you have a lib/mongodb.js that exports a clientPromise
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default NextAuth({
  providers: [
    EmailProvider({
      server: {
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey', // SendGrid uses 'apikey' as the user for SMTP
          pass: process.env.SENDGRID_API_KEY
        }
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: ({
        identifier: email,
        url,
        provider: { server, from }
      }) => {
        const message = {
          to: email,
          from,
          subject: 'Sign in to your account',
          text: `Sign in using this link: ${url}`,
          html: `<p>Click <a href="${url}">here</a> to sign in.</p>`,
        };

        return sgMail.send(message);
      }
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return true
    },
    async redirect({ url, baseUrl }) {
      console.log("url", url)
      console.log("baseUrl", baseUrl)
   
      return `${baseUrl}/app/pulse`
    }
  },

});