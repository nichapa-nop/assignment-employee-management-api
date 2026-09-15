/**
 * Departments are a fixed list for now (no department management screen),
 * stored as a PostgreSQL enum on the employees table.
 */
export enum Department {
  Engineering = 'Engineering',
  Marketing = 'Marketing',
  Sales = 'Sales',
  HR = 'HR',
}
