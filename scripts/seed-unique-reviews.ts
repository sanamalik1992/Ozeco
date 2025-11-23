// Seed unique, diverse reviews for each product
import { db } from '../db/index';
import { reviews, products } from '../shared/schema';
import { eq, sql } from 'drizzle-orm';

// First name pools for generating unique names
const firstNames = {
  english: ["Oliver", "Emma", "Harry", "Sophie", "Jack", "Emily", "Thomas", "Olivia", "Charlie", "Amelia", "George", "Isla", "Oscar", "Ava", "William", "Mia", "James", "Isabella", "Henry", "Poppy", "Ethan", "Grace", "Noah", "Chloe", "Mason", "Lily", "Lucas", "Ruby", "Leo", "Ella", "Alexander", "Hannah", "Benjamin", "Molly", "Samuel", "Evie", "Daniel", "Joshua", "Charlotte", "Matthew"],
  scottish: ["Liam", "Freya", "Callum", "Eilidh", "Angus", "Isla", "Duncan", "Keira", "Hamish", "Skye", "Fraser", "Maisie", "Logan", "Erin", "Rory"],
  welsh: ["Rhys", "Cerys", "Dylan", "Seren", "Gareth", "Bethan", "Owain", "Carys", "Ioan", "Ffion", "Evan", "Megan", "Morgan", "Celyn"],
  irish: ["Cian", "Aoife", "Finn", "Niamh", "Sean", "Saoirse", "Liam", "Roisin", "Declan", "Ciara", "Conor", "Orla", "Eoin", "Aisling"],
  southAsian: ["Aarav", "Priya", "Arjun", "Ananya", "Rohan", "Diya", "Kabir", "Isha", "Aryan", "Zara", "Omar", "Fatima", "Yusuf", "Layla", "Ibrahim", "Aisha", "Ravi", "Meera"],
  eastAsian: ["Wei", "Mei", "Jun", "Yuki", "Min-Jun", "Hana", "Tao", "Sakura", "Ji-Hoon", "Aiko", "Chen", "Lin", "Hiroshi", "Kenji"],
  african: ["Kofi", "Amara", "Kwame", "Zara", "Tunde", "Nia", "Chinwe", "Ola", "Ayodele", "Kemi", "Jabari", "Ife", "Kwesi"],
  easternEuropean: ["Jakub", "Zofia", "Andrei", "Elena", "Mihai", "Ana", "Pavel", "Katarina", "Dimitri", "Natalia", "Viktor", "Petra"],
  middleEastern: ["Khalid", "Yasmin", "Tariq", "Leila", "Rashid", "Amina", "Hassan", "Noor"],
  latinAmerican: ["Carlos", "Sofia", "Diego", "Isabella", "Luis", "Maria", "Miguel", "Valentina"]
};

const lastNames = {
  english: ["Thompson", "Davies", "Wilson", "Roberts", "Brown", "Taylor", "White", "Anderson", "Martin", "Thomas", "Jackson", "Harris", "Lewis", "Robinson", "Clark", "Walker", "Hall", "Young", "King", "Wright", "Cooper", "Bennett", "Mitchell", "Baker", "Turner", "Collins", "Hughes", "Foster", "Barnes", "Reed", "Scott", "Morris", "Cook", "Ward", "Bell", "Morgan", "Murphy", "Cox", "Richardson", "Howard", "Phillips", "Evans", "Edwards", "Watson", "Brooks", "Green", "Wood", "Sanders", "Price", "Bennett", "Long", "Barnes", "Ross", "Henderson", "Coleman", "Jenkins"],
  scottish: ["MacLeod", "Campbell", "Fraser", "Stewart", "Murray", "MacDonald", "Grant", "Robertson", "Ross", "Cameron", "MacKenzie", "Ferguson", "Gordon", "Reid"],
  welsh: ["Jones", "Evans", "Hughes", "Owen", "Price", "Morgan", "Edwards", "Williams", "Lloyd", "Jenkins", "Davies", "Griffiths", "Rees"],
  irish: ["O'Brien", "Murphy", "Kelly", "Ryan", "O'Connor", "Walsh", "O'Sullivan", "Byrne", "McCarthy", "Doyle", "Flynn", "Kennedy", "O'Donnell"],
  southAsian: ["Patel", "Sharma", "Kumar", "Singh", "Desai", "Mehta", "Reddy", "Gupta", "Shah", "Ali", "Rahman", "Ahmed", "Hassan", "Khan", "Malik", "Choudhury", "Rao"],
  eastAsian: ["Chen", "Zhang", "Li", "Tanaka", "Kim", "Yamamoto", "Wang", "Sato", "Park", "Suzuki", "Liu", "Wong", "Lee", "Nguyen"],
  african: ["Mensah", "Okafor", "Boateng", "Adeyemi", "Ogunleye", "Okoro", "Nwosu", "Balogun", "Adebayo", "Oluwaseun", "Mwangi", "Kamau"],
  easternEuropean: ["Nowak", "Kowalski", "Popov", "Ivanova", "Ionescu", "Petrescu", "Novak", "Horvath", "Volkov", "Kozlov", "Kuznetsov"],
  middleEastern: ["Al-Mansouri", "Aziz", "Farouk", "Nassar", "Hamdan", "Al-Sayed", "Khalil"],
  latinAmerican: ["Rodriguez", "Martinez", "Fernandez", "Garcia", "Santos", "Silva", "Morales", "Ramirez"]
};

