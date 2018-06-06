const dotenv = require('dotenv')
dotenv.config()

const axios = require('axios')
const AllHtmlEntities = require('html-entities').AllHtmlEntities
const R = require('ramda')

const entities = new AllHtmlEntities()

const RingCentral = require('ringcentral-js-concise')
const rc = new RingCentral('', '', process.env.RINGCENTRAL_SERVER)
const token = JSON.parse(process.env.RINGCENTRAL_TOKEN)
rc.token(token)

const mentionRegExp = new RegExp(`\\!\\[:Person\\]\\(${token.owner_id}\\)`, 'g')

const postMessage = (groupId, text) => {
  rc.post('/restapi/v1.0/glip/posts', { groupId, text })
}

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
  if (message.text.indexOf(`![:Person](${token.owner_id})`) === -1) {
    return
  }

  const text = message.text.replace(mentionRegExp, '').trim().replace(/\s+/g, ' ')
  if (text === 'ping') {
    postMessage(message.groupId, 'pong')
    return
  }

  console.log(text)

  axios({
    method: 'post',
    url: process.env.QNA_MARKER_URI,
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': process.env.QNA_MARKER_KEY
    },
    data: {
      question: text,
      top: 2
    }
  }).then(r => {
    console.log(JSON.stringify(r.data, null, 2))

    const answers = R.filter(a => a.score > 20, r.data.answers)
    if (answers.length === 0) {
      postMessage(message.groupId, `This question is not in my knowledge base.

If you know the answer, would you please contribute it to https://github.com/ringcentral/ringcentral-faq ?`
      )
      return
    }

    let answer = 'I find the following Q & A pair(s) from my knowledge base:'
    for (let i = 0; i < answers.length; i++) {
      answer += `

      **Q: ${answers[i].questions[0]}**
      **A:** ${entities.decode(answers[i].answer)}`
    }
    postMessage(message.groupId, answer)
  }).catch(error => {
    console.log(error)
  })
}

// This is for dev only
if (process.env.RINGCENTRAL_SERVER.indexOf('devtest') !== -1) {
  const PubNub = require('ringcentral-js-concise/src/pubnub')
  const pubnub = new PubNub(rc, ['/restapi/v1.0/glip/posts'], message => {
    handleMessage({
      headers: { 'Verification-Token': process.env.RINGCENTRAL_VERIFICATION_TOKEN },
      body: JSON.stringify(message)
    }, null, () => {})
  })
  pubnub.subscribe()
  process.on('SIGINT', function () {
    rc.delete(`/restapi/v1.0/subscription/${pubnub.subscription().id}`).then(() => {
      process.exit()
    })
  })
}

module.exports = { handleMessage }
