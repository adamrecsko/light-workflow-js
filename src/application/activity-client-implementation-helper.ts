import {APP_KERNEL} from "./application";
import {Kernel, injectable, inject} from "inversify";
import {tagged} from "inversify";


export const activity = tagged('activity', true);
export const activityClient = tagged('activity-client', false);


export type ActivityImplementation = {
    impl: any,
    binding: symbol
};

export interface ActivityClientImplementationHelper {

}

export class ActivityClient<T> {
    constructor(private implementation: T) {
    }

    getImplementation(): T {
        return this.implementation;
    }

    private getContext() {

    }
}


@injectable()
export class BaseActivityClientImplementationHelper implements ActivityClientImplementationHelper {
    constructor(@inject(APP_KERNEL) private appKernel: Kernel) {
    }

    addImplementations(implementationList: ActivityImplementation[]) {
        implementationList.forEach((activityImp)=> {
            const impl = activityImp.impl;
            this.appKernel.bind(activityImp.binding).to(activityImp.impl)
                .whenTargetTagged('activity', true);
            this.appKernel.bind(activityImp.binding).toDynamicValue(()=> {
                return new ActivityClient(impl);
            }).whenTargetTagged('activity-client', true);
        });
    }
}