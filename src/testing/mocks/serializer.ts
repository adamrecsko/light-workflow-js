import {Serializer} from "../../core/application/serializer";
export class MockSerializer implements Serializer {
    parse(str: string): any {
        return null;
    }

    stringify(obj: any): string {
        return null;
    }
}