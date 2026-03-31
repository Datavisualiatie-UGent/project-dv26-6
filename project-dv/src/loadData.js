export function normalizeRow(row) {
  return {
    ...row,
    date_published: row.date_published ? new Date(row.date_published) : null,
    calories: row.calories ?? null,
    fat: row.fat ?? null,
    carbs: row.carbs ?? null,
    protein: row.protein ?? null,
    avg_rating: row.avg_rating ?? null,
    total_ratings: row.total_ratings ?? null,
    reviews: row.reviews ?? null,
    prep_time: row.prep_time ?? null,
    cook_time: row.cook_time ?? null,
    total_time: row.total_time ?? null,
    servings: row.servings ?? null
  };
}