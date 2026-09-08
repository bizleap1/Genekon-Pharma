import { eq, isNull, and, asc } from "drizzle-orm";
import { db, categories, products, Category, NewCategory } from "../db";

export interface CategoryTreeNode extends Category {
  subcategories: Category[];
  subCategories: Category[];
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const categoryService = {
  /**
   * Get all categories structured as a tree (Main Categories -> Subcategories)
   */
  async getCategoryTree(): Promise<CategoryTreeNode[]> {
    const allCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.displayOrder), asc(categories.name));

    const mainCategories = allCategories.filter((c) => !c.parentCategoryId);
    const subCategories = allCategories.filter((c) => !!c.parentCategoryId);

    return mainCategories.map((main) => {
      const subs = subCategories.filter((sub) => sub.parentCategoryId === main.id);
      return {
        ...main,
        subcategories: subs,
        subCategories: subs,
      };
    });
  },

  /**
   * Get flat list of active categories
   */
  async getFlatCategories(): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.displayOrder));
  },

  /**
   * Get category by slug with child subcategories
   */
  async getCategoryBySlug(slug: string): Promise<CategoryTreeNode | null> {
    const [category] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.slug, slug), eq(categories.isActive, true)))
      .limit(1);

    if (!category) return null;

    const subs = await db
      .select()
      .from(categories)
      .where(and(eq(categories.parentCategoryId, category.id), eq(categories.isActive, true)))
      .orderBy(asc(categories.displayOrder));

    return {
      ...category,
      subcategories: subs,
      subCategories: subs,
    };
  },

  /**
   * Admin: Create new category
   */
  async createCategory(data: {
    name: string;
    slug?: string;
    image?: string | null;
    parentCategoryId?: string | null;
    displayOrder?: number;
    isActive?: boolean;
  }): Promise<Category> {
    const slug = data.slug || generateSlug(data.name);

    // 1. Check duplicate slug
    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    if (existing) {
      throw new Error(`Category with slug '${slug}' already exists`);
    }

    // 2. If parent provided, verify parent exists
    if (data.parentCategoryId) {
      const [parent] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, data.parentCategoryId))
        .limit(1);

      if (!parent) {
        throw new Error("Specified parent category does not exist");
      }
    }

    const [created] = await db
      .insert(categories)
      .values({
        name: data.name,
        slug,
        image: data.image || null,
        parentCategoryId: data.parentCategoryId || null,
        displayOrder: data.displayOrder ?? 0,
        isActive: data.isActive ?? true,
      })
      .returning();

    return created;
  },

  /**
   * Admin: Update category
   */
  async updateCategory(
    id: string,
    data: {
      name?: string;
      slug?: string;
      image?: string | null;
      parentCategoryId?: string | null;
      displayOrder?: number;
      isActive?: boolean;
    }
  ): Promise<Category> {
    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!existing) {
      throw new Error("Category not found");
    }

    const slug = data.slug || (data.name ? generateSlug(data.name) : undefined);

    if (slug && slug !== existing.slug) {
      const [duplicate] = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, slug))
        .limit(1);

      if (duplicate) {
        throw new Error(`Category with slug '${slug}' already exists`);
      }
    }

    if (data.parentCategoryId && data.parentCategoryId === id) {
      throw new Error("A category cannot be its own parent");
    }

    const [updated] = await db
      .update(categories)
      .set({
        ...(data.name && { name: data.name }),
        ...(slug && { slug }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.parentCategoryId !== undefined && { parentCategoryId: data.parentCategoryId }),
        ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    return updated;
  },

  /**
   * Admin: Delete category (checks subcategory and product dependencies)
   */
  async deleteCategory(id: string): Promise<{ id: string; message: string }> {
    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!existing) {
      throw new Error("Category not found");
    }

    // Check if products exist in category
    const linkedProducts = await db
      .select()
      .from(products)
      .where(eq(products.categoryId, id))
      .limit(1);

    if (linkedProducts.length > 0) {
      throw new Error("Cannot delete category containing products. Reassign products first.");
    }

    // Check if child subcategories exist
    const childCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.parentCategoryId, id))
      .limit(1);

    if (childCategories.length > 0) {
      throw new Error("Cannot delete category containing subcategories. Delete or reassign subcategories first.");
    }

    await db.delete(categories).where(eq(categories.id, id));

    return { id, message: "Category deleted successfully" };
  },
};
