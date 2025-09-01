import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitUserAuthRefreshTokens1756489630504 implements MigrationInterface {
  name = 'InitUserAuthRefreshTokens1756489630504';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`role\` enum ('member', 'admin') NOT NULL DEFAULT 'member', \`deleted_at\` timestamp(0) NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`auth\` (\`id\` varchar(36) NOT NULL, \`email\` varchar(255) NULL, \`password\` varchar(255) NULL, \`provider\` enum ('local', 'google', 'facebook') NOT NULL DEFAULT 'local', \`provider_user_id\` varchar(255) NULL, \`reset_token\` varchar(255) NULL, \`is_verified\` tinyint NOT NULL DEFAULT 0, \`deleted_at\` timestamp(0) NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`user_id\` varchar(36) NOT NULL, INDEX \`IDX_b54f616411ef3824f6a5c06ea4\` (\`email\`), INDEX \`IDX_b258701252799b59135e88cc95\` (\`provider_user_id\`, \`provider\`), UNIQUE INDEX \`oauth_unique\` (\`provider\`, \`provider_user_id\`, \`deleted_at\`), PRIMARY KEY (\`id\`), CONSTRAINT \`FK_9922406dc7d70e20423aeffadf3\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`refresh_tokens\` (\`id\` varchar(36) NOT NULL, \`token_hashed\` varchar(255) NOT NULL, \`user_agent\` varchar(255) NULL, \`ip_address\` varchar(255) NULL, \`revoked\` tinyint NOT NULL DEFAULT 0, \`expires_at\` timestamp(0) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`user_id\` varchar(36) NULL, INDEX \`IDX_refresh_tokens_user_id\` (\`user_id\`), INDEX \`IDX_refresh_token_hashed\` (\`token_hashed\`), PRIMARY KEY (\`id\`), CONSTRAINT \`FK_3ddc983c5f7bcf132fd8732c3f4\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`refresh_tokens\``);
    await queryRunner.query(`DROP TABLE \`auth\``);
    await queryRunner.query(`DROP TABLE \`users\``);
  }
}
