import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitProfilesFollowsBlocksAndUpdateUser1777502543022 implements MigrationInterface {
  name = 'Migrations1777502543022';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_c5efd7db748b536d6a8bfa8ffc\` ON \`users\``);
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_c5efd7db748b536d6a8bfa8ffc\` ON \`users\` (\`email\`, \`deleted_at\`)`,
    );
    await queryRunner.query(
      `CREATE TABLE \`profiles\` (\`user_id\` varchar(36) NOT NULL, \`username\` varchar(50) NOT NULL, \`bio\` varchar(255) NULL, \`type_privacy\` enum ('private', 'public') NOT NULL DEFAULT 'public', \`avatar_url\` varchar(2083) NULL, \`cover_photo_url\` varchar(2083) NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, UNIQUE INDEX \`IDX_662a3ed389daf608456aebce77\` (\`username\`, \`deleted_at\`), PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`follows\` (\`follower_id\` varchar(36) NOT NULL, \`following_id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX \`IDX_c518e3988b9c057920afaf2d8c\` (\`following_id\`), INDEX \`IDX_54b5dc2739f2dea57900933db6\` (\`follower_id\`), PRIMARY KEY (\`follower_id\`, \`following_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`blocks\` (\`blocker_id\` varchar(36) NOT NULL, \`blocked_id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX \`IDX_8aa6c887bed61ad10829450f2f\` (\`blocked_id\`), INDEX \`IDX_74f530c6fbffc357047b263818\` (\`blocker_id\`), PRIMARY KEY (\`blocker_id\`, \`blocked_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`follows\` ADD CONSTRAINT \`FK_54b5dc2739f2dea57900933db66\` FOREIGN KEY (\`follower_id\`) REFERENCES \`profiles\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`follows\` ADD CONSTRAINT \`FK_c518e3988b9c057920afaf2d8c0\` FOREIGN KEY (\`following_id\`) REFERENCES \`profiles\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`blocks\` ADD CONSTRAINT \`FK_74f530c6fbffc357047b263818d\` FOREIGN KEY (\`blocker_id\`) REFERENCES \`profiles\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`blocks\` ADD CONSTRAINT \`FK_8aa6c887bed61ad10829450f2f0\` FOREIGN KEY (\`blocked_id\`) REFERENCES \`profiles\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`profiles\` ADD CONSTRAINT \`FK_9e432b7df0d182f8d292902d1a2\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`profiles\` DROP FOREIGN KEY \`FK_9e432b7df0d182f8d292902d1a2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`blocks\` DROP FOREIGN KEY \`FK_8aa6c887bed61ad10829450f2f0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`blocks\` DROP FOREIGN KEY \`FK_74f530c6fbffc357047b263818d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`follows\` DROP FOREIGN KEY \`FK_c518e3988b9c057920afaf2d8c0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`follows\` DROP FOREIGN KEY \`FK_54b5dc2739f2dea57900933db66\``,
    );
    await queryRunner.query(`DROP INDEX \`IDX_74f530c6fbffc357047b263818\` ON \`blocks\``);
    await queryRunner.query(`DROP INDEX \`IDX_8aa6c887bed61ad10829450f2f\` ON \`blocks\``);
    await queryRunner.query(`DROP TABLE \`blocks\``);
    await queryRunner.query(`DROP INDEX \`IDX_54b5dc2739f2dea57900933db6\` ON \`follows\``);
    await queryRunner.query(`DROP INDEX \`IDX_c518e3988b9c057920afaf2d8c\` ON \`follows\``);
    await queryRunner.query(`DROP TABLE \`follows\``);
    await queryRunner.query(`DROP INDEX \`IDX_662a3ed389daf608456aebce77\` ON \`profiles\``);
    await queryRunner.query(`DROP TABLE \`profiles\``);
    await queryRunner.query(`DROP INDEX \`IDX_c5efd7db748b536d6a8bfa8ffc\` ON \`users\``);
    await queryRunner.query(
      `CREATE INDEX \`IDX_c5efd7db748b536d6a8bfa8ffc\` ON \`users\` (\`email\`, \`deleted_at\`)`,
    );
  }
}
