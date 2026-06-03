/**
 * Data provider abstraction — production uses Supabase only.
 */
export type DataProviderMode = "supabase" | "demo";

export interface IDataProvider {
  readonly mode: DataProviderMode;
  readonly isProduction: boolean;
}
