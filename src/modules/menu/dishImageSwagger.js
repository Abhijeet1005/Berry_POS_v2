/**
 * @swagger
 * components:
 *   schemas:
 *     DishImage:
 *       type: object
 *       properties:
 *         publicId:
 *           type: string
 *           description: Cloudinary public ID
 *           example: berry-blocks-pos/dishes/tenant_123/outlet_456/abc123
 *         url:
 *           type: string
 *           description: Full Cloudinary URL
 *           example: https://res.cloudinary.com/your-cloud/image/upload/v1234567890/berry-blocks-pos/dishes/tenant_123/outlet_456/abc123.jpg
 *         width:
 *           type: integer
 *           description: Image width in pixels
 *           example: 1920
 *         height:
 *           type: integer
 *           description: Image height in pixels
 *           example: 1080
 *         format:
 *           type: string
 *           description: Image format
 *           example: jpg
 *         size:
 *           type: integer
 *           description: File size in bytes
 *           example: 245678
 */

/**
 * @swagger
 * /dishes/{dishId}/images:
 *   post:
 *     summary: Upload images for a dish
 *     description: Upload one or more images for a dish (maximum 5 images per dish). Images are stored in Cloudinary.
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dishId
 *         required: true
 *         schema:
 *           type: string
 *         description: Dish ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Image files (JPG, PNG, WebP - max 5MB each, max 5 files)
 *     responses:
 *       201:
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 3 image(s) uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     dish:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         images:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/DishImage'
 *                     uploadedImages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DishImage'
 *                     totalImages:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: Validation error (invalid file type, size, or count)
 *       404:
 *         description: Dish not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Replace all dish images
 *     description: Delete all existing images and upload new ones
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dishId
 *         required: true
 *         schema:
 *           type: string
 *         description: Dish ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Image files (JPG, PNG, WebP - max 5MB each, max 5 files)
 *     responses:
 *       200:
 *         description: Images replaced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     dish:
 *                       type: object
 *                     uploadedImages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DishImage'
 *                     totalImages:
 *                       type: integer
 *       400:
 *         description: Validation error
 *       404:
 *         description: Dish not found
 *   delete:
 *     summary: Delete all dish images
 *     description: Delete all images from a dish
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dishId
 *         required: true
 *         schema:
 *           type: string
 *         description: Dish ID
 *     responses:
 *       200:
 *         description: All images deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: 3 image(s) deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     dish:
 *                       type: object
 *                     deletedCount:
 *                       type: integer
 *                       example: 3
 *       404:
 *         description: Dish not found
 */

/**
 * @swagger
 * /dishes/{dishId}/images/{imagePublicId}:
 *   delete:
 *     summary: Delete a specific image
 *     description: Delete a specific image from a dish by its public ID
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dishId
 *         required: true
 *         schema:
 *           type: string
 *         description: Dish ID
 *       - in: path
 *         name: imagePublicId
 *         required: true
 *         schema:
 *           type: string
 *         description: URL-encoded Cloudinary public ID
 *         example: berry-blocks-pos%2Fdishes%2Ftenant%2Foutlet%2Fabc123
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     dish:
 *                       type: object
 *                     deletedImageId:
 *                       type: string
 *                     remainingImages:
 *                       type: integer
 *       404:
 *         description: Dish or image not found
 */

/**
 * @swagger
 * /dishes/{dishId}/images/square:
 *   get:
 *     summary: Get square crop URLs
 *     description: Get square-cropped URLs for all dish images. Useful for grid views and thumbnails.
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dishId
 *         required: true
 *         schema:
 *           type: string
 *         description: Dish ID
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 400
 *         description: Size of square crop in pixels
 *         example: 400
 *     responses:
 *       200:
 *         description: Square crop URLs generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           publicId:
 *                             type: string
 *                           originalUrl:
 *                             type: string
 *                           squareUrl:
 *                             type: string
 *                             example: https://res.cloudinary.com/.../w_400,h_400,c_fill,g_auto/abc123.jpg
 *       404:
 *         description: Dish not found
 */

module.exports = {};
