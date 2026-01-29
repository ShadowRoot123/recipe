export type AllergenId =
  | 'dairy'
  | 'eggs'
  | 'gluten'
  | 'peanuts'
  | 'tree_nuts'
  | 'fish'
  | 'shellfish'
  | 'soy'
  | 'sesame';

export const ALLERGENS: Array<{ id: AllergenId; label: string }> = [
  { id: 'dairy', label: 'Dairy' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'gluten', label: 'Gluten' },
  { id: 'peanuts', label: 'Peanuts' },
  { id: 'tree_nuts', label: 'Tree Nuts' },
  { id: 'fish', label: 'Fish' },
  { id: 'shellfish', label: 'Shellfish' },
  { id: 'soy', label: 'Soy' },
  { id: 'sesame', label: 'Sesame' },
];

export const ALLERGEN_KEYWORDS: Record<AllergenId, string[]> = {
  dairy: ['milk', 'butter', 'cheese', 'cream', 'yogurt', 'yoghurt', 'ghee', 'ice cream'],
  eggs: ['egg', 'eggs', 'yolk', 'whites'],
  gluten: ['flour', 'bread', 'pasta', 'wheat', 'semolina', 'breadcrumbs', 'noodles', 'biscuit', 'biscuits'],
  peanuts: ['peanut', 'peanuts', 'peanut butter'],
  tree_nuts: ['almond', 'almonds', 'cashew', 'cashews', 'walnut', 'walnuts', 'hazelnut', 'hazelnuts', 'pistachio', 'pistachios'],
  fish: ['fish', 'salmon', 'tuna', 'cod', 'anchovy', 'anchovies', 'sardine', 'sardines'],
  shellfish: ['shrimp', 'prawn', 'prawns', 'crab', 'lobster', 'mussel', 'mussels', 'clam', 'clams', 'scallop', 'scallops'],
  soy: ['soy', 'soya', 'tofu', 'edamame', 'soy sauce', 'miso'],
  sesame: ['sesame', 'tahini'],
};

