import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableHistoryAll1708610681130 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const processFirstName = (name) => {
      const indexOfUnderscore = name.indexOf('_');

      if (indexOfUnderscore !== -1) {
        // Extract characters before the first underscore
        const substringBeforeUnderscore = name.substring(0, indexOfUnderscore);

        // Trim the last 's' if it exists
        const modifiedName = substringBeforeUnderscore.replace(/s$/, '');

        return modifiedName;
      }

      // If no underscore found, return the original string
      return name;
    };

    const processSecondtName = (name) => {
      const indexOfUnderscore = name.indexOf('_');

      if (indexOfUnderscore !== -1) {
        // Extract characters after the first underscore
        const substringBeforeUnderscore = name.substring(indexOfUnderscore + 1);

        const modifiedName = substringBeforeUnderscore.replace(/s$/, '');
        return modifiedName;
      }

      // If no underscore found, return an empty string
      return '';
    };
    // eslint-disable-next-line
    const path = require('path');
    // eslint-disable-next-line
    const fs = require('fs');
    const filePath = path.join(
      __dirname,
      '../JsonData/seed-history-table.json'
    );
    const seedData = JSON.parse(fs.readFileSync(filePath));

    for (const data of seedData?.table_names) {
      const tableName = data.name;

      // Dynamically get columns of the main and history tables
      const mainColumns = await this.getTableColumns(queryRunner, tableName);
      const historyColumns = await this.getTableColumns(
        queryRunner,
        `${tableName}_history`
      );
      if (
        !mainColumns.includes('id') &&
        tableName !== 'drives_donor_comms_supp_accounts' &&
        tableName !== 'shifts_projections_staff'
      ) {
        await queryRunner.query(
          `ALTER TABLE ${tableName} ADD COLUMN id bigserial  UNIQUE;`
        );
        await queryRunner.query(
          `ALTER TABLE ${tableName}_history ADD COLUMN id bigint;`
        );
        await queryRunner.query(`UPDATE ${tableName} SET id = DEFAULT;`);

        await queryRunner.query(
          ` UPDATE ${tableName}
            SET id = id + 1 - subquery.min_id
            FROM (
              SELECT MIN(id) as min_id
              FROM ${tableName}
            ) as subquery;`
        );
        const col1 = await processFirstName(tableName);
        const col2 = await processSecondtName(tableName);
        await queryRunner.query(
          ` UPDATE ${tableName}_history 
            SET id = ${tableName}.id
            FROM ${tableName} 
            WHERE ${tableName}_history.${col1}_id = ${tableName}.${col1}_id 
            AND ${tableName}_history.${col2}_id = ${tableName}.${col2}_id;`
        );
      }

      if (
        tableName == 'drives_donor_comms_supp_accounts' &&
        !mainColumns.includes('id')
      ) {
        await queryRunner.query(
          `ALTER TABLE ${tableName} ADD COLUMN id bigserial  UNIQUE;`
        );
        await queryRunner.query(
          `ALTER TABLE ${tableName}_history ADD COLUMN id bigint;`
        );
        await queryRunner.query(`UPDATE ${tableName} SET id = DEFAULT;`);

        await queryRunner.query(
          ` UPDATE ${tableName}
            SET id = id + 1 - subquery.min_id
            FROM (
              SELECT MIN(id) as min_id
              FROM ${tableName}
            ) as subquery;`
        );
        //  const col1 = await processFirstName(tableName);
        //  const col2 = await processSecondtName(tableName);
        await queryRunner.query(
          ` UPDATE ${tableName}_history 
            SET id = ${tableName}.id
            FROM ${tableName} 
            WHERE ${tableName}_history.drive_id = ${tableName}.drive_id 
            AND ${tableName}_history.account_id = ${tableName}.account_id;`
        );
      }

      if (
        tableName == 'shifts_projections_staff' &&
        !mainColumns.includes('id')
      ) {
        await queryRunner.query(
          `ALTER TABLE ${tableName} ADD COLUMN id bigserial UNIQUE;`
        );
        await queryRunner.query(
          `ALTER TABLE ${tableName}_history ADD COLUMN id bigint;`
        );
        await queryRunner.query(`UPDATE ${tableName} SET id = DEFAULT;`);

        await queryRunner.query(
          ` UPDATE ${tableName}
            SET id = id + 1 - subquery.min_id
            FROM (
              SELECT MIN(id) as min_id
              FROM ${tableName}
            ) as subquery;`
        );
        //  const col1 = await processFirstName(tableName);
        //  const col2 = await processSecondtName(tableName);
        await queryRunner.query(
          ` UPDATE ${tableName}_history 
            SET id = ${tableName}.id
            FROM ${tableName} 
            WHERE ${tableName}_history.shift_id = ${tableName}.shift_id 
            AND ${tableName}_history.staff_setup_id = ${tableName}.staff_setup_id;`
        );
      }
      // Exclude 'rowKey' and 'history_reason' from comparison
      const diffColumns = mainColumns.filter(
        (col) =>
          col.trim().toLowerCase() !== 'rowkey' &&
          col.trim().toLowerCase() !== 'history_reason'
      );
      const ExculdeColumns = historyColumns.filter(
        (col) =>
          col.trim().toLowerCase() !== 'rowkey' &&
          col.trim().toLowerCase() !== 'history_reason'
      );
      // console.log({ ExculdeColumns });
      // eslint-disable-next-line
      let hasDifference: boolean;

      const resolvedColumns = await Promise.all(
        ExculdeColumns.map(
          async (col) =>
            `${col} ${await this.getColumnType(queryRunner, tableName, col)}`
        )
      );

      console.log({ resolvedColumns });
      const hasUserDefinedType = resolvedColumns.some((column) =>
        column.includes('USER-DEFINED')
      );
      console.log({ hasUserDefinedType });

      // Check if there's a difference in columns
      hasDifference = !this.arrayEquals(mainColumns, ExculdeColumns);

      if (hasDifference || hasUserDefinedType) {
        console.log(
          `Columns mismatch for ${tableName}. Recreating history table...`
        );
        await this.recreateHistoryTable(queryRunner, tableName, diffColumns);
      }
    }
  }

  private async getTableColumns(
    queryRunner: QueryRunner,
    tableName: string
  ): Promise<string[]> {
    const columnsQuery = `SELECT column_name FROM information_schema.columns WHERE table_name = $1`;
    const columnsResult = await queryRunner.query(columnsQuery, [tableName]);
    // console.log({ columnsResult });
    return columnsResult.map((row: any) => row.column_name);
  }

  private async recreateHistoryTable(
    queryRunner: QueryRunner,
    tableName: string,
    columns: string[]
  ): Promise<void> {
    const dropHistoryTableQuery = `DROP TABLE IF EXISTS ${tableName}_history`;

    // Resolve all promises in parallel using Promise.all
    const resolvedColumns = await Promise.all(
      columns.map(
        async (col) =>
          `${col} ${await this.getColumnType(queryRunner, tableName, col)}`
      )
    );

    console.log({ resolvedColumns });

    const columnDefinitions = resolvedColumns
      .map((col) =>
        col
          .replace(/USER-DEFINED/g, 'TEXT')
          .replace(/offset/g, '"offset"')
          .replace(/ARRAY/g, 'TEXT[]')
      )
      .join(', ');

    console.log({ columnDefinitions });

    const createHistoryTableQuery = `
    CREATE TABLE ${tableName}_history (
      rowKey SERIAL PRIMARY KEY,
      ${columnDefinitions},
      history_reason VARCHAR(1)
    )
  `;

    await queryRunner.query(dropHistoryTableQuery);
    await queryRunner.query(createHistoryTableQuery);
  }

  private async getColumnType(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string
  ): Promise<string> {
    const columnQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = $1 AND column_name = $2
    `;

    const columnResult = await queryRunner.query(columnQuery, [
      tableName,
      columnName,
    ]);

    if (columnResult.length > 0) {
      const { data_type, is_nullable } = columnResult[0];
      return `${data_type} ${is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`;
    }

    // Default to TEXT type if column information is not found (you can adjust as needed)
    return 'TEXT';
  }

  private arrayEquals(arr1: string[], arr2: string[]): boolean {
    if (arr1.length !== arr2.length) {
      return false;
    }
    // console.log({ arr1, arr2 });
    for (const value of arr1) {
      if (!arr2.includes(value)) {
        return false;
      }
    }
    for (const value of arr2) {
      if (!arr1.includes(value)) {
        return false;
      }
    }

    return true;
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // You can add down migration actions if needed
  }
}
