/**
 * ordery controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::ordery.ordery');
'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::ordery.ordery', ({ strapi }) => ({
  async find(ctx) {
    ctx.query.populate = {
      orderItems: {
        populate: ['photo']
      }
    };
    return await super.find(ctx);
  },

  async findOne(ctx) {
    ctx.query.populate = {
      orderItems: {
        populate: ['photo']
      }
    };
    return await super.findOne(ctx);
  },

  async create(ctx) {
    const response = await super.create(ctx);
    return response;
  },

  async update(ctx) {
    const response = await super.update(ctx);
    return response;
  },

  async delete(ctx) {
    const response = await super.delete(ctx);
    return response;
  }
}));