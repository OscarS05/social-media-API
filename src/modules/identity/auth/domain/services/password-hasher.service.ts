export interface IHasherService {
  hash(data: string, rounds: number): Promise<string>;
  compare(plain: string, hashed: string): Promise<boolean>;
}
