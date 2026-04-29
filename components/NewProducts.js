import ProductBox from "./ProductBox";

export default function NewProducts({ newProducts }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 shadow-sm">
            Catalog highlight
          </span>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">New Arrivals</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Fresh additions with clearer pricing, category context, and stock-aware product cards.
          </p>
        </div>
        <div className="rounded-2xl bg-white/70 px-4 py-3 text-sm text-slate-600 shadow-sm">
          {newProducts?.length || 0} products available now
        </div>
      </div>
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
