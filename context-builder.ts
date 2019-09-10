import {GraphQLLogger, PolarisGraphQLLogger} from "graphql-logger";

export class ContextBuilder {
    private _logger: GraphQLLogger;
    private _dataVersion: number;

    graphqlLogger(logger: GraphQLLogger) {
        if (!logger) {
            throw new Error("No logger supplied");
        }
        this._logger = logger;
        return this;
    }

    dataVersion(dataVersion: number) {
        if (!dataVersion) {
            throw new Error("No data version supplied");
        }
        this._dataVersion = dataVersion;
        return this;
    }

    build() {
        return {logger: this._logger, dataVersion: this._dataVersion};
    }
}

export async function initializeContextForRequest({req}) {
    const contextBuilder = new ContextBuilder();
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
        writeFullMessageToConsole: true
    });

    return contextBuilder.graphqlLogger(polarisGraphQLLogger).dataVersion(req.headers['data-version']).build();
}