// Track used names to ensure uniqueness
const usedNames = new Set<string>();

function generateUniqueName(): string {
  const ethnicities = Object.keys(firstNames) as Array<keyof typeof firstNames>;
  
  let attempts = 0;
  while (attempts < 1000) {
    // Randomly select ethnicity
    const ethnicity = ethnicities[Math.floor(Math.random() * ethnicities.length)];
    
    // Generate name
    const firstName = firstNames[ethnicity][Math.floor(Math.random() * firstNames[ethnicity].length)];
    const lastName = lastNames[ethnicity][Math.floor(Math.random() * lastNames[ethnicity].length)];
    const fullName = `${firstName} ${lastName}`;
    
    // Check if unique
    if (!usedNames.has(fullName)) {
      usedNames.add(fullName);
      return fullName;
    }
    
    attempts++;
  }
  
  // Fallback: append number if we can't find unique combination
  const ethnicity = ethnicities[Math.floor(Math.random() * ethnicities.length)];
  const firstName = firstNames[ethnicity][Math.floor(Math.random() * firstNames[ethnicity].length)];
  const lastName = lastNames[ethnicity][Math.floor(Math.random() * lastNames[ethnicity].length)];
  const uniqueName = `${firstName} ${lastName} ${Math.floor(Math.random() * 999)}`;
  usedNames.add(uniqueName);
  return uniqueName;
}

// Diverse review titles
const reviewTitles = [
  "Absolutely brilliant purchase",
  "Best investment I've made",
  "Couldn't be happier",
  "Exceeded all expectations",
  "Fantastic quality",
  "Game-changer for my commute",
  "Highly recommend",
  "Impressive performance",
  "Just what I needed",
  "Love everything about it",
  "Outstanding value",
  "Perfect for daily use",
  "Quality exceeds the price",
  "Really pleased",
  "Superb engineering",
  "Top-notch product",
  "Very impressed",
  "Worth every penny",
  "Brilliant for city riding",
  "Excellent build quality",
  "Fantastic range",
  "Great for hills",
  "Perfect commuter bike",
  "Smooth and powerful",
  "Battery life is amazing",
  "Comfortable ride",
  "Easy to use",
  "Folds up nicely",
  "Great customer service",
  "Love the design",
  "Motor is very quiet",
  "Perfect size",
  "Responsive and smooth",
  "Solid and reliable",
  "Better than expected",
  "Delighted with purchase",
  "Excellent starter bike",
  "Feels very sturdy",
  "Good for longer rides",
  "Happy commuter here",
  "Ideal for my needs"
];

