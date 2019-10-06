import {GraphQLLogger, PolarisGraphQLLogger} from "@enigmatis/polaris-graphql-logger";
import {DeltaMiddlewareContext} from '@enigmatis/polaris-delta-middleware';

export interface PolarisContext extends DeltaMiddlewareContext {

}

export class ContextBuilder {
    private _logger: GraphQLLogger;
    private _dataVersion: number;
    private _realityId: number;
    private _includeLinkedOper: boolean;

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

    realityId(realityId: number) {
        if (realityId) {
            this._realityId = +realityId;
        } else {
            this._realityId = 0;
        }
    }

    includeLinkedOper(includeLinkedOper){
        this._includeLinkedOper = includeLinkedOper == "false"? false: true;
    }

    build(): PolarisContext {
        return {logger: this._logger, dataVersion: this._dataVersion, realityId: this._realityId};
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
        let realityIdHeader = req.headers['reality-id'];
        let includeLinkedOper = req.headers['include-linked-oper'];

        contextBuilder.graphqlLogger(this.logger);

        if (dataVersionHeader) {
            contextBuilder.dataVersion(dataVersionHeader);
        }
        if (includeLinkedOper) {
            contextBuilder.includeLinkedOper(includeLinkedOper);
        }
        contextBuilder.realityId(realityIdHeader);

        return contextBuilder.build();
    }
}