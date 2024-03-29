import {GraphQLLogger, PolarisGraphQLLogger} from "@enigmatis/polaris-graphql-logger";
import {DeltaMiddlewareContext} from '@enigmatis/polaris-delta-middleware';
import { PolarisConnection } from "@enigmatis/polaris-typeorm/src/connections/connection";

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
        return {logger: this._logger, dataVersion: this._dataVersion};
    }
}

export class ContextInitializer {
    private readonly logger: GraphQLLogger;
    private readonly polarisConnection: PolarisConnection;

    constructor(logger: GraphQLLogger, polarisConnection: PolarisConnection) {
        this.logger = logger;
        this.polarisConnection = polarisConnection;
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
        let context: PolarisContext = contextBuilder.build();
        this.polarisConnection.manager.queryRunner.data.context = context;
        return context;
    }
}