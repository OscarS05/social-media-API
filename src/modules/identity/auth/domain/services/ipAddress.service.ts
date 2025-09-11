export interface IpAddressService {
  normalize(ip: string): string;
  isValid(ip: string): boolean;
  getVersion(ip: string): 4 | 6 | null;
}
