import ProductBox from "./ProductBox";

export default function NewProducts({ newProducts }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">New Arrivals</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {newProducts?.length > 0 ? (
          newProducts.map((product) => (
            <div key={product._id}>
              <ProductBox {...product} />
            </div>
          ))
        ) : (
          <p className="text-center col-span-4 text-gray-500">No products available.</p>
        )}
      </div>
    </div>
  );
}
