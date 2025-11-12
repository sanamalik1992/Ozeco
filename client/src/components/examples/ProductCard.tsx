import ProductCard from '../ProductCard';
import productImage1 from '@assets/generated_images/Black_e-bike_white_background_79ee0cad.png';
import productImage2 from '@assets/generated_images/White_city_e-bike_5041c7ba.png';
import productImage3 from '@assets/generated_images/Red_folding_e-bike_7174f629.png';

export default function ProductCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <ProductCard
        id="1"
        name="Engwe Engine Pro"
        brand="Engwe"
        price={1299}
        image={productImage1}
        range="75 miles"
        maxSpeed="28 mph"
        onViewDetails={() => console.log('View details clicked')}
        onAddToCart={() => console.log('Add to cart clicked')}
      />
      <ProductCard
        id="2"
        name="Eleglide T1 Step-Thru"
        brand="Eleglide"
        price={899}
        image={productImage2}
        range="65 miles"
        maxSpeed="15.5 mph"
        onViewDetails={() => console.log('View details clicked')}
        onAddToCart={() => console.log('Add to cart clicked')}
      />
      <ProductCard
        id="3"
        name="DYU King 750"
        brand="DYU"
        price={749}
        image={productImage3}
        range="45 miles"
        maxSpeed="15.5 mph"
        onViewDetails={() => console.log('View details clicked')}
        onAddToCart={() => console.log('Add to cart clicked')}
      />
    </div>
  );
}
