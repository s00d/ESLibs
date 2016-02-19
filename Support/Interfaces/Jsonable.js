import Abstract from "/Support/Access/Abstract";

export const toJson = Symbol('toJson');

/**
 * Jsonable interface
 */
export default class Jsonable {
    /**
     * Jsonable method
     */
    [toJson] () { Abstract(this, toJson, {}).value(); }
}
