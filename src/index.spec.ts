import fs, {promises as pfs} from 'fs';
import os from 'os';
import path from 'path';

import {dir, file} from './index';

describe('mktemp', () => {
  describe('directory creation and cleanup', () => {
    it('should create a default temp directory and be cleaned', async () => {
      const tempDir = await dir();
      expect(fs.existsSync(tempDir.path)).toBeTruthy();
      expect(tempDir.path).toContain(os.tmpdir());
      await expect(tempDir.clean()).resolves.toBeUndefined();
      expect(fs.existsSync(tempDir.path)).toBeFalsy();
    });

    it('should create a temp directory with prefix and be cleaned', async () => {
      const prefix = 'my-prefix';
      const tempDir = await dir({prefix});
      expect(fs.existsSync(tempDir.path)).toBeTruthy();
      expect(tempDir.path.includes(prefix));
      expect(tempDir.path.startsWith(os.tmpdir()));
      await expect(tempDir.clean()).resolves.toBeUndefined();
      expect(fs.existsSync(tempDir.path)).toBeFalsy();
    });
  });

  describe('file creation and cleanup', () => {
    it('should create a temp file and be cleaned', async () => {

      const fileContent = 'Hello!';
      const tempFile = await file();
      await tempFile.handle.writeFile(fileContent);
      await tempFile.handle.close();

      await expect(pfs.readFile(tempFile.path, {encoding: 'utf-8'}))
        .resolves.toBe(fileContent);
      expect(fs.existsSync(tempFile.path)).toBeTruthy();
      expect(tempFile.path).toContain(os.tmpdir());

      await expect(tempFile.clean()).resolves.toBeUndefined();
      expect(fs.existsSync(tempFile.path)).toBeFalsy();
      expect(fs.existsSync(path.dirname(tempFile.path))).toBeFalsy();
    });

    it('should create a temp file with options and be cleaned', async () => {
      const dirPrefix = 'my-dir';
      const fileName = 'my-file';
      const fileExt = '.txt';
      const fileMode = fs.constants.S_IRUSR;
      const tempFile = await file({
        name: fileName,
        ext: fileExt,
        mode: fileMode,
        dirOptions: {
          prefix: dirPrefix,
        },
      });

      expect(fs.existsSync(tempFile.path)).toBeTruthy();
      expect(tempFile.path).toContain(os.tmpdir());
      expect(tempFile.path).toContain(`${fileName}${fileExt}`);
      expect(tempFile.path).toContain(dirPrefix);
      await expect(tempFile.clean()).resolves.toBeUndefined();
      expect(fs.existsSync(tempFile.path)).toBeFalsy();
      expect(fs.existsSync(path.dirname(tempFile.path))).toBeFalsy();
    });
  });
});
