export class MockConfigService {
  get = jest.fn((key: string) => {
    const config: Record<string, string> = {
      ACCESS_SECRET: 'access-secret',
      ACCESS_EXPIRES_IN: '15m',
      REFRESH_SECRET: 'refresh-secret',
      REFRESH_EXPIRES_IN: '7d',
    };
    return config[key];
  });
}
