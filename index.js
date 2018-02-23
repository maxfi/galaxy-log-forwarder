const { text, createError } = require('micro')
const post = require('micro-post')
const fetch = require('node-fetch')

const { TOKEN } = process.env

/**
 * @summary Encodes string in base64
 * @param {String}
 * @returns {String}
 */
const base64 = str => new Buffer(str, 'base64').toString('ascii')

/**
 * @summary Extracts API token and forwarding URL from basic auth
 * @param {http.IncomingMessage}
 * [Elasticsearch bulk request](https://www.elastic.co/guide/en/elasticsearch/reference/5.5/docs-bulk.html)
 * from Galaxy.
 * @throws {Error} Throws if the request doesn't contain basic auth
 * @returns {{token: String, forwardUrl: String}}
 */
const getData = req => {
  const auth = req.headers.authorization
  if (!auth) throw new Error('Basic auth missing')
  const credentials = base64(auth.split(' ')[1]).split(':')
  return {
    token: credentials[0],
    forwardUrl: base64(credentials[1])
  }
}

/**
 * @summary Parses the request into required format
 * @returns {{content: Array, payload: String}}
 * {
 *   content: Array  # Log lines
 *   payload: String # NDJSON log lines
 * }
 */
const parse = async req => {
  const content = (await text(req))
    .split('\n')
    .slice(0, -1)
    .map(x => JSON.parse(x))
    .filter(x => x['@timestamp'])
  const payload = content.map(x => JSON.stringify(x)).join('\n')
  return {
    content,
    payload
  }
}

module.exports = post(async req => {
  const data = getData(req)
  const authorized = !TOKEN || TOKEN === data.token
  if (!authorized) throw createError(401, 'Unauthorized')
  if (!data.forwardUrl) throw createError(400, 'Forwarding URL must be provided')

  const parsed = await parse(req)
  const response = await fetch(data.forwardUrl, {
    method: 'POST',
    body: parsed.payload
  })
  if (response.status !== 200) throw new Error('Unable to forward logs')

  return {
    took: parsed.content.length,
    errors: false
  }
})
