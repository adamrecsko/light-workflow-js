import {BaseDecisionRunContext, DecisionRunContext} from "../../context/decision-run-context";
import {expect} from "chai";
import {ActivityClientFacade} from "./activity-client-facade";
describe('ActivityClientFacade', ()=> {
    describe('getContext', ()=> {
        it('should use the given context resolution strategy', ()=> {
            class MockTestActivity {
            }
            const runContext = new BaseDecisionRunContext();
            const mockResolutionStrategy = {
                getContext(): DecisionRunContext{
                    return runContext;
                }
            };
            const client = new ActivityClientFacade(MockTestActivity, mockResolutionStrategy);
            expect(client.getContext()).to.be.eq(runContext);
        });
    });

    describe('getImplementation', ()=> {
        it('should return original implementation', ()=> {
            class MockTestActivity {
            }
            const mockResolutionStrategy = {
                getContext(): DecisionRunContext{
                    return null;
                }
            };
            const client = new ActivityClientFacade(MockTestActivity, mockResolutionStrategy);
            expect(client.getImplementation()).to.be.eq(MockTestActivity);
        });
    });
});