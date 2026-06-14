import type { Schema, Struct } from '@strapi/strapi';

export interface ItemListItem extends Struct.ComponentSchema {
  collectionName: 'components_item_list_items';
  info: {
    displayName: 'list-item';
  };
  attributes: {
    item: Schema.Attribute.String;
  };
}

export interface OrderOrderItem extends Struct.ComponentSchema {
  collectionName: 'components_order_order_items';
  info: {
    description: '';
    displayName: 'Order Item';
  };
  attributes: {
    photo: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    price: Schema.Attribute.Decimal & Schema.Attribute.Required;
    productName: Schema.Attribute.String;
    quantity: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<1>;
  };
}

export interface PrivacyPrivacyPolicy extends Struct.ComponentSchema {
  collectionName: 'components_privacy_privacy_policies';
  info: {
    displayName: 'privacy-policy';
  };
  attributes: {
    content: Schema.Attribute.Text;
    listItems: Schema.Attribute.Component<'item.list-item', true>;
    sectionTitle: Schema.Attribute.String;
    type: Schema.Attribute.Enumeration<['text', 'list', 'text_with_list']>;
  };
}

export interface PrivacySections extends Struct.ComponentSchema {
  collectionName: 'components_privacy_sections';
  info: {
    displayName: 'sections';
  };
  attributes: {};
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'item.list-item': ItemListItem;
      'order.order-item': OrderOrderItem;
      'privacy.privacy-policy': PrivacyPrivacyPolicy;
      'privacy.sections': PrivacySections;
    }
  }
}
