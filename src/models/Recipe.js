const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  outletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  dishId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dish',
    required: true
  },
  ingredients: [{
    inventoryItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true
    },
    cost: {
      type: Number,
      min: 0
    }
  }],
  portionSize: {
    type: String,
    trim: true
  },
  preparationNotes: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
recipeSchema.index({ tenantId: 1, outletId: 1, dishId: 1 }, { unique: true });
recipeSchema.index({ tenantId: 1, 'ingredients.inventoryItemId': 1 });

// Virtual for total cost
recipeSchema.virtual('totalCost').get(function() {
  return this.ingredients.reduce((sum, ingredient) => {
    return sum + (ingredient.cost || 0);
  }, 0);
});

// Calculate total cost of recipe
recipeSchema.methods.calculateTotalCost = async function() {
  const InventoryItem = mongoose.model('InventoryItem');
  let totalCost = 0;
  
  for (const ingredient of this.ingredients) {
    const item = await InventoryItem.findById(ingredient.inventoryItemId);
    if (item) {
      ingredient.cost = item.unitCost * ingredient.quantity;
      totalCost += ingredient.cost;
    }
  }
  
  return totalCost;
};

// Deduct inventory for recipe
recipeSchema.methods.deductInventory = async function(dishQuantity = 1) {
  const InventoryItem = mongoose.model('InventoryItem');
  const StockMovement = mongoose.model('StockMovement');
  
  for (const ingredient of this.ingredients) {
    const item = await InventoryItem.findById(ingredient.inventoryItemId);
    
    if (!item) {
      throw new Error(`Inventory item ${ingredient.inventoryItemId} not found`);
    }
    
    const requiredQuantity = ingredient.quantity * dishQuantity;
    
    if (item.currentStock < requiredQuantity) {
      throw new Error(`Insufficient stock for ${item.name}. Required: ${requiredQuantity}, Available: ${item.currentStock}`);
    }
    
    const previousStock = item.currentStock;
    await item.updateStock(requiredQuantity, 'decrement');
    
    // Create stock movement record
    await StockMovement.create({
      tenantId: this.tenantId,
      outletId: this.outletId,
      inventoryItemId: item._id,
      type: 'usage',
      quantity: -requiredQuantity,
      unit: ingredient.unit,
      previousStock,
      newStock: item.currentStock,
      unitCost: item.unitCost,
      referenceType: 'Recipe',
      referenceId: this._id,
      timestamp: new Date()
    });
  }
  
  return true;
};

// Check if all ingredients are available
recipeSchema.methods.checkAvailability = async function(dishQuantity = 1) {
  const InventoryItem = mongoose.model('InventoryItem');
  const unavailableItems = [];
  
  for (const ingredient of this.ingredients) {
    const item = await InventoryItem.findById(ingredient.inventoryItemId);
    
    if (!item || !item.isActive) {
      unavailableItems.push({
        name: item?.name || 'Unknown',
        reason: 'Item not found or inactive'
      });
      continue;
    }
    
    const requiredQuantity = ingredient.quantity * dishQuantity;
    
    if (item.currentStock < requiredQuantity) {
      unavailableItems.push({
        name: item.name,
        required: requiredQuantity,
        available: item.currentStock,
        reason: 'Insufficient stock'
      });
    }
  }
  
  return {
    available: unavailableItems.length === 0,
    unavailableItems
  };
};

// Ensure virtuals are included in JSON
recipeSchema.set('toJSON', { virtuals: true });
recipeSchema.set('toObject', { virtuals: true });

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
