const dotenv = require('dotenv')
const striptags = require('striptags')
const axios = require('axios')

dotenv.config()

const GlipSocket = require('glip.socket.io')
const client = new GlipSocket({
  host: process.env.GLIP_HOST || 'app.glip.com',
  port: process.env.GLIP_PORT || 443,
  user: process.env.GLIP_EMAIL,
  password: process.env.GLIP_PASSWORD
})
client.on('message', (type, data) => {
  if (type !== client.type_ids.TYPE_ID_POST) {
    return
  }
  if (data.text.indexOf("<a class='at_mention_compose'") === -1) {
    return
  }
  if (data.text.indexOf(`>@${process.env.GLIP_NAME}</a>`) === -1) {
    return
  }
  const text = striptags(data.text).replace(`@${process.env.GLIP_NAME}`, ' ').trim().replace(/\s+/g, ' ')
  if (text === 'ping') {
    client.post(data.group_id, 'pong')
    return
  }
  axios({
    method: 'post',
    url: process.env.QNA_MARKER_URL,
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': process.env.QNA_MARKER_KEY
    },
    data: {
      question: text
    }
  }).then(r => {
    const answer = r.data.answers[0]
    if (answer.score < 50.0) {
      client.post(data.group_id, 'This question is not in my knowledge base')
      return
    }
    client.post(data.group_id, answer.answer)
  }).catch(error => {
    console.log(error)
  })
})
client.start()
