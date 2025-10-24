/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         name:
 *           type: string
 *           example: Starters
 *         description:
 *           type: string
 *           example: Appetizers and starters
 *         kitchenSection:
 *           type: string
 *           enum: [kitchen, bar, grill, tandoor, dessert]
 *           example: kitchen
 *         displayOrder:
 *           type: integer
 *           example: 1
 *         isActive:
 *           type: boolean
 *           example: true
 *     
 *     CreateCategoryRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: Starters
 *         description:
 *           type: string
 *           example: Appetizers and starters
 *         kitchenSection:
 *           type: string
 *           enum: [kitchen, bar, grill, tandoor, dessert]
 *           example: kitchen
 *         displayOrder:
 *           type: integer
 *           example: 1
 *     
 *     Dish:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         outletId:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         name:
 *           type: string
 *           example: Paneer Tikka
 *         description:
 *           type: object
 *           properties:
 *             short:
 *               type: string
 *               example: Grilled cottage cheese
 *             detailed:
 *               type: string
 *               example: Marinated cottage cheese grilled to perfection
 *         categoryId:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           example: ['https://images.pexels.com/photos/28674541/pexels-photo-28674541.jpeg']
 *         price:
 *           type: number
 *           example: 250
 *         portionSizes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Half
 *               price:
 *                 type: number
 *                 example: 150
 *               servings:
 *                 type: integer
 *                 example: 1
 *         dietaryTags:
 *           type: array
 *           items:
 *             type: string
 *             enum: [veg, non-veg, vegan, jain, eggetarian, gluten-free, dairy-free, nut-free]
 *           example: [veg]
 *         allergens:
 *           type: array
 *           items:
 *             type: string
 *           example: [dairy]
 *         ingredients:
 *           type: array
 *           items:
 *             type: string
 *           example: [paneer, yogurt, spices]
 *         prepTime:
 *           type: integer
 *           description: Preparation time in minutes
 *           example: 20
 *         stock:
 *           type: integer
 *           example: 50
 *         taxRate:
 *           type: number
 *           example: 5
 *         isAvailable:
 *           type: boolean
 *           example: true
 *         nutritionInfo:
 *           type: object
 *           properties:
 *             calories:
 *               type: number
 *               example: 250
 *             protein:
 *               type: number
 *               example: 15
 *             carbs:
 *               type: number
 *               example: 20
 *             fats:
 *               type: number
 *               example: 12
 *             fiber:
 *               type: number
 *               example: 3
 *         tasteFactor:
 *           type: object
 *           properties:
 *             spicy:
 *               type: integer
 *               minimum: 0
 *               maximum: 10
 *               example: 5
 *             sweet:
 *               type: integer
 *               minimum: 0
 *               maximum: 10
 *               example: 2
 *             tangy:
 *               type: integer
 *               minimum: 0
 *               maximum: 10
 *               example: 3
 *             salty:
 *               type: integer
 *               minimum: 0
 *               maximum: 10
 *               example: 4
 *     
 *     CreateDishRequest:
 *       type: object
 *       required:
 *         - outletId
 *         - name
 *         - categoryId
 *         - price
 *       properties:
 *         outletId:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         name:
 *           type: string
 *           example: Paneer Tikka
 *         description:
 *           type: object
 *           properties:
 *             short:
 *               type: string
 *               maxLength: 100
 *               example: Grilled cottage cheese
 *             detailed:
 *               type: string
 *               maxLength: 500
 *               example: Marinated cottage cheese grilled to perfection
 *         categoryId:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           example: ['https://images.pexels.com/photos/28674541/pexels-photo-28674541.jpeg']
 *         price:
 *           type: number
 *           minimum: 0
 *           example: 250
 *         portionSizes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               servings:
 *                 type: integer
 *         dietaryTags:
 *           type: array
 *           items:
 *             type: string
 *             enum: [veg, non-veg, vegan, jain, eggetarian, gluten-free, dairy-free, nut-free]
 *           example: [veg]
 *         allergens:
 *           type: array
 *           items:
 *             type: string
 *           example: [dairy]
 *         ingredients:
 *           type: array
 *           items:
 *             type: string
 *           example: [paneer, yogurt, spices]
 *         prepTime:
 *           type: integer
 *           example: 20
 *         stock:
 *           type: integer
 *           example: 50
 *         taxRate:
 *           type: number
 *           example: 5
 *         nutritionInfo:
 *           type: object
 *           properties:
 *             calories:
 *               type: number
 *             protein:
 *               type: number
 *             carbs:
 *               type: number
 *             fats:
 *               type: number
 *             fiber:
 *               type: number
 *         tasteFactor:
 *           type: object
 *           properties:
 *             spicy:
 *               type: integer
 *               minimum: 0
 *               maximum: 10
 *             sweet:
 *               type: integer
 *               minimum: 0
 *               maximum: 10
 *             tangy:
 *               type: integer
 *               minimum: 0
 *               maximum: 10
 *             salty:
 *               type: integer
 *               minimum: 0
 *               maximum: 10
 */

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: outletId
 *         schema:
 *           type: string
 *         description: Filter by outlet ID
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *   post:
 *     summary: Create a new category
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryRequest'
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *   put:
 *     summary: Update category
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryRequest'
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 *   delete:
 *     summary: Delete category
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 */

