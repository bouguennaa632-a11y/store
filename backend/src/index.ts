// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi } /*: { strapi: Core.Strapi } */) {
    // Seed sample products if none exist
    try{
      const count = await strapi.db.query('api::product.product').count();
      strapi.log.info(`Product count: ${count}`);
      if(count === 0){
        const samples = [
          { name: 'T-Shirt', description: 'Comfortable cotton t-shirt', price: 19.99 },
          { name: 'Mug', description: 'Ceramic mug for your coffee', price: 9.5 },
          { name: 'Notebook', description: 'A5 lined notebook', price: 7.25 }
        ];
        for(const s of samples){
          await strapi.entityService.create('api::product.product', { data: s });
        }
        strapi.log.info('Seeded sample products');
      }

      // Ensure public role has read permissions for products
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
      if(publicRole){
        const perms = await strapi.db.query('plugin::users-permissions.permission').findMany({ where: { role: publicRole.id } });
        const hasFind = perms.some(p => p.action === 'api::product.product.find');
        const hasFindOne = perms.some(p => p.action === 'api::product.product.findOne');
        if(!hasFind){
          await strapi.db.query('plugin::users-permissions.permission').create({ data: { action: 'api::product.product.find', role: publicRole.id, enabled: true } });
        }
        if(!hasFindOne){
          await strapi.db.query('plugin::users-permissions.permission').create({ data: { action: 'api::product.product.findOne', role: publicRole.id, enabled: true } });
        }
        strapi.log.info('Ensured public role has product read permissions');
      }
    }catch(err){
      strapi.log.error('Bootstrap seeding failed', err);
    }
  },
};
