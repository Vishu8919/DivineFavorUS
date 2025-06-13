// import { getAllOrders, getAllProducts } from "@/sanity/helpers/queries";
// import React from "react";

// const AdminDashboardPage = async () => {
//   const orders = await getAllOrders();
//   const products = await getAllProducts();

//   // --- SALES AGGREGATION ---
//   let totalRevenue = 0;
//   let totalItemsSold = 0;
//   let productStats: Record<string, any> = {};

//   orders.forEach((order) => {
//     order.products?.forEach(({ product, quantity }) => {
//       const discountedPrice = product.price * (1 - product.discount / 100);
//       totalRevenue += discountedPrice * quantity;
//       totalItemsSold += quantity;

//       if (!productStats[product._id]) {
//         productStats[product._id] = {
//           name: product.name,
//           quantity: 0,
//           revenue: 0,
//         };
//       }

//       productStats[product._id].quantity += quantity;
//       productStats[product._id].revenue += discountedPrice * quantity;
//     });
//   });

//   const topProducts = Object.values(productStats).sort(
//     (a, b) => b.revenue - a.revenue
//   );

//   // --- INVENTORY AGGREGATION ---
//   const totalProducts = products.length;
//   const outOfStock = products.filter((p) => p.stock === 0);
//   const inStock = products.filter((p) => p.stock > 0);

//   return (
//     <div className="p-10 space-y-6">
//       <h1 className="text-2xl font-bold">📊 Sales & Inventory Dashboard</h1>

//       {/* --- SALES METRICS --- */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="bg-blue-100 p-4 rounded-lg">
//           <p className="text-gray-600">Total Revenue</p>
//           <p className="text-xl font-bold">${totalRevenue.toFixed(2)}</p>
//         </div>
//         <div className="bg-green-100 p-4 rounded-lg">
//           <p className="text-gray-600">Orders Count</p>
//           <p className="text-xl font-bold">{orders.length}</p>
//         </div>
//         <div className="bg-yellow-100 p-4 rounded-lg">
//           <p className="text-gray-600">Items Sold</p>
//           <p className="text-xl font-bold">{totalItemsSold}</p>
//         </div>
//       </div>

//       {/* --- TOP PRODUCTS --- */}
//       <div>
//         <h2 className="text-xl font-semibold mt-6">🏆 Top Products</h2>
//         <div className="mt-3 space-y-2">
//           {topProducts.map((prod) => (
//             <div
//               key={prod.name}
//               className="flex justify-between p-3 bg-white rounded shadow"
//             >
//               <div>{prod.name}</div>
//               <div>{prod.quantity} sold</div>
//               <div>${prod.revenue.toFixed(2)}</div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* --- INVENTORY OVERVIEW --- */}
//       <div>
//         <h2 className="text-xl font-semibold mt-8">📦 Inventory</h2>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
//           <div className="bg-gray-100 p-4 rounded-lg">
//             <p className="text-gray-600">Total Products</p>
//             <p className="text-xl font-bold">{totalProducts}</p>
//           </div>
//           <div className="bg-red-100 p-4 rounded-lg">
//             <p className="text-gray-600">Out of Stock</p>
//             <p className="text-xl font-bold">{outOfStock.length}</p>
//           </div>
//           <div className="bg-green-100 p-4 rounded-lg">
//             <p className="text-gray-600">In Stock</p>
//             <p className="text-xl font-bold">{inStock.length}</p>
//           </div>
//         </div>

//         <div className="mt-4 space-y-2">
//           {products.map((prod) => (
//             <div
//               key={prod._id}
//               className={`flex justify-between p-3 rounded shadow ${
//                 prod.stock === 0 ? "bg-red-50" : "bg-white"
//               }`}
//             >
//               <div>{prod.name}</div>
//               <div>{prod.stock} in stock</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboardPage;
