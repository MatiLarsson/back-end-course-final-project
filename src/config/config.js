export default {
  app: {
    PORT: process.env.PORT,
    DOMAIN: process.env.DOMAIN,
    TEST_PWD: process.env.TEST_PWD,
    TEST_CART_ID: process.env.TEST_CART_ID
  },
  mongo: {
    USER: process.env.MONGO_USER,
    PWD: process.env.MONGO_PWD,
    DATABASE: process.env.MONGO_DB
  },
  github: {
    CLIENT_ID: process.env.GITHUB_CID,
    CLIENT_SECRET: process.env.GITHUB_CSECRET
  },
  gmailService: {
    MAIL_TO: process.env.MAIL_TO,
    GMAIL_AUTH_USER: process.env.GMAIL_AUTH_USER,
    GMAIL_AUTH_PASS: process.env.GMAIL_AUTH_PASS
  }
}