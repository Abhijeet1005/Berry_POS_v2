const OpenAI = require('openai');
const Dish = require('../../models/Dish');
const Customer = require('../../models/Customer');
const Order = require('../../models/Order');
const { ValidationError } = require('../../utils/errorHandler');
const logger = require('../../utils/logger');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate dish profile using AI
 */
const generateDishProfile = async (dishData) => {
  const { name, ingredients, category, dietaryTags } = dishData;
  
  if (!name || !ingredients) {
    throw new ValidationError('Dish name and ingredients are required');
  }
  
  try {
    const prompt = `Analyze this dish and provide detailed information:
    
Dish Name: ${name}
Ingredients: ${ingredients.join(', ')}
Category: ${category || 'Not specified'}
Dietary Tags: ${dietaryTags?.join(', ') || 'Not specified'}

Please provide:
1. A one-line catchy description (max 60 characters)
2. A detailed description (2-3 sentences)
3. Nutritional information (calories, protein, carbs, fats per serving)
4. Taste factors (rate 0-5): spicy, sweet, tangy, salty, bitter
5. Allergens present
6. Portion sharing recommendation (serves how many people)

Format the response as JSON with keys: shortDescription, detailedDescription, nutrition, tasteFactors, allergens, portionSharing`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a culinary expert and nutritionist. Provide accurate dish analysis in JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });
    
    const content = completion.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    
    const profile = JSON.parse(jsonMatch[0]);
    
    return {
      shortDescription: profile.shortDescription,
      detailedDescription: profile.detailedDescription,
      nutrition: profile.nutrition,
      tasteFactors: profile.tasteFactors,
      allergens: profile.allergens || [],
      portionSharing: profile.portionSharing
    };
  } catch (error) {
    logger.error('AI dish profiling error:', error);
    throw new ValidationError('Failed to generate dish profile. Please try again.');
  }
};

/**
 * Analyze nutrition for a dish
 */
const analyzeNutrition = async (dishName, ingredients, portionSize) => {
  try {
    const prompt = `Provide nutritional analysis for:
    
Dish: ${dishName}
Ingredients: ${ingredients.join(', ')}
Portion Size: ${portionSize || 'standard serving'}

Provide detailed nutritional information per serving:
- Calories (kcal)
- Protein (g)
- Carbohydrates (g)
- Fats (g)
- Fiber (g)
- Sugar (g)
- Sodium (mg)

Format as JSON with keys: calories, protein, carbs, fats, fiber, sugar, sodium`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a nutritionist. Provide accurate nutritional information in JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 300
    });
    
    const content = completion.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Failed to parse nutrition data');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    logger.error('Nutrition analysis error:', error);
    throw new ValidationError('Failed to analyze nutrition');
  }
};

/**
 * Generate customer taste profile from order history
 */
const generateTasteProfile = async (customerId, tenantId) => {
  // Get customer's order history
  const orders = await Order.find({
    customerId,
    tenantId,
    status: 'completed'
  })
    .populate('items.dishId')
    .sort({ createdAt: -1 })
    .limit(20);
  
  if (orders.length === 0) {
    return {
      tastePreferences: {},
      dietaryPreferences: [],
      favoriteCategories: [],
      averageSpendPerOrder: 0
    };
  }
  
  // Aggregate taste factors
  const tasteSums = { spicy: 0, sweet: 0, tangy: 0, salty: 0, bitter: 0 };
  const dietaryTags = new Set();
  const categories = {};
  let totalSpend = 0;
  let dishCount = 0;
  
  orders.forEach(order => {
    totalSpend += order.total;
    
    order.items.forEach(item => {
      if (item.dishId && item.dishId.aiGenerated) {
        const taste = item.dishId.aiGenerated.tasteFactors;
        if (taste) {
          tasteSums.spicy += taste.spicy || 0;
          tasteSums.sweet += taste.sweet || 0;
          tasteSums.tangy += taste.tangy || 0;
          tasteSums.salty += taste.salty || 0;
          tasteSums.bitter += taste.bitter || 0;
          dishCount++;
        }
        
        // Track dietary preferences
        if (item.dishId.dietaryTags) {
          item.dishId.dietaryTags.forEach(tag => dietaryTags.add(tag));
        }
        
        // Track favorite categories
        if (item.dishId.category) {
          categories[item.dishId.category] = (categories[item.dishId.category] || 0) + item.quantity;
        }
      }
    });
  });
  
  // Calculate averages
  const tastePreferences = {};
  if (dishCount > 0) {
    Object.keys(tasteSums).forEach(key => {
      tastePreferences[key] = (tasteSums[key] / dishCount).toFixed(2);
    });
  }
  
  // Get top 3 categories
  const favoriteCategories = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category);
  
  return {
    tastePreferences,
    dietaryPreferences: Array.from(dietaryTags),
    favoriteCategories,
    averageSpendPerOrder: (totalSpend / orders.length).toFixed(2)
  };
};

