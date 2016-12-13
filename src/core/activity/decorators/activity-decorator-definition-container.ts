import {AbstractDefinitionContainer} from "../../decorators/definition-container";
import {ActivityDefinition} from "../activity-definition";


export class ActivityDecoratorDefinitionContainer extends AbstractDefinitionContainer<ActivityDefinition> {
    protected createDefinition(decoratedPropertyName: string): ActivityDefinition {
        return new ActivityDefinition(decoratedPropertyName);
    }
}