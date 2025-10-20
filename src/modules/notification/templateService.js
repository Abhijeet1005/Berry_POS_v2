const { NotFoundError, ValidationError } = require('../../utils/errorHandler');

// In-memory template storage (in production, use database)
const templates = new Map();

/**
 * Create notification template
 */
const createTemplate = async (templateData, tenantId) => {
  const { name, type, channel, subject, body, variables } = templateData;
  
  const templateId = `${tenantId}_${Date.now()}`;
  
  const template = {
    id: templateId,
    tenantId,
    name,
    type,
    channel,
    subject,
    body,
    variables: variables || [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  templates.set(templateId, template);
  
  return template;
};

/**
 * Get all templates
 */
const getTemplates = async (query, tenantId) => {
  const { type, channel } = query;
  
  const allTemplates = Array.from(templates.values())
    .filter(t => t.tenantId === tenantId);
  
  let filtered = allTemplates;
  
  if (type) {
    filtered = filtered.filter(t => t.type === type);
  }
  
  if (channel) {
    filtered = filtered.filter(t => t.channel === channel);
  }
  
  return filtered;
};

/**
 * Get template by ID
 */
const getTemplateById = async (templateId, tenantId) => {
  const template = templates.get(templateId);
  
  if (!template || template.tenantId !== tenantId) {
    throw new NotFoundError('Template');
  }
  
  return template;
};

/**
 * Update template
 */
const updateTemplate = async (templateId, updateData, tenantId) => {
  const template = templates.get(templateId);
  
  if (!template || template.tenantId !== tenantId) {
    throw new NotFoundError('Template');
  }
  
  const updated = {
    ...template,
    ...updateData,
    updatedAt: new Date()
  };
  
  templates.set(templateId, updated);
  
  return updated;
};

/**
 * Delete template
 */
const deleteTemplate = async (templateId, tenantId) => {
  const template = templates.get(templateId);
  
  if (!template || template.tenantId !== tenantId) {
    throw new NotFoundError('Template');
  }
  
  templates.delete(templateId);
  
  return { message: 'Template deleted successfully' };
};

/**
 * Render template with variables
 */
const renderTemplate = (template, variables) => {
  let rendered = template.body;
  
  Object.keys(variables).forEach(key => {
    const placeholder = `{{${key}}}`;
    rendered = rendered.replace(new RegExp(placeholder, 'g'), variables[key]);
  });
  
  return rendered;
};

module.exports = {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  renderTemplate
};
