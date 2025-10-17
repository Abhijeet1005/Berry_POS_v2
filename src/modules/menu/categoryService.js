const Category = require('../../models/Category');
const { NotFoundError } = require('../../utils/errorHandler');

/**
 * Create a new category
 */
const createCategory = async (categoryData, tenantId) => {
  const category = new Category({
    ...categoryData,
    tenantId
  });
  
  await category.save();
  return category;
};

/**
 * Get all categories
 */
const getCategories = async (tenantId, includeInactive = false) => {
  const filter = { tenantId };
  
  if (!includeInactive) {
    filter.isActive = true;
  }
  
  const categories = await Category.find(filter).sort({ displayOrder: 1, name: 1 });
  
  return categories;
};

/**
 * Get category by ID
 */
const getCategoryById = async (categoryId, tenantId) => {
  const category = await Category.findOne({ _id: categoryId, tenantId, isActive: true });
  
  if (!category) {
    throw new NotFoundError('Category');
  }
  
  return category;
};

/**
 * Update category
 */
const updateCategory = async (categoryId, updateData, tenantId) => {
  const category = await Category.findOne({ _id: categoryId, tenantId, isActive: true });
  
  if (!category) {
    throw new NotFoundError('Category');
  }
  
  Object.assign(category, updateData);
  await category.save();
  
  return category;
};

/**
 * Delete category (soft delete)
 */
const deleteCategory = async (categoryId, tenantId) => {
  const category = await Category.findOne({ _id: categoryId, tenantId, isActive: true });
  
  if (!category) {
    throw new NotFoundError('Category');
  }
  
  // Check if category has dishes
  const Dish = require('../../models/Dish');
  const dishCount = await Dish.countDocuments({ categoryId, isActive: true });
  
  if (dishCount > 0) {
    throw new ValidationError('Cannot delete category with active dishes');
  }
  
  category.isActive = false;
  await category.save();
  
  return { message: 'Category deleted successfully' };
};

/**
 * Reorder categories
 */
const reorderCategories = async (categoryOrders, tenantId) => {
  const results = [];
  
  for (const order of categoryOrders) {
    const category = await Category.findOne({ _id: order.categoryId, tenantId, isActive: true });
    
    if (category) {
      category.displayOrder = order.displayOrder;
      await category.save();
      results.push({ categoryId: order.categoryId, success: true });
    } else {
      results.push({ categoryId: order.categoryId, success: false, error: 'Category not found' });
    }
  }
  
  return results;
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  reorderCategories
};
