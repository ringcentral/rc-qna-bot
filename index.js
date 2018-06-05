const dotenv = require('dotenv')
dotenv.config()

const striptags = require('striptags')
const axios = require('axios')
const AllHtmlEntities = require('html-entities').AllHtmlEntities
const R = require('ramda')

const entities = new AllHtmlEntities()

const RingCentral = require('ringcentral-js-concise')
const rc = new RingCentral('', '', process.env.RINGCENTRAL_SERVER)
const token = JSON.parse(process.env.RINGCENTRAL_TOKEN)
rc.token(token)

const handleMessage = (event, context, callback) => {
  if (event.headers['Verification-Token'] !== process.env.RINGCENTRAL_VERIFICATION_TOKEN) {
    callback(null, { statusCode: 404 })
    return
  }
  callback(null, { statusCode: 200, body: '', headers: { 'Validation-Token': event.headers['Validation-Token'] } })
  if (event.body === null) {
    return
  }
  const message = JSON.parse(event.body).body
  if (R.isNil(message)) {
    return
  }
  if (message.creatorId === token.owner_id) {
    return
  }
  if (R.isNil(message.text) || R.isEmpty(message.text)) {
    return
  }
  console.log(message)
  // rc.post('/restapi/v1.0/glip/posts', {
  //   groupId: message.groupId,
  //   text: JSON.stringify(message, null, 2),
  //   attachments: undefined
  // })
}

if (process.env.RINGCENTRAL_SERVER.indexOf('devtest') !== -1) { // dev
  const PubNub = require('ringcentral-js-concise/src/pubnub')
  const pubnub = new PubNub(rc, ['/restapi/v1.0/glip/posts'], message => {
    handleMessage({
      headers: { 'Verification-Token': process.env.RINGCENTRAL_VERIFICATION_TOKEN },
      body: JSON.stringify(message)
    }, null, () => {})
  })
  pubnub.subscribe()
}

module.exports = { handleMessage }

//   if (data.text.indexOf("<a class='at_mention_compose'") === -1) {
//     return
//   }
//   if (data.text.indexOf(`>@${process.env.GLIP_NAME}</a>`) === -1) {
//     return
//   }
//   const text = striptags(data.text).replace(`@${process.env.GLIP_NAME}`, ' ').trim().replace(/\s+/g, ' ')
//   if (text === 'ping') {
//     client.post(data.group_id, 'pong')
//     return
//   }
//   console.log(text)
//   axios({
//     method: 'post',
//     url: process.env.QNA_MARKER_URI,
//     headers: {
//       'Content-Type': 'application/json',
//       'Ocp-Apim-Subscription-Key': process.env.QNA_MARKER_KEY
//     },
//     data: {
//       question: text,
//       top: 2
//     }
//   }).then(r => {
//     console.log(JSON.stringify(r.data, null, 2))

//     const answers = R.filter(a => a.score > 20, r.data.answers)
//     if (answers.length === 0) {
//       client.post(data.group_id, 'This question is not in my knowledge base')
//       return
//     }

//     let answer = 'I find the following Q & A pair(s) from my knowledge base:'
//     for (let i = 0; i < answers.length; i++) {
//       answer += `

//       **Q: ${answers[i].questions[0]}**
//       **A:** ${entities.decode(answers[i].answer)}`
//     }
//     client.post(data.group_id, answer)
//   }).catch(error => {
//     console.log(error)
//   })
// })
// client.start()
