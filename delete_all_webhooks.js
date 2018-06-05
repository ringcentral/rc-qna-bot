const dotenv = require('dotenv')
dotenv.config()

const RingCentral = require('ringcentral-js-concise')
const rc = new RingCentral('', '', process.env.RINGCENTRAL_SERVER)
rc.token(JSON.parse(process.env.RINGCENTRAL_TOKEN))

rc.get('/restapi/v1.0/subscription').then(r => {
  console.log(JSON.stringify(r.data, null, 2))
  for (let record of r.data.records) {
    rc.delete(`/restapi/v1.0/subscription/${record.id}`)
  }
})
