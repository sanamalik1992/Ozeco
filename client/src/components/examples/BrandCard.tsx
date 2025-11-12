import BrandCard from '../BrandCard';

export default function BrandCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      <BrandCard
        name="Engwe"
        description="Powerful off-road electric bikes built for adventure and long-range rides."
        onClick={() => console.log('Engwe clicked')}
      />
      <BrandCard
        name="Eleglide"
        description="Sleek urban e-bikes combining style with cutting-edge technology."
        onClick={() => console.log('Eleglide clicked')}
      />
      <BrandCard
        name="DYU"
        description="Compact folding e-bikes perfect for commuters and city living."
        onClick={() => console.log('DYU clicked')}
      />
      <BrandCard
        name="DUOTTS"
        description="Premium electric bikes with exceptional performance and design."
        onClick={() => console.log('DUOTTS clicked')}
      />
    </div>
  );
}
