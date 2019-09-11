import {gql, makeExecutableSchema} from 'apollo-server';
import {ApolloServer, ApolloServerExpressConfig} from 'apollo-server-express';
import express from 'express';
import {applyMiddleware} from 'graphql-middleware';
import {
    dataVersionMiddleware,
    softDeletedMiddleware,
    ExtensionsPlugin
} from '@enigmatis/polaris-delta-middleware';

import {
    repositoryEntityTypeDefs,
    scalarsResolvers,
    scalarsTypeDefs
} from '@enigmatis/polaris-schema';
import {ContextInitializer} from "./context-builder";
import {ConnectionOptions, createConnection} from "typeorm";
import {Book} from "./dal/book";
import {CommonEntitySubscriber, CommonModel, DataVersion} from '@enigmatis/polaris-typeorm';

import {PolarisGraphQLLogger} from '@enigmatis/polaris-graphql-logger';

import "reflect-metadata";

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

let connectionOptions: ConnectionOptions = {
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "Aa123456",
    database: "postgres",
    entities: [
        __dirname + '/dal/*.ts',
        CommonModel,
        DataVersion
    ],
    subscribers: [
        CommonEntitySubscriber
    ],
    synchronize: true,
    logging: false
};

const play = async () => {
    const connection = await createConnection(connectionOptions);

    let initDb = async () => {
        let bookRepo = connection.getRepository(Book);
        await bookRepo.clear();
        await connection.getRepository(DataVersion).clear();
        let book1 = new Book('Harry Potter and the Chamber of Secrets', 'J.K. Rowling', 1);
        let book2 = new Book('Jurassic Park', 'Michael Crichton', 1);
        return bookRepo.save([book1, book2]);
    };

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
            dataVersion: Int
        }

        # The "Query" type is the root of all GraphQL queries.
        # (A "Mutation" type will be covered later on.)
        type Query {
            books: [Book]
            bla: String
        }
        type Mutation {
            insertBook(title: String!, author: String!): Boolean
        }
    `;

    const resolvers = {
        Query: {
            books: async (root, args, context, info) => {
                context.irrelevantEntities = {name: 'blabla'};
                const bookRepo = connection.getRepository(Book);
                let books = await bookRepo.find();
                return books;
            },
            bla: () => "bla"
        },
        Mutation: {
            insertBook: async (root, args, context, info) => {
                const bookRepo = connection.getRepository(Book);
                let book = new Book(args.title, args.author, 2);
                let book2 = new Book(args.title + "a", args.author + "3", 2);
                await bookRepo.save(book, {data: {context}});
                await bookRepo.save(book2, {data: {context}});
                return true;
            }
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

    const applicationLogProperties = {
        id: 'example',
        name: 'example',
        component: 'repo',
        environment: 'dev',
        version: '1'
    };


    const polarisGraphQLLogger = new PolarisGraphQLLogger(applicationLogProperties, {
        loggerLevel: 'debug',
        writeToConsole: true,
        writeFullMessageToConsole: false
    });

    const executableSchema = applyMiddleware(schema, dataVersionMiddleware, softDeletedMiddleware);
    const config: ApolloServerExpressConfig = {
        schema: executableSchema,
        context: ({req}) => new ContextInitializer(polarisGraphQLLogger).initializeContextForRequest({req}),
        plugins: [() => new ExtensionsPlugin(connection.getRepository(DataVersion))],
    };

    initDb().then(() => {
        const server = new ApolloServer(config);

        server.applyMiddleware({app});

        app.listen(4000, (() => {
            polarisGraphQLLogger.info(`🚀  Server ready http://localhost:4000/graphql`);
        }));
    });
};

play();
