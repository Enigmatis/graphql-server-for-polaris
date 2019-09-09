import {gql} from 'apollo-server';
import {ApolloServer, ApolloServerExpressConfig, makeExecutableSchema} from 'apollo-server-express';
import express from 'express';
import {applyMiddleware} from "graphql-middleware";
import {
    dataVersionMiddleware,
    initContextForDataVersion,
    softDeletedMiddleware,
    IrrelevantEntitiesExtension
} from 'polaris-delta-middleware';
import {repositoryEntityTypeDefs, scalarsResolvers, scalarsTypeDefs} from 'polaris-schema';
import {PolarisGraphQLLogger} from 'graphql-logger';

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
const applicationLogProperties = {id: 'example', name: 'example', component: 'repo', environment: 'dev', version: '1'};
const polarisGraphQLLogger = new PolarisGraphQLLogger(applicationLogProperties, {
    loggerLevel: 'info',
    writeToConsole: true,
    writeFullMessageToConsole: true
});
const resolvers = {
    Query: {
        books: (root, args, context, info) => {
            context.irrelevantEntities = {name: 'blabla'};
            polarisGraphQLLogger.info("bookss", {polarisLogProperties: {reality: {id: 1, type: 'truth'}}});
            return books;
        },
        bla: () => "bla"
    },
    Book: {
        aList: () => ["asd", "asddd", "bdbdb"]
    }
};

const app = express();
const schema = makeExecutableSchema({
    typeDefs: [typeDefs, scalarsTypeDefs, repositoryEntityTypeDefs], resolvers: [resolvers, scalarsResolvers]
});

const executableSchema = applyMiddleware(schema, dataVersionMiddleware, softDeletedMiddleware);
const config: ApolloServerExpressConfig = {
    schema: executableSchema,
    context: initContextForDataVersion,
    extensions: [() => new IrrelevantEntitiesExtension()]
};


const server = new ApolloServer(config);

server.applyMiddleware({app});

app.listen(4000, (() => {
    console.log(`🚀  Server ready http://localhost:4000/graphql`);
}));