// Diverse review comments (product-agnostic)
const reviewComments = [
  "The build quality is exceptional. Everything feels solid and well-engineered. I've been using it daily for three months now and it still performs like new.",
  "Battery life has been fantastic. I do a 12-mile round trip daily and only charge twice a week. The range indicator is very accurate too.",
  "Delivery was impressively quick. Arrived within two days, well packaged. Setup took about 20 minutes following the clear instructions provided.",
  "The motor provides smooth, natural assistance. You barely notice it working but hills that used to exhaust me are now effortless.",
  "I was hesitant about the price initially, but this has saved me hundreds in fuel costs already. Best decision I've made this year.",
  "Customer service deserves special mention. Had a question about maintenance and received a detailed response within hours.",
  "The design is sleek and modern. I get compliments on it regularly. Doesn't look like a typical Electric bike at all.",
  "Braking performance is excellent. Stops quickly and confidently even in wet conditions. Feel very safe riding in traffic.",
  "Perfect for my hilly commute. What used to take 45 minutes of sweaty pedalling now takes 25 minutes and I arrive fresh.",
  "The folding mechanism is genius. Folds down in seconds and fits easily in my car boot or under my desk at work.",
  "Saddle is surprisingly comfortable. I've done 30-mile rides without any discomfort. Gear shifting is smooth and precise too.",
  "Lights are bright and effective. Battery powers them without draining noticeably. Feel confident riding in darker months.",
  "This has genuinely changed my lifestyle. Haven't driven to work in two months. Saving money and getting fitter simultaneously.",
  "Assembly was straightforward. Clear instructions and all necessary tools included. Was ready to ride in under half an hour.",
  "The LCD display is clear and easy to read in all conditions. Love being able to monitor speed and battery at a glance.",
  "Surprisingly quiet motor. My old Electric bike sounded like a lawnmower. This one is almost silent - very refined.",
  "Build quality exceeded expectations at this price point. No cheap plastics or wobbly parts. Everything feels premium.",
  "The range is no exaggeration. Did a 45-mile ride last weekend and still had battery left. Perfect for longer adventures.",
  "Gears shift smoothly under power. Some cheaper bikes require you to stop pedalling - not this one. Very convenient.",
  "Love the removable battery. I can charge it at my desk whilst at work. So much more convenient than wheeling the whole bike inside.",
  "Arrived perfectly adjusted. Brakes, gears, everything worked perfectly straight out of the box. Very impressed with quality control.",
  "The tyres grip well in all conditions. Confident cornering even on wet roads. Feel very planted and stable.",
  "Suspension works brilliantly. Absorbs bumps effectively without feeling bouncy. Much more comfortable than my old rigid bike.",
  "After six months of daily use, I have zero complaints. No mechanical issues whatsoever. Just regular maintenance needed.",
  "The weight is well-balanced. Easy to manoeuvre despite being heavier than a standard bike. Handles beautifully.",
  "Charges faster than expected. From empty to full in about 4-5 hours. Perfect to charge overnight.",
  "This has opened up so many new routes. Places that were too far or too hilly are now easily accessible. Loving the freedom.",
  "My colleagues have been asking about it constantly. Two have already bought one based on my recommendation.",
  "The mudguards actually work. Stay clean and dry even through puddles. Small detail but makes a big difference.",
  "Kickstand is sturdy and reliable. Bike stays upright on any surface. Simple but essential feature that works perfectly.",
  "I'm 6'2\" and it fits me comfortably with room to adjust. My partner is 5'4\" and can also ride it comfortably. Very adjustable.",
  "The throttle mode is brilliant for starting from lights. Get moving quickly without having to pedal hard in traffic.",
  "Surprisingly agile despite the weight. Easy to navigate through tight spaces and park conveniently.",
  "Rain hasn't been an issue. Everything is well-sealed and continues working perfectly. Confidence-inspiring in all weather.",
  "Love that I can use it as a regular bike when I want exercise, or with assistance when I'm tired. Versatility is brilliant.",
  "The rear rack is solid and takes panniers perfectly. Can carry a week's shopping without any wobble.",
  "Exactly as described on the website. No nasty surprises. What you see is what you get, which is refreshing.",
  "The power levels are well-judged. Eco mode for range, Sport mode for hills. Perfect balance of options.",
  "Wheels are strong and true. Haven't needed any adjustment despite some rough cycle paths and potholes.",
  "Brakes require minimal finger pressure. Very responsive without being grabby. Excellent modulation.",
  "This has paid for itself already in saved train fares. The financial case is compelling even before health benefits.",
  "Gear range is perfect. Lowest gear handles steep hills, highest gear keeps up with traffic on flat roads.",
  "The bell is louder than expected - in a good way! Pedestrians actually hear it first time.",
  "Frame design is practical. Mounting and dismounting is easy, which matters when stopping frequently in town.",
  "No buyer's remorse whatsoever. This is everything I hoped it would be and more. Absolutely delighted.",
  "The integrated lights look sleek and work brilliantly. No fumbling with removable lights anymore.",
  "Puncture-resistant tyres have lived up to the name. Several months of daily use, zero flats. Impressive.",
  "Customer support answered all my pre-purchase questions promptly. Made the buying decision much easier.",
  "The craftsmanship is evident. Welds are neat, paint is flawless. This is a bike built to last.",
  "Eco mode extends the range impressively. Easily get 50+ miles if you're not rushing. Perfect for weekend rides."
];

