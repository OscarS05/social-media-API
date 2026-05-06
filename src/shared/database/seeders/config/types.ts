export interface SeederTask {
  tag: string[];

  run(): Promise<any>;
  runForTests(): Promise<void>;
}

export enum SeedersTag {
  USERS = 'users',
  SESSIONS = 'sessions',
  PROFILE = 'profile',
}
