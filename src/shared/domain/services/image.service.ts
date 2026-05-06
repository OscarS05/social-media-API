export type Folder = 'avatars' | 'covers' | 'posts';

export abstract class ImageStoragePort {
  abstract save(file: Buffer, filename: string, folder: Folder): Promise<string>;
  abstract delete(path: string): Promise<boolean>;
}
