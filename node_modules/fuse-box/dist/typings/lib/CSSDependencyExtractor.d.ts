export interface ICSSDependencyExtractorOptions {
    paths: string[];
    extensions: string[];
    content: string;
    sassStyle?: boolean;
    importer?: {
        (f: string, prev: any, done: {
            (info: {
                file: string;
            }): void;
        }): string;
    };
}
export declare class CSSDependencyExtractor {
    opts: ICSSDependencyExtractorOptions;
    private dependencies;
    constructor(opts: ICSSDependencyExtractorOptions);
    private extractDepsFromString(input);
    private readFile(fileName);
    getDependencies(): string[];
    private tryFile(filePath);
    private getPath(suggested, fileName);
    private findTarget(fileName);
    static init(opts: ICSSDependencyExtractorOptions): CSSDependencyExtractor;
}
