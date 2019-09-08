import {gql} from 'apollo-server';
import {ApolloServer, ApolloServerExpressConfig, makeExecutableSchema} from 'apollo-server-express';
import express from 'express';
import {applyMiddleware} from "graphql-middleware";
import {dataVersionMiddleware, initContextForDataVersion} from 'polaris-delta-middleware';
import {repositoryEntityTypeDefs, scalarsResolvers, scalarsTypeDefs} from 'polaris-schema';

const books = [
    {
        title: 'Harry Potter and the Chamber of Secrets',
        author: 'J.K. Rowling',
        dataVersion: 4,
        creationTime: new Date()
    },
    {
        title: 'Jurassic Park',
        author: 'Michael Crichton',
        dataVersion: 2
    },
];

const typeDefs = gql`
    # Comments in GraphQL are defined with the hash (#) symbol.
    
    # This "Book" type can be used in other type declarations.
    type Book implements RepositoryEntity {
        id: String!
        deleted: Boolean!
        createdBy: String!
        creationTime: DateTime!
        lastUpdatedBy: String
        lastUpdateTime: DateTime
        realityId: Int!
        title: String
        author: String
        aList: [String]
    }

    # The "Query" type is the root of all GraphQL queries.
    # (A "Mutation" type will be covered later on.)
    type Query {
        books: [Book]
        bla: String
    }
`;

const resolvers = {
    Query: {
        books: () => books,
        bla: () => "bla"
    },
    Book: {
        aList: () => ["asd", "asddd", "bdbdb"]
    }
};

const app = express();
const typeDefsFinal = [typeDefs, ...scalarsTypeDefs, ...repositoryEntityTypeDefs];
const schema = makeExecutableSchema({
    typeDefs: typeDefsFinal, resolvers: [resolvers, ...scalarsResolvers]
});

const executableSchema = applyMiddleware(schema, dataVersionMiddleware);
const config: ApolloServerExpressConfig = {
    schema: executableSchema,
    context: initContextForDataVersion
};


const server = new ApolloServer(config);

server.applyMiddleware({app});

app.listen(4000, (() => {
    console.log(`🚀  Server ready http://localhost:4000/graphql`);
}));
