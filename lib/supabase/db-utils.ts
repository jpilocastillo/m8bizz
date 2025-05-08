import { createAdminClient } from "./admin"

/**
 * Utility function to check if a table exists in the database
 */
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    const supabase = await createAdminClient()

    // Query the information schema to check if the table exists
    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", tableName)
      .single()

    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error)
      return false
    }

    return !!data
  } catch (error) {
    console.error(`Error in tableExists for ${tableName}:`, error)
    return false
  }
}

/**
 * Utility function to check database connection
 */
export async function checkDatabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    const supabase = await createAdminClient()

    // Simple query to check connection
    const { error } = await supabase.from("profiles").select("id").limit(1)

    if (error) {
      return { connected: false, error: error.message }
    }

    return { connected: true }
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error checking database connection",
    }
  }
}

/**
 * Utility function to get database schema information
 */
export async function getDatabaseSchema(): Promise<any> {
  try {
    const supabase = await createAdminClient()

    // Query the information schema to get table and column information
    const { data, error } = await supabase
      .from("information_schema.columns")
      .select("table_schema, table_name, column_name, data_type")
      .eq("table_schema", "public")

    if (error) {
      console.error("Error getting database schema:", error)
      return null
    }

    // Organize the data by table
    const schema = data.reduce((acc, column) => {
      const tableName = column.table_name

      if (!acc[tableName]) {
        acc[tableName] = {
          table_schema: column.table_schema,
          table_name: tableName,
          columns: [],
        }
      }

      acc[tableName].columns.push({
        column_name: column.column_name,
        data_type: column.data_type,
      })

      return acc
    }, {})

    return Object.values(schema)
  } catch (error) {
    console.error("Error in getDatabaseSchema:", error)
    return null
  }
}
