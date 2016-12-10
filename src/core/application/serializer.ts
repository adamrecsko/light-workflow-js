export interface Serializer {
    parse(str: string): any;
    stringify(obj: any): string;
}
export const defaultSerializer: Serializer = JSON;
