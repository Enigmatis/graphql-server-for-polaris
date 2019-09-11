import {PolarisGraphQLLogger, GraphQLLogger} from "graphql-logger";
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

    build() {
        return {logger: this._logger, dataVersion: this._dataVersion, realityId: this._realityId, includeLinkedOper: this._includeLinkedOper};
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
    let realityIdHeader = req.headers['reality-id'];
    let includeLinkedOper = req.headers['include-linked-oper'];
    contextBuilder.graphqlLogger(polarisGraphQLLogger);

    if (dataVersionHeader) {
        contextBuilder.dataVersion(dataVersionHeader);
    }
    contextBuilder.includeLinkedOper(includeLinkedOper);
    contextBuilder.realityId(realityIdHeader);
    return contextBuilder.build();
}