/**
 * @swagger
 * /api/v1/dishes:
 *   get:
 *     summary: Get all dishes
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: outletId
 *         schema:
 *           type: string
 *         description: Filter by outlet ID
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: isAvailable
 *         schema:
 *           type: boolean
 *         description: Filter by availability
 *       - in: query
 *         name: dietaryTags
 *         schema:
 *           type: string
 *         description: Filter by dietary tags (comma-separated)
 *     responses:
 *       200:
 *         description: Dishes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Dish'
 *   post:
 *     summary: Create a new dish
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDishRequest'
 *           examples:
 *             paneerTikka:
 *               summary: Paneer Tikka Example
 *               value:
 *                 outletId: 507f1f77bcf86cd799439011
 *                 name: Paneer Tikka
 *                 description:
 *                   short: Grilled cottage cheese
 *                   detailed: Marinated cottage cheese grilled to perfection
 *                 categoryId: 507f1f77bcf86cd799439011
 *                 images:
 *                   - https://images.pexels.com/photos/28674541/pexels-photo-28674541.jpeg
 *                 price: 250
 *                 dietaryTags: [veg]
 *                 allergens: [dairy]
 *                 ingredients: [paneer, yogurt, spices]
 *                 prepTime: 20
 *                 stock: 50
 *                 taxRate: 5
 *             butterChicken:
 *               summary: Butter Chicken Example
 *               value:
 *                 outletId: 507f1f77bcf86cd799439011
 *                 name: Butter Chicken
 *                 description:
 *                   short: Creamy tomato-based chicken curry
 *                   detailed: Tender chicken pieces cooked in rich tomato gravy
 *                 categoryId: 507f1f77bcf86cd799439011
 *                 images:
 *                   - https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg
 *                 price: 350
 *                 portionSizes:
 *                   - name: Half
 *                     price: 200
 *                     servings: 1
 *                   - name: Full
 *                     price: 350
 *                     servings: 2
 *                 dietaryTags: [non-veg]
 *                 allergens: [dairy]
 *                 ingredients: [chicken, tomato, butter, cream, spices]
 *                 prepTime: 25
 *                 stock: 30
 *                 taxRate: 5
 *                 tasteFactor:
 *                   spicy: 4
 *                   sweet: 3
 *                   tangy: 2
 *                   salty: 5
 *     responses:
 *       201:
 *         description: Dish created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Dish'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/dishes/{id}:
 *   get:
 *     summary: Get dish by ID
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Dish ID
 *     responses:
 *       200:
 *         description: Dish retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Dish'
 *       404:
 *         description: Dish not found
 *   put:
 *     summary: Update dish
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDishRequest'
 *     responses:
 *       200:
 *         description: Dish updated successfully
 *       404:
 *         description: Dish not found
 *   delete:
 *     summary: Delete dish
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dish deleted successfully
 *       404:
 *         description: Dish not found
 */

/**
 * @swagger
 * /api/v1/dishes/search:
 *   get:
 *     summary: Search dishes
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query (name, description)
 *       - in: query
 *         name: outletId
 *         schema:
 *           type: string
 *         description: Filter by outlet ID
 *       - in: query
 *         name: dietaryTags
 *         schema:
 *           type: string
 *         description: Filter by dietary tags
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Dish'
 */

/**
 * @swagger
 * /api/v1/dishes/{id}/stock:
 *   patch:
 *     summary: Update dish stock
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *               - operation
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 10
 *               operation:
 *                 type: string
 *                 enum: [increment, decrement, set]
 *                 example: increment
 *     responses:
 *       200:
 *         description: Stock updated successfully
 *       404:
 *         description: Dish not found
 */
