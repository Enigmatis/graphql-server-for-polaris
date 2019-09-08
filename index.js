"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var apollo_server_1 = require("apollo-server");
var apollo_server_express_1 = require("apollo-server-express");
var express_1 = __importDefault(require("express"));
var graphql_middleware_1 = require("graphql-middleware");
var polaris_delta_middleware_1 = require("polaris-delta-middleware");
var polaris_schema_1 = require("polaris-schema");
var books = [
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
var typeDefs = apollo_server_1.gql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n    # Comments in GraphQL are defined with the hash (#) symbol.\n    \n    # This \"Book\" type can be used in other type declarations.\n    type Book implements RepositoryEntity {\n        id: String!\n        deleted: Boolean!\n        createdBy: String!\n        creationTime: DateTime!\n        lastUpdatedBy: String\n        lastUpdateTime: DateTime\n        realityId: Int!\n        title: String\n        author: String\n        aList: [String]\n    }\n\n    # The \"Query\" type is the root of all GraphQL queries.\n    # (A \"Mutation\" type will be covered later on.)\n    type Query {\n        books: [Book]\n        bla: String\n    }\n"], ["\n    # Comments in GraphQL are defined with the hash (#) symbol.\n    \n    # This \"Book\" type can be used in other type declarations.\n    type Book implements RepositoryEntity {\n        id: String!\n        deleted: Boolean!\n        createdBy: String!\n        creationTime: DateTime!\n        lastUpdatedBy: String\n        lastUpdateTime: DateTime\n        realityId: Int!\n        title: String\n        author: String\n        aList: [String]\n    }\n\n    # The \"Query\" type is the root of all GraphQL queries.\n    # (A \"Mutation\" type will be covered later on.)\n    type Query {\n        books: [Book]\n        bla: String\n    }\n"])));
var resolvers = {
    Query: {
        books: function () { return books; },
        bla: function () { return "bla"; }
    },
    Book: {
        aList: function () { return ["asd", "asddd", "bdbdb"]; }
    }
};
var app = express_1.default();
var typeDefsFinal = [typeDefs].concat(polaris_schema_1.scalarsTypeDefs, polaris_schema_1.repositoryEntityTypeDefs);
var schema = apollo_server_express_1.makeExecutableSchema({
    typeDefs: typeDefsFinal, resolvers: [resolvers].concat(polaris_schema_1.scalarsResolvers)
});
var executableSchema = graphql_middleware_1.applyMiddleware(schema, polaris_delta_middleware_1.dataVersionMiddleware);
var config = {
    schema: executableSchema,
    context: polaris_delta_middleware_1.initContextForDataVersion
};
var server = new apollo_server_express_1.ApolloServer(config);
server.applyMiddleware({ app: app });
app.listen(4000, (function () {
    console.log("\uD83D\uDE80  Server ready http://localhost:4000/graphql");
}));
var templateObject_1;