// Product-specific comments for different categories
const mountainBikeComments = [
  "Took it on some proper trails last weekend - the suspension handled everything beautifully. Roots, rocks, drops - all absorbed smoothly.",
  "The fat tyres provide incredible grip on loose surfaces. Confident descending on gravel and mud where my road bike would slip.",
  "Disc brakes are essential off-road and these perform flawlessly. Powerful, progressive, reliable even when caked in mud.",
  "The wide handlebars give excellent control on technical sections. Feel very planted and confident on descents.",
  "Ground clearance is generous. No pedal strikes even on rocky terrain. Well thought-out geometry for actual off-road use."
];

const foldingBikeComments = [
  "Folding mechanism is brilliant. Takes literally 15 seconds. No fumbling or forcing required - just clicks into place.",
  "Perfect for my train commute. Folds small enough that it doesn't bother other passengers during rush hour.",
  "Stores under my desk at work. Saves paying for cycle parking and keeps it safe. Unfolding is just as quick.",
  "The hinges feel solid with no play. Despite folding, it rides like a regular bike - no flex or wobble whatsoever.",
  "Can fit in the boot of my hatchback easily. Opens up possibilities for weekend rides in the countryside."
];

const cityBikeComments = [
  "Perfect for navigating city traffic. Acceleration from lights is quick enough to keep up with cars safely.",
  "The upright riding position is ideal for visibility in traffic. Can see over cars and be seen by drivers.",
  "Narrow enough for cycle lanes but stable enough for main roads. Strikes the perfect balance for urban riding.",
  "The mudguards and chain guard keep me clean for work. No more trouser clips or dirty marks on my suit.",
  "Integrated lights and reflectors make me visible. Essential for early morning and evening commutes in winter."
];

async function seedUniqueReviews() {
  console.log("🗑️  Clearing existing reviews...");
  await db.delete(reviews);
  
  console.log("📦 Fetching all products...");
  const allProducts = await db.select().from(products);
  console.log(`Found ${allProducts.length} products`);
  
  let totalReviewsCreated = 0;
  
  for (const product of allProducts) {
    const reviewCount = Math.floor(Math.random() * 31) + 120; // 120-150 reviews per product
    console.log(`\n📝 Creating ${reviewCount} unique reviews for ${product.name}...`);
    
    // Determine product-specific comments
    let specificComments: string[] = [];
    if (product.category?.toLowerCase().includes('mountain')) {
      specificComments = mountainBikeComments;
    } else if (product.category?.toLowerCase().includes('folding')) {
      specificComments = foldingBikeComments;
    } else if (product.category?.toLowerCase().includes('city')) {
      specificComments = cityBikeComments;
    }
    
    const reviewsToInsert = [];
    
    for (let i = 0; i < reviewCount; i++) {
      // Generate completely unique customer name
      const customerName = generateUniqueName();
      
      // Random rating (weighted towards higher ratings)
      const rand = Math.random();
      let rating;
      if (rand < 0.70) rating = 5; // 70% are 5 stars
      else if (rand < 0.90) rating = 4; // 20% are 4 stars
      else if (rand < 0.97) rating = 3; // 7% are 3 stars
      else if (rand < 0.99) rating = 2; // 2% are 2 stars
      else rating = 1; // 1% are 1 star
      
      // Random title
      const title = reviewTitles[Math.floor(Math.random() * reviewTitles.length)];
      
      // Random comment (mix of general and product-specific)
      let comment;
      if (specificComments.length > 0 && Math.random() < 0.3) {
        // 30% chance of product-specific comment
        comment = specificComments[Math.floor(Math.random() * specificComments.length)];
      } else {
        // General comment
        comment = reviewComments[Math.floor(Math.random() * reviewComments.length)];
      }
      
      // 90% verified purchases
      const verified = Math.random() < 0.90;
      
      // Random date within last 6 months
      const daysAgo = Math.floor(Math.random() * 180);
      const reviewDate = new Date();
      reviewDate.setDate(reviewDate.getDate() - daysAgo);
      
      reviewsToInsert.push({
        productId: product.id,
        customerName,
        rating,
        title,
        comment,
        verified,
        createdAt: reviewDate,
      });
    }
    
    // Insert all reviews for this product
    await db.insert(reviews).values(reviewsToInsert);
    totalReviewsCreated += reviewCount;
    console.log(`✅ Created ${reviewCount} reviews for ${product.name}`);
  }
  
  console.log(`\n✨ Successfully created ${totalReviewsCreated} unique reviews across ${allProducts.length} products!`);
  console.log(`📊 Average reviews per product: ${Math.round(totalReviewsCreated / allProducts.length)}`);
}

// Run the seeding
seedUniqueReviews()
  .then(() => {
    console.log("\n✅ Review seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error seeding reviews:", error);
    process.exit(1);
  });
