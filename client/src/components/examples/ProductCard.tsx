import ProductCard from '../ProductCard';

export default function ProductCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <ProductCard
        id="1"
        name="ENGWE Engine X"
        brand="Engwe"
        price={899.99}
        image="https://www.ozeco.co.uk/cdn/shop/files/ejh2g8zn.png?v=1747666206&width=533"
        range="75 miles"
        maxSpeed="28 mph"
        onViewDetails={() => console.log('View details clicked')}
        onAddToCart={() => console.log('Add to cart clicked')}
      />
      <ProductCard
        id="2"
        name="Eleglide M2"
        brand="Eleglide"
        price={594.99}
        image="https://www.ozeco.co.uk/cdn/shop/files/kvo5ypxk.png?v=1747598026&width=533"
        range="65 miles"
        maxSpeed="15.5 mph"
        onViewDetails={() => console.log('View details clicked')}
        onAddToCart={() => console.log('Add to cart clicked')}
      />
      <ProductCard
        id="3"
        name="DYU A1F Pro"
        brand="DYU"
        price={399.99}
        image="https://www.ozeco.co.uk/cdn/shop/files/hyw8o05i.png?v=1747601600&width=533"
        range="45 miles"
        maxSpeed="15.5 mph"
        onViewDetails={() => console.log('View details clicked')}
        onAddToCart={() => console.log('Add to cart clicked')}
      />
    </div>
  );
}
