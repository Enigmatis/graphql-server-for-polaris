import {GraphQLLogger, PolarisGraphQLLogger} from "@enigmatis/polaris-graphql-logger";
import {PolarisBaseContext} from "@enigmatis/polaris-common"
import { Connection } from "@enigmatis/polaris-typeorm";

export interface PolarisContext extends PolarisBaseContext{
}

export class ContextBuilder {
    private _logger: GraphQLLogger;
    private _res: any;
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

    res(res){
        this._res = res;
    }

    build(): PolarisContext {
        return {logger: this._logger, dataVersion: this._dataVersion, res: this._res};
    }
}

export class ContextInitializer {
    private readonly logger: GraphQLLogger;
    private readonly polarisConnection: Connection;

    constructor(logger: GraphQLLogger, polarisConnection: Connection) {
        this.logger = logger;
        this.polarisConnection = polarisConnection;
    }

    async initializeContextForRequest({req, res}) {
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
        contextBuilder.res(res);
        let context: PolarisContext = contextBuilder.build();
        res.locals.irrelevantEntities = {};
        this.polarisConnection.manager.queryRunner.data.context = context;
        return context;
    }
}
