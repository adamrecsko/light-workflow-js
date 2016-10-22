"use strict";
const aws_adapter_1 = require("./aws-adapter");
const inversify_1 = require("inversify");
const symbols_1 = require("./symbols");
const workflow_client_1 = require("./workflow-client");
exports.AwsModule = new inversify_1.KernelModule((bind) => {
    bind(symbols_1.AWS_ADAPTER).to(aws_adapter_1.GenericAWSAdapter);
    bind(symbols_1.WORKFLOW_CLIENT).to(workflow_client_1.GenericWorkflowClient);
});
//# sourceMappingURL=index.js.map