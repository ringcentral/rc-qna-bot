const dotenv = require('dotenv')
const striptags = require('striptags')

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
  console.log(data.text)
  const text = striptags(data.text).replace(`@${process.env.GLIP_NAME}`, ' ').trim().replace(/\s+/g, ' ')
  console.log(text)
  if (text === 'ping') {
    client.post(data.group_id, 'pong')
  }
})
client.start()
