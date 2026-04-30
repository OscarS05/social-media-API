export interface SeederTask {
  tag: string[];

  run(): Promise<any>;
  runForTests(): Promise<void>;
}
