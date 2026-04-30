import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitUsersSession1776464385239 implements MigrationInterface {
  name = 'Migrations1776464385239';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`role\` enum ('member', 'admin') NOT NULL DEFAULT 'member', \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NULL, \`provider\` enum ('local', 'google') NOT NULL DEFAULT 'local', \`provider_id\` varchar(255) NULL, \`reset_token\` varchar(255) NULL, \`is_verified\` tinyint NOT NULL DEFAULT 0, \`deleted_at\` timestamp(0) NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX \`IDX_9c126dfdc9977c5a4378049447\` (\`provider\`, \`provider_id\`), INDEX \`IDX_c5efd7db748b536d6a8bfa8ffc\` (\`email\`, \`deleted_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`sessions\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`token_hashed\` varchar(255) NOT NULL, \`version\` int NOT NULL, \`user_agent\` json NOT NULL, \`ip_address\` varchar(255) NOT NULL, \`revoked\` tinyint NOT NULL DEFAULT 0, \`expires_at\` timestamp(0) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX \`IDX_50e29e6d8e0aaf8aeef10e78a7\` (\`id\`, \`revoked\`), INDEX \`IDX_085d540d9f418cfbdc7bd55bb1\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sessions\` ADD CONSTRAINT \`FK_085d540d9f418cfbdc7bd55bb19\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`sessions\` DROP FOREIGN KEY \`FK_085d540d9f418cfbdc7bd55bb19\``,
    );
    await queryRunner.query(`DROP INDEX \`IDX_c5efd7db748b536d6a8bfa8ffc\` ON \`users\``);
    await queryRunner.query(`DROP INDEX \`IDX_9c126dfdc9977c5a4378049447\` ON \`users\``);
    await queryRunner.query(`DROP INDEX \`IDX_085d540d9f418cfbdc7bd55bb1\` ON \`sessions\``);
    await queryRunner.query(`DROP INDEX \`IDX_50e29e6d8e0aaf8aeef10e78a7\` ON \`sessions\``);
    await queryRunner.query(`DROP TABLE \`sessions\``);
    await queryRunner.query(`DROP TABLE \`users\``);
  }
}
