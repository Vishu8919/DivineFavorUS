"use client";
import React, { useEffect, useState } from "react";
import HomeTabbar from "./HomeTabbar";
import { productType } from "@/constants";
import { client } from "@/sanity/lib/client";
import { Product } from "@/sanity.types";
import ProductCard from "./ProductCard";
import NoProductsAvailable from "./NoProductsAvailable";
import { motion, AnimatePresence } from "motion/react";
import { Loader2 } from "lucide-react";
import { getActiveSales } from "@/sanity/helpers/queries";


const ProductGrid = () => {
  const [selectedTab, setSelectedTab] = useState(productType[0]?.title || "");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);

  const query = `*[_type == 'product' && variant ==$variant] | order(name asc)`;
  const params = { variant: selectedTab.toLocaleLowerCase() };
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await client.fetch(query, params);
        setProducts(await response);
      } catch (error) {
        console.log("Product fetching Error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedTab]);

  useEffect(() => {
  const fetchSales = async () => {
    try {
      const sale = await getActiveSales();
      if (sale?.products?.length) {
        setSaleProducts(sale.products);
      }
    } catch (err) {
      console.error("Error loading sales", err);
    }
  };
  fetchSales();
}, []);


  return (
    <div className="mt-10 flex flex-col items-center">
      {saleProducts?.length > 0 && (
  <div className="w-full mt-5">
    <h2 className="text-2xl font-bold mb-4 text-red-600">🔥 On Sale</h2>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {saleProducts.map((product) => (
        <AnimatePresence key={product._id}>
          <motion.div
            layout
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProductCard product={product} />
          </motion.div>
        </AnimatePresence>
      ))}
    </div>
  </div>
)}
      <HomeTabbar selectedTab={selectedTab} onTabSelect={setSelectedTab} />
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 min-h-80 space-y-4 text-center bg-gray-100 rounded-lg w-full mt-10">
          <div className="flex items-center space-x-2 text-blue-600">
            <Loader2 className="animate-spin" />
            <span className="text-lg font-semibold">Product is loading...</span>
          </div>
        </div>
      ) : (
        <>
          {products?.length ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-10 w-full">
              {products?.map((product: Product) => (
                <AnimatePresence key={product?._id}>
                  <motion.div
                    layout
                    initial={{ opacity: 0.2 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                </AnimatePresence>
              ))}
            </div>
          ) : (
            <NoProductsAvailable selectedTab={selectedTab} />
          )}
        </>
      )}
    </div>
  );
};

export default ProductGrid;
