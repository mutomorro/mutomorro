/**
 * Supabase PostgREST caps .select() responses at 1,000 rows by default, silently.
 * For queries whose result is fed into a Set/Map/.filter/.forEach and whose
 * underlying table can exceed 1,000 rows, this helper walks .range() in pages
 * until a short page arrives.
 *
 * Prefer a server-side GROUP BY via .rpc() for counts/aggregates - this helper
 * is for the case where you genuinely need every row in memory.
 *
 * @param {(from: number, to: number) => any} queryFn
 *   Function that accepts (from, to) and returns a Supabase query builder
 *   already .range()-d to that window. The builder is awaited inside the loop.
 * @param {number} [pageSize=1000]
 * @returns {Promise<Array>} all rows concatenated
 */
export async function fetchAllPaginated(queryFn, pageSize = 1000) {
  const all = []
  let from = 0
  while (true) {
    const { data, error } = await queryFn(from, from + pageSize - 1)
    if (error) throw error
    if (!data || data.length === 0) break
    all.push(...data)
    if (data.length < pageSize) break
    from += pageSize
  }
  return all
}
