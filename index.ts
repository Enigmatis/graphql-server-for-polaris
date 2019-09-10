import {gql, makeExecutableSchema} from 'apollo-server';
import {ApolloServer, ApolloServerExpressConfig} from 'apollo-server-express';
import express from 'express';
import {applyMiddleware} from 'graphql-middleware';
import "reflect-metadata";
import {
    dataVersionMiddleware,
    softDeletedMiddleware,
    IrrelevantEntitiesExtension
} from '@enigmatis/polaris-delta-middleware';

import {
    repositoryEntityTypeDefs,
    scalarsResolvers,
    scalarsTypeDefs
} from '@enigmatis/polaris-schema';
import {initializeContextForRequest} from "./context-builder";
import {createConnection} from "typeorm";
import {Book} from "./dal/book";

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
        dataVersion: 2,
        creationTime: new Date()
    },
];

createConnection({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "Aa123456",
    database: "postgres",
    entities: [
        Book
    ],
    synchronize: true,
    logging: false
}).then(async connection => {
    let bookRepository = connection.getRepository(Book);
    let book = new Book();
    book.author = "my book";
    book.title = "my title";
    book.dataVersion = 2;
    await bookRepository.save(book);
    console.log("book has been save");
}).catch(error => console.log(error));

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
        books: (root, args, context, info) => {
            context.irrelevantEntities = {name: 'blabla'};
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
    typeDefs: [typeDefs, repositoryEntityTypeDefs, scalarsTypeDefs],
    resolvers: [resolvers, scalarsResolvers]
});

const executableSchema = applyMiddleware(schema, dataVersionMiddleware, softDeletedMiddleware);
const config: ApolloServerExpressConfig = {
    schema: executableSchema,
    context: initializeContextForRequest,
    extensions: [() => new IrrelevantEntitiesExtension()]
};


const server = new ApolloServer(config);

server.applyMiddleware({app});

app.listen(4000, (() => {
    console.log(`🚀  Server ready http://localhost:4000/graphql`);
}));
