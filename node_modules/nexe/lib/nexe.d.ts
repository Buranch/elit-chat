import { NexeCompiler } from './compiler';
import { argv, version, help, NexeOptions } from './options';
declare function compile(compilerOptions?: Partial<NexeOptions>, callback?: (err: Error | null) => void): Promise<any>;
export { argv, compile, version, NexeCompiler, NexeOptions, help };
