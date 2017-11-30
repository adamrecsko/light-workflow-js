import uuid = require("uuid");
import {injectable} from "inversify";

export const UUID_GENERATOR = Symbol('UUID_GENERATOR');


export interface UuidGenerator {
  generate(): string;
}

@injectable()
export class BaseUuidGenerator implements UuidGenerator {
  generate(): string {
    return uuid.v4();
  }
}