import { Query } from 'react-apollo'
import ApolloClient from 'apollo-boost'
import { InMemoryCache } from 'apollo-boost'


const client = new ApolloClient({
    fetchOptions: {
      credentials: 'include',
    },
    cache: new InMemoryCache(),
  })

export default client  