/**
 * Get personalized recommendations
 */
const getRecommendations = async (customerId, tenantId, outletId) => {
  // Get customer taste profile
  const customer = await Customer.findOne({ _id: customerId, tenantId });
  
  if (!customer) {
    throw new ValidationError('Customer not found');
  }
  
  let tasteProfile = customer.tasteProfile;
  
  // Generate taste profile if not exists
  if (!tasteProfile || Object.keys(tasteProfile).length === 0) {
    tasteProfile = await generateTasteProfile(customerId, tenantId);
    
    // Update customer with taste profile
    customer.tasteProfile = tasteProfile;
    await customer.save();
  }
  
  // Get available dishes
  const dishes = await Dish.find({
    tenantId,
    outletId,
    isActive: true,
    isAvailable: true
  });
  
  // Score dishes based on taste profile
  const scoredDishes = dishes.map(dish => {
    let score = 0;
    
    // Match taste factors
    if (dish.aiGenerated && dish.aiGenerated.tasteFactors && tasteProfile.tastePreferences) {
      const dishTaste = dish.aiGenerated.tasteFactors;
      const customerTaste = tasteProfile.tastePreferences;
      
      Object.keys(customerTaste).forEach(factor => {
        const diff = Math.abs((dishTaste[factor] || 0) - customerTaste[factor]);
        score += (5 - diff) * 2; // Higher score for closer match
      });
    }
    
    // Boost score for favorite categories
    if (tasteProfile.favoriteCategories && tasteProfile.favoriteCategories.includes(dish.category)) {
      score += 10;
    }
    
    // Boost score for dietary preferences
    if (tasteProfile.dietaryPreferences && dish.dietaryTags) {
      const matchingTags = dish.dietaryTags.filter(tag => 
        tasteProfile.dietaryPreferences.includes(tag)
      );
      score += matchingTags.length * 5;
    }
    
    // Boost for highlighted dishes
    if (dish.highlights) {
      if (dish.highlights.includes('Chef\'s Special')) score += 8;
      if (dish.highlights.includes('Most Ordered')) score += 6;
      if (dish.highlights.includes('Staff Pick')) score += 5;
    }
    
    return {
      dish,
      score
    };
  });
  
  // Sort by score and return top 10
  const recommendations = scoredDishes
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(item => item.dish);
  
  return {
    recommendations,
    tasteProfile
  };
};

/**
 * Update customer taste profile
 */
const updateTasteProfile = async (customerId, tenantId) => {
  const tasteProfile = await generateTasteProfile(customerId, tenantId);
  
  const customer = await Customer.findOneAndUpdate(
    { _id: customerId, tenantId },
    { $set: { tasteProfile } },
    { new: true }
  );
  
  if (!customer) {
    throw new ValidationError('Customer not found');
  }
  
  return {
    customerId: customer._id,
    tasteProfile: customer.tasteProfile
  };
};

module.exports = {
  generateDishProfile,
  analyzeNutrition,
  generateTasteProfile,
  getRecommendations,
  updateTasteProfile
};
