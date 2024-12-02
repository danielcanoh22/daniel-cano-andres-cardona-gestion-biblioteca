import { gql } from 'apollo-server-micro';

const CustomBookTypes = gql`
  type Mutation {
    reserveBook(userId: String!, bookId: String!): String!
    markAsReturned(reservationId: String!): String!
  }

  type Book {
    id: ID!
    title: String!
    author: String!
    image: String
    genre: String!
    copies_available: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }
`;

export { CustomBookTypes };
