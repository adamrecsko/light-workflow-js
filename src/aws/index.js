"use strict";
const aws_adapter_1 = require("./aws-adapter");
const inversify_1 = require("inversify");
const types_1 = require("./types");
const swf_rx_1 = require("./swf-rx");
exports.AwsModule = new inversify_1.KernelModule((bind) => {
    bind(types_1.AWS_ADAPTER).to(aws_adapter_1.GenericAWSAdapter);
    bind(types_1.SWF_RX).to(swf_rx_1.GenericSwfRx);
});
//# sourceMappingURL=index.js.map