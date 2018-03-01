const dotenv = require('dotenv')
dotenv.config()

const striptags = require('striptags')
const axios = require('axios')
const AllHtmlEntities = require('html-entities').AllHtmlEntities

const entities = new AllHtmlEntities()

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
  console.log(text)
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
    console.log(JSON.stringify(r.data, null, 2))
    const answer = r.data.answers[0]
    if (answer.score < 20.0) {
      client.post(data.group_id, 'This question is not in my knowledge base')
      return
    }
    client.post(data.group_id, entities.decode(answer.answer))
  }).catch(error => {
    console.log(error)
  })
})
client.start()
