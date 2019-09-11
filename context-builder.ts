import {GraphQLLogger, PolarisGraphQLLogger} from "@enigmatis/polaris-graphql-logger";
import {PolarisBaseContext} from '@enigmatis/polaris-types';

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

    build(): PolarisBaseContext {
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
        writeFullMessageToConsole: false
    });

    let dataVersionHeader = req.headers['data-version'];
    contextBuilder.graphqlLogger(polarisGraphQLLogger);

    if (dataVersionHeader) {
        contextBuilder.dataVersion(dataVersionHeader);
    }

    return contextBuilder.build();
}