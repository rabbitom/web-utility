import { parseJSON, isEmpty } from './data';

const { location, atob } = globalThis;

export function isXDomain(URI: string) {
    return new URL(URI, document.baseURI).origin !== location.origin;
}

export type JSONValue = number | boolean | string | null;
export interface URLData<E = unknown> {
    [key: string]: JSONValue | JSONValue[] | URLData | URLData[] | E;
}

export function parseURLData(raw = window.location.search): URLData {
    const list = raw.split(/\?|#/);
    const data = new URLSearchParams(list[1] || list[0]);

    return Object.fromEntries(
        [...data.keys()].map(key => {
            const list = data.getAll(key).map(parseJSON);

            return [key, list.length < 2 ? list[0] : list];
        })
    );
}

export function buildURLData(map: string[][] | Record<string, any>) {
    if (!(map instanceof Array)) map = Object.entries(map);

    return new URLSearchParams(
        (map as any[][])
            .map(
                ([key, value]) =>
                    !isEmpty(value) && [key, value.toJSON?.() || value + '']
            )
            .filter(Boolean)
    );
}

const DataURI = /^data:(.+?\/(.+?))?(;base64)?,([\s\S]+)/;
/**
 * Blob logic forked from axes's
 * http://www.cnblogs.com/axes/p/4603984.html
 */
export function blobFrom(URI: string) {
    var [_, type, __, base64, data] = DataURI.exec(URI) || [];

    data = base64 ? atob(data) : data;

    const aBuffer = new ArrayBuffer(data.length);
    const uBuffer = new Uint8Array(aBuffer);

    for (let i = 0; data[i]; i++) uBuffer[i] = data.charCodeAt(i);

    return new Blob([aBuffer], { type });
}
