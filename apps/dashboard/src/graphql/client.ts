import { createClient, cacheExchange, fetchExchange, type Client } from '@urql/vue'

let client: Client | null = null

export function createGraphQLClient(indexerUrl: string): Client {
  client = createClient({
    url: `${indexerUrl}/graphql`,
    exchanges: [cacheExchange, fetchExchange],
  })
  return client
}

export function getGraphQLClient(): Client | null {
  return client
}
