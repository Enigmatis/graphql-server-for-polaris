import {GraphQLLogger, PolarisGraphQLLogger} from "@enigmatis/polaris-graphql-logger";
import {DeltaMiddlewareContext} from '@enigmatis/polaris-delta-middleware';

export interface PolarisContext extends DeltaMiddlewareContext {

}

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

    build(): PolarisContext {
        return {logger: this._logger, dataVersion: this._dataVersion};
    }
}

export class ContextInitializer {
    private logger: GraphQLLogger;

    constructor(logger: GraphQLLogger) {
        this.logger = logger;
    }

    async initializeContextForRequest({req}) {
        const contextBuilder = new ContextBuilder();
        let dataVersionHeader = req.headers['data-version'];
        contextBuilder.graphqlLogger(this.logger);

        if (dataVersionHeader) {
            contextBuilder.dataVersion(dataVersionHeader);
        }

        return contextBuilder.build();
    }
}