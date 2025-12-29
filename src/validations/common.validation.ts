import Joi from 'joi';

export const idSchema = Joi.object({
  slug: Joi.string(),
  id: Joi.number().integer().positive(),
  user_id: Joi.number().integer().positive(),
  lesson_id: Joi.number().integer().positive(),
}).xor('slug', 'user_id', 'lesson_id', 'id');
