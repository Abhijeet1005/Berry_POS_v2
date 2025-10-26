const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Berry & Blocks POS API',
      version: '1.0.0',
      description: 'Comprehensive multi-tenant restaurant management POS system API',
      contact: {
        name: 'API Support',
        email: 'support@berryblocks.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.berryblocks.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token for staff/admin authentication'
        },
        customerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token for customer authentication'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Error message'
            },
            code: {
              type: 'string',
              example: 'ERROR_CODE'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object'
            },
            message: {
              type: 'string',
              example: 'Operation successful'
            }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'array',
              items: {
                type: 'object'
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  example: 1
                },
                limit: {
                  type: 'integer',
                  example: 20
                },
                total: {
                  type: 'integer',
                  example: 100
                },
                totalPages: {
                  type: 'integer',
                  example: 5
                }
              }
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            email: {
              type: 'string',
              example: 'user@example.com'
            },
            firstName: {
              type: 'string',
              example: 'John'
            },
            lastName: {
              type: 'string',
              example: 'Doe'
            },
            role: {
              type: 'string',
              enum: ['admin', 'manager', 'captain', 'kitchen', 'cashier'],
              example: 'manager'
            },
            tenantId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            isActive: {
              type: 'boolean',
              example: true
            }
          }
        },
        Customer: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'Jane Smith'
            },
            phone: {
              type: 'string',
              example: '9876543210'
            },
            email: {
              type: 'string',
              example: 'jane@example.com'
            },
            loyaltyPoints: {
              type: 'number',
              example: 150
            }
          }
        },
        Dish: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'Margherita Pizza'
            },
            description: {
              type: 'string',
              example: 'Classic Italian pizza with tomato and mozzarella'
            },
            price: {
              type: 'number',
              example: 299
            },
            category: {
              type: 'string',
              example: 'Pizza'
            },
            dietaryTags: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['Veg', 'Non-Veg', 'Vegan', 'Jain', 'Eggetarian']
              },
              example: ['Veg']
            },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  publicId: {
                    type: 'string',
                    example: 'berry-blocks-pos/dishes/tenant_123/outlet_456/abc123'
                  },
                  url: {
                    type: 'string',
                    example: 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/berry-blocks-pos/dishes/tenant_123/outlet_456/abc123.jpg'
                  },
                  width: {
                    type: 'integer',
                    example: 1920
                  },
                  height: {
                    type: 'integer',
                    example: 1080
                  },
                  format: {
                    type: 'string',
                    example: 'jpg'
                  },
                  size: {
                    type: 'integer',
                    example: 245678
                  }
                }
              }
            },
            isAvailable: {
              type: 'boolean',
              example: true
            }
          }
        },
        Order: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            orderNumber: {
              type: 'string',
              example: 'ORD-2024-001'
            },
            orderType: {
              type: 'string',
              enum: ['dine-in', 'takeaway', 'delivery'],
              example: 'dine-in'
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
              example: 'confirmed'
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  dishId: {
                    type: 'string'
                  },
                  name: {
                    type: 'string'
                  },
                  quantity: {
                    type: 'integer'
                  },
                  price: {
                    type: 'number'
                  }
                }
              }
            },
            total: {
              type: 'number',
              example: 599
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Staff/Admin authentication endpoints'
      },
      {
        name: 'Customer Auth',
        description: 'Customer authentication endpoints'
      },
      {
        name: 'Tenants',
        description: 'Multi-tenant management'
      },
      {
        name: 'Menu',
        description: 'Menu and dish management'
      },
      {
        name: 'Orders',
        description: 'Order management'
      },
      {
        name: 'Payments',
        description: 'Payment processing'
      },
      {
        name: 'Tables',
        description: 'Table management'
      },
      {
        name: 'Staff',
        description: 'Staff management'
      },
      {
        name: 'AI',
        description: 'AI-powered features'
      },
      {
        name: 'Loyalty',
        description: 'Loyalty program'
      },
      {
        name: 'Feedback',
        description: 'Customer feedback'
      },
      {
        name: 'Coupons',
        description: 'Coupon management'
      },
      {
        name: 'Valet',
        description: 'Valet services'
      },
      {
        name: 'Reservations',
        description: 'Table reservations'
      },
      {
        name: 'Analytics',
        description: 'Analytics and reporting'
      },
      {
        name: 'Notifications',
        description: 'Notification management'
      },
      {
        name: 'Sync',
        description: 'Data synchronization'
      },
      {
        name: 'Admin',
        description: 'Admin panel operations'
      },
      {
        name: 'Audit',
        description: 'Audit logs'
      },
      {
        name: 'Customer',
        description: 'Customer self-service'
      }
    ]
  },
  apis: [
    './src/modules/*/swagger.js',
    './src/modules/*/*.js',
    './src/app.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
