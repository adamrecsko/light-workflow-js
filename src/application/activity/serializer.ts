export interface Serializer {
    parse(str: string): any;
    stringify(obj: any): string;
}
