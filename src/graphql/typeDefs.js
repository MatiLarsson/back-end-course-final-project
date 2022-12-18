import { gql } from "apollo-server-express"

const typeDefs = gql`

    type Product {
      _id: String
      timestamp: String
      name: String
      description: String
      code: String
      thumbnail: String
      price: Int
      stock: Int
    }

    type Query {
      getAllProducts: [Product]
    }

  `

export default typeDefs