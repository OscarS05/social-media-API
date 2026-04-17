export abstract class HasherService {
  abstract hash(data: string, rounds?: number): Promise<string>;
  abstract compare(plain: string, hashed: string): Promise<boolean>;
}
