import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1777594479857 implements MigrationInterface {
  name = 'Migrations1777594479857';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_c5efd7db748b536d6a8bfa8ffc\` ON \`users\``);
    await queryRunner.query(`ALTER TABLE \`users\` ADD \`active_email\` varchar(255) AS (
    CASE
      WHEN deleted_at IS NULL THEN email
      ELSE NULL
    END
  ) STORED NULL`);
    await queryRunner.query(
      `INSERT INTO \`typeorm_metadata\`(\`database\`, \`schema\`, \`table\`, \`type\`, \`name\`, \`value\`) VALUES (DEFAULT, ?, ?, ?, ?, ?)`,
      [
        'social_network',
        'users',
        'GENERATED_COLUMN',
        'active_email',
        '\n    CASE\n      WHEN deleted_at IS NULL THEN email\n      ELSE NULL\n    END\n  ',
      ],
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_9fb2d5dcd0ef0a9cc17ebfb6f0\` (\`active_email\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP INDEX \`IDX_9fb2d5dcd0ef0a9cc17ebfb6f0\``,
    );
    await queryRunner.query(
      `DELETE FROM \`typeorm_metadata\` WHERE \`type\` = ? AND \`name\` = ? AND \`schema\` = ? AND \`table\` = ?`,
      ['GENERATED_COLUMN', 'active_email', 'social_network', 'users'],
    );
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`active_email\``);
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_c5efd7db748b536d6a8bfa8ffc\` ON \`users\` (\`email\`, \`deleted_at\`)`,
    );
  }
}
