import { Client } from '@opensearch-project/opensearch'

let dbConnection

export async function connectOpenSearchDb () {
  if (!dbConnection) {
    const { opensearchHostname, opensearchPort, opensearchUsername, opensearchPassword } = useRuntimeConfig()
    dbConnection = new Client({
      node: `https://${opensearchHostname}:${opensearchPort}`,
      auth: {
        username: opensearchUsername,
        password: opensearchPassword
      }
    })
  }

  return dbConnection
}

export async function indexOpenSearchDb (index, body) {
  const client = await connectOpenSearchDb()
  const response = await client.index({ index, body })

  return response
}
