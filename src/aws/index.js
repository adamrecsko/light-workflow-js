"use strict";
const aws_adapter_1 = require("./aws-adapter");
const inversify_1 = require("inversify");
const types_1 = require("./types");
exports.AWS_MODULE = new inversify_1.KernelModule((bind) => {
    bind(types_1.AWS_ADAPTER).to(aws_adapter_1.GenericAWSAdapter);
});
//# sourceMappingURL=index.js.map