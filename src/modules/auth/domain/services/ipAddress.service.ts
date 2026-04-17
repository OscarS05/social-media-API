export abstract class IpAddressService {
  abstract normalize(ip: string): string;
  abstract isValid(ip: string): boolean;
}
