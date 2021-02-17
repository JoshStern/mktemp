# Temporary directories and files for NodeJS
Simple async wrapper for managing temporary directories and files.

## Requirements
The distribution of this project targets ES2020 and makes use of `fs.rm()` which was added in **NodeJS v14.14.0**.

## Installation
```sh
npm install @josh_stern/mktemp
```

## Usage
[**Documentation Homepage**](https://joshstern.github.io/mktemp)

`@josh_stern/mktemp` does its best to choose reasonable defaults and relies on NodeJS modules as much as possible to maintain compatibility across systems. It uses `fs.mkdtemp` for generating unique directories in your system's temp folder (`os.tmpdir()`).

### `dir`
Generate a unique temporary directory.
```ts
import {dir} from '@josh_stern/mktemp';
const myTempDir = await dir();
// Write files to myTempDir.path
await myTempDir.clean();
```
Options can be provided to add a prefix to the temp dir.
```ts
import {dir} from '@josh_stern/mktemp';
const myTempDir = await dir({prefix: 'my-dir'});
// myTempDir.path is now /var/folders/9a/0abc/T/my-dirSBv8Uk or the equivalent for your system
// ...
await myTempDir.clean();
```
### `file`
Generates a unique directory and opens a file within.
```ts
import {file} from '@josh_stern/mktemp';
const myTempFile = await file();
await myTempFile.handle.writeFile('Hello for now!');
await myTempFile.clean();
```
Options can be provided to set the file name, mode, flags, etc.
```ts
import {file} from '@josh_stern/mktemp';
const myTempFile = await file({name: 'my-file', ext: '.txt'});
// myTempFile.path now ends in 'my-file.txt'
// ...
await myTempFile.clean();
```