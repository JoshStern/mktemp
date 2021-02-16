import fs, {promises as pfs} from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';

const PATH_SEP = path.sep;
const TMP_DIR_PATH = `${os.tmpdir()}${PATH_SEP}`;
const FILE_NAME_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-';
const DEFAULT_O_FLAGS = fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_RDWR;
const DEFAULT_FILE_MODE = fs.constants.S_IRUSR | fs.constants.S_IWUSR;

/**
 * Create a pseudo-random sequence of characters.
 * @param len Length of the output string.
 * @returns pseudo-random and valid filename.
 */
function randomFileName(len: number): string {
  const bytes = crypto.randomBytes(len);
  let str = '';
  for (const b of bytes) {
    str += FILE_NAME_ALPHABET[b % FILE_NAME_ALPHABET.length];
  }
  return str;
}

/**
 * Options for cleaning a temporary resource.
 */
export interface CleanOptions {
  /**
   * Silence errors while deleting resources when set to true.
   * Default: false
   */
  force?: boolean;
}

/**
 * TempDir encapsulates the required information for managing a temporary directory.
 * The class is exported but it's recommended to use the async creation funcion `dir()`.
 */
export class TempDir {
  constructor(public readonly path: string) {}
  public async clean(options: CleanOptions = {}): Promise<void> {
    const {force = false} = options;
    return pfs.rm(this.path, {recursive: true, force});
  }
}

/**
 * Input options for temporary directories.
 */
export interface TempDirOptions {
  /**
   * Prefix given to folder before a random sequence of characters.
   * Default: Empty string
   */
  prefix?: string;
}
/**
 * Create a temporary directory.
 * @param options Directory creation options.
 * @returns A promise that resolves with a temp directory instance.
 *
 * @example
 * ```ts
 * import {dir} from 'mktemp';
 * const myDir = await dir();
 * // ...
 * await myDir.clean();
 * ```
 */
export async function dir(options: TempDirOptions = {}): Promise<TempDir> {
  const {
    prefix = '',
  } = options;
  const dir = await pfs.mkdtemp(path.join(TMP_DIR_PATH, prefix));
  return new TempDir(dir);
}

/**
 * TempFile encapsulates the required information for managing the temp file.
 * The class is exported but it's recommended to use the async creation function `file()`.
 */
export class TempFile {
  constructor(
    private readonly dir: TempDir,
    public readonly path: string,
    public readonly handle: pfs.FileHandle,
  ) {}
  public async clean(options: CleanOptions = {}): Promise<void> {
    await this.handle.close();
    return this.dir.clean(options);
  }
}

/**
 * Set of available options for creating a file.
 */
export interface TempFileOptions {
  /**
   * Name of file. Does not have to be unique because the file will use a unique directory.
   * Default: Random 8 char sequence
   */
  name?: string;
  /**
   * Extention appended to file name. Can be any string and should include the dot (e.g. '.txt').
   * Default: Empty string
   */
  ext?: string;
  /**
   * Flags used while opening.
   * Default: fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_RDWR
   */
  flags?: number;
  /**
   * Mode used when opening the file.
   * Default: fs.constants.S_IRUSR | fs.constants.S_IWUSR
   */
  mode?: number;
  /**
   * Directory options used.
   * Default: Empty object
   */
  dirOptions?: TempDirOptions;
}

/**
 * Create a temporary file.
 * @param options File creation options.
 * @returns A promise that resolves to a temporary file object.
 *
 * @example
 * ```ts
 * import {file} from 'mktemp';
 * const myFile = await file();
 * await myFile.handle.write('Hello for a little while');
 * await myFile.clean();
 * ```
 */
export async function file(options: TempFileOptions = {}): Promise<TempFile> {
  const {
    name = randomFileName(8),
    ext = '',
    flags = DEFAULT_O_FLAGS,
    mode = DEFAULT_FILE_MODE,
    dirOptions = {},
  } = options;
  const tempDir = await dir(dirOptions);
  const filePath = path.join(tempDir.path, `${name}${ext}`);
  const fh = await pfs.open(filePath, flags, mode);
  return new TempFile(tempDir, filePath, fh);
}
