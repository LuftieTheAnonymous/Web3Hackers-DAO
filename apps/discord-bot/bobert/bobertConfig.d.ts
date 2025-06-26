export declare function getResponseFromBobert(input: string): Promise<string>;
export declare function getImageResponse(contents: string): Promise<{
    error: string;
    image?: undefined;
    name?: undefined;
    fileURI?: undefined;
    buffer?: undefined;
} | {
    image: string;
    name: string | undefined;
    fileURI: string | undefined;
    buffer: Buffer<ArrayBuffer>;
    error?: undefined;
}>;
