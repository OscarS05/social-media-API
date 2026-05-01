import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateUniqueIndexInProfileEntity1777585607201 implements MigrationInterface {
  name = 'Migrations1777585607201';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_662a3ed389daf608456aebce77\` ON \`profiles\``);
    await queryRunner.query(`ALTER TABLE \`profiles\` ADD \`active_username\` varchar(50) AS (
    CASE
      WHEN deleted_at IS NULL THEN username
      ELSE NULL
    END
  ) STORED NULL`);
    await queryRunner.query(
      `INSERT INTO \`typeorm_metadata\`(\`database\`, \`schema\`, \`table\`, \`type\`, \`name\`, \`value\`) VALUES (DEFAULT, ?, ?, ?, ?, ?)`,
      [
        'social_network',
        'profiles',
        'GENERATED_COLUMN',
        'active_username',
        '\n    CASE\n      WHEN deleted_at IS NULL THEN username\n      ELSE NULL\n    END\n  ',
      ],
    );
    await queryRunner.query(
      `ALTER TABLE \`profiles\` ADD UNIQUE INDEX \`IDX_bff1c3a83f50733a9f154e6296\` (\`active_username\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`profiles\` DROP INDEX \`IDX_bff1c3a83f50733a9f154e6296\``,
    );
    await queryRunner.query(
      `DELETE FROM \`typeorm_metadata\` WHERE \`type\` = ? AND \`name\` = ? AND \`schema\` = ? AND \`table\` = ?`,
      ['GENERATED_COLUMN', 'active_username', 'social_network', 'profiles'],
    );
    await queryRunner.query(`ALTER TABLE \`profiles\` DROP COLUMN \`active_username\``);
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_662a3ed389daf608456aebce77\` ON \`profiles\` (\`username\`, \`deleted_at\`)`,
    );
  }
}
