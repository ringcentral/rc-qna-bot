const dotenv = require('dotenv')
dotenv.config()

const RingCentral = require('ringcentral-js-concise')
const rc = new RingCentral('', '', process.env.RINGCENTRAL_SERVER)
rc.token(JSON.parse(process.env.RINGCENTRAL_TOKEN))

rc.post('/restapi/v1.0/subscription', {
  eventFilters: [
    '/restapi/v1.0/glip/posts'
  ],
  deliveryMode: {
    transportType: 'WebHook',
    address: process.env.RINGCENTRAL_WEBHOOK_URI
  },
  expiresIn: 473040000
})
