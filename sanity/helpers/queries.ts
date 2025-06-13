import { defineQuery } from "next-sanity";
import { sanityFetch } from "../lib/live";

export const getProductBySlug = async (slug: string) => {
  const PRODUCT_BY_SLUG_QUERY = defineQuery(
    `*[_type == 'product' && slug.current == $slug] | order(name asc) [0]`
  );
  try {
    const product = await sanityFetch({
      query: PRODUCT_BY_SLUG_QUERY,
      params: {
        slug,
      },
    });
    return product?.data || null;
  } catch (error) {
    console.error("Error fetching product by Slug:", error);
  }
};

export const getAllCategories = async () => {
  const CATEGORIES_QUERY = defineQuery(
    `*[_type=="category"] | order(name asc)`
  );
  try {
    const categories = await sanityFetch({
      query: CATEGORIES_QUERY,
    });
    return categories.data || [];
  } catch (error) {
    console.error("Error fetching all categories");

    return [];
  }
};

export const getMyOrders = async (userId: string) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const MY_ORDERS_QUERY = defineQuery(`
    *[_type == 'order' && clerkUserId == $userId] | order(orderDate desc){
      ...,
      products[]{
        ...,
        product->
      }
    }
  `);

  try {
    const orders = await sanityFetch({
      query: MY_ORDERS_QUERY,
      params: { userId },
    });

    return orders?.data || [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }

};

export const getActiveSales = async () => {
  const ACTIVE_SALES_QUERY = defineQuery(`
    *[_type == "sale" && startDate <= now() && endDate >= now()] | order(startDate desc)[0] {
      ...,
      products[]->{
        _id,
        name,
        slug,
        images,
        intro,
        description,
        price,
        discount,
        stock,
        status,
        variant
      }
    }
  `);

  try {
    const sale = await sanityFetch({
      query: ACTIVE_SALES_QUERY,
    });
    return sale?.data || null;
  } catch (error) {
    console.error("Error fetching active sales:", error);
    return null;
  }
};

export const getAllOrders = async () => {
  const ALL_ORDERS_QUERY = defineQuery(`
    *[_type == 'order']{
      orderDate,
      products[]{
        quantity,
        product->{
          _id,
          name,
          price,
          discount
        }
      }
    }
  `);

  try {
    const orders = await sanityFetch({
      query: ALL_ORDERS_QUERY,
    });
    return orders?.data || [];
  } catch (error) {
    console.error("Error fetching all orders for analytics:", error);
    return [];
  }
};

export const getAllProducts = async () => {
  const ALL_PRODUCTS_QUERY = defineQuery(`*[_type == 'product']{
    _id,
    name,
    stock
  }`);

  try {
    const products = await sanityFetch({
      query: ALL_PRODUCTS_QUERY,
    });
    return products?.data || [];
  } catch (error) {
    console.error("Error fetching all products for inventory:", error);
    return [];
  }
};





