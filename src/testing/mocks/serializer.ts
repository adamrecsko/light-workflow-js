import {Serializer} from "../../application/activity/serializer";
export class MockSerializer implements Serializer {
    parse(str: string): any {
        return null;
    }

    stringify(obj: any): string {
        return null;
    }
}