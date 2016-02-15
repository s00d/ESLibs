import Abstract from "/Support/Access/Abstract";

export const toObject = Symbol('toObject');

/**
 * Serializable interface
 */
export default class Serializable {
    /**
     * Serialize method
     */
    [toObject] () { Abstract(this, toObject, {}).value(); }
}
