export const categories = [
    { id: 'oil', name: 'Oil', image: 'https://images.unsplash.com/photo-1474978528675-4a50a4508dc3?w=500&q=80' },
    { id: 'detergent', name: 'Detergent', image: 'https://images.unsplash.com/photo-1585244585141-8637eb852a48?w=500&q=80' },
    { id: 'tea', name: 'Tea', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80' },
    { id: 'agarbatti', name: 'Agarbatti', image: 'https://images.unsplash.com/photo-1606132766863-71aeb9ea267c?w=500&q=80' },
    { id: 'others', name: 'Others', image: 'https://images.unsplash.com/photo-1621415286049-3a13723bf268?w=500&q=80' }
];

export const products = [
    // Oil Category
    {
        id: 'o1',
        name: 'Saloni Mustard Oil (1L)',
        price: 150.00,
        category: 'oil',
        image: 'https://images.unsplash.com/photo-1474978528675-4a50a4508dc3?w=1000&q=80',
        description: 'Premium quality Kachi Ghani mustard oil from Saloni.',
        featured: true
    },
    {
        id: 'o2',
        name: 'Saavli Refined Oil (1L)',
        price: 135.00,
        category: 'oil',
        image: 'https://images.unsplash.com/photo-1620584400589-424a683935dc?w=1000&q=80',
        description: 'Saavli brand light and healthy cooking oil.',
        featured: false
    },
    {
        id: 'o3',
        name: 'Mahakosh Soyabean Oil (1L)',
        price: 145.00,
        category: 'oil',
        image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=1000&q=80',
        description: 'Fortified soyabean oil from Mahakosh, rich in vitamins.',
        featured: true
    },
    {
        id: 'o4',
        name: 'Rajdhani Groundnut Oil (1L)',
        price: 190.00,
        category: 'oil',
        image: 'https://images.unsplash.com/photo-1605342415174-88cb077e6f3b?w=1000&q=80',
        description: 'Pure filtered groundnut oil by Rajdhani.',
        featured: false
    },

    // Detergent Category
    {
        id: 'd1',
        name: 'Doctor Detergent Powder (1kg)',
        price: 95.00,
        category: 'detergent',
        image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=1000&q=80',
        description: 'Powerful stain removal with Doctor brand detergent.',
        featured: true
    },
    {
        id: 'd2',
        name: 'Doctor Liquid Detergent (500ml)',
        price: 120.00,
        category: 'detergent',
        image: 'https://images.unsplash.com/photo-1585244585141-8637eb852a48?w=1000&q=80',
        description: 'Doctor brand liquid detergent for front and top load washing machines.',
        featured: false
    },

    // Tea Category
    {
        id: 't1',
        name: 'Meri Chai Akshay (250g)',
        price: 85.00,
        category: 'tea',
        image: 'https://images.unsplash.com/photo-1594631661960-7be8fd88c95b?w=1000&q=80',
        description: 'Strong and refreshing CTC tea from Meri Chai Akshay.',
        featured: true
    },
    {
        id: 't2',
        name: 'Meri Chai Akshay Premium Leaves (500g)',
        price: 160.00,
        category: 'tea',
        image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=1000&q=80',
        description: 'Premium quality select tea leaves by Meri Chai Akshay.',
        featured: false
    },

    // Agarbatti Category
    {
        id: 'a1',
        name: 'Premium Sandalwood Agarbatti',
        price: 45.00,
        category: 'agarbatti',
        image: 'https://images.unsplash.com/photo-1606132766863-71aeb9ea267c?w=1000&q=80',
        description: 'Long-lasting pure sandalwood fragrance sticks.',
        featured: true
    },
    {
        id: 'a2',
        name: 'Rose & Jasmine Agarbatti Combo',
        price: 60.00,
        category: 'agarbatti',
        image: 'https://images.unsplash.com/photo-1596433808952-4ebbef2861a4?w=1000&q=80',
        description: 'Floral bliss with rose and jasmine scented incense sticks.',
        featured: false
    },

    // Others (Ruchi Brand)
    {
        id: 'oth1',
        name: 'Ruchi Gold Refined Palmolein Oil (1L)',
        price: 110.00,
        category: 'others',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1000&q=80',
        description: 'Healthy and light Ruchi Gold Palmolein oil.',
        featured: true
    },
    {
        id: 'oth2',
        name: 'Ruchi Nutrela Soya Chunks (200g)',
        price: 55.00,
        category: 'others',
        image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=1000&q=80',
        description: 'High protein vegetarian soya chunks by Ruchi.',
        featured: false
    },
    // New Additional 20 Products
    {
        id: 'o5',
        name: 'Saffola Gold Blended Oil (1L)',
        price: 185.00,
        category: 'oil',
        image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=500&q=80',
        description: 'Blended edible vegetable oil for a healthy heart.',
        featured: false
    },
    {
        id: 'o6',
        name: 'Fortune Sunflower Oil (1L)',
        price: 140.00,
        category: 'oil',
        image: 'https://images.unsplash.com/photo-1474978528675-4a50a4508dc3?w=500&q=80',
        description: 'Light and easily digestible sunflower oil.',
        featured: false
    },
    {
        id: 'o7',
        name: 'Dhara Kachi Ghani Mustard Oil (1L)',
        price: 165.00,
        category: 'oil',
        image: 'https://images.unsplash.com/photo-1620584400589-424a683935dc?w=500&q=80',
        description: 'Traditional pungent mustard oil by Dhara.',
        featured: false
    },
    {
        id: 'o8',
        name: 'Patanjali Cow Ghee (500ml)',
        price: 320.00,
        category: 'oil',
        image: 'https://images.unsplash.com/photo-1605342415174-88cb077e6f3b?w=500&q=80',
        description: 'Pure cow ghee for daily nutrition and cooking.',
        featured: true
    },
    {
        id: 'd3',
        name: 'Surf Excel Easy Wash (1kg)',
        price: 130.00,
        category: 'detergent',
        image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500&q=80',
        description: 'Removes tough stains easily without much scrubbing.',
        featured: false
    },
    {
        id: 'd4',
        name: 'Ariel Matic Front Load (1kg)',
        price: 260.00,
        category: 'detergent',
        image: 'https://images.unsplash.com/photo-1585244585141-8637eb852a48?w=500&q=80',
        description: 'Specially designed for front load washing machines.',
        featured: true
    },
    {
        id: 'd5',
        name: 'Tide Plus Double Power (1kg)',
        price: 115.00,
        category: 'detergent',
        image: 'https://images.unsplash.com/photo-1610222013898-3f5f3e46cbb6?w=500&q=80',
        description: 'Outstanding whiteness and pleasant fragrance.',
        featured: false
    },
    {
        id: 'd6',
        name: 'Rin Detergent Bar (250g)',
        price: 25.00,
        category: 'detergent',
        image: 'https://images.unsplash.com/photo-1584949514159-869d8d641d40?w=500&q=80',
        description: 'Classic detergent bar for collar and cuff stains.',
        featured: false
    },
    {
        id: 't3',
        name: 'Tata Tea Gold (500g)',
        price: 290.00,
        category: 'tea',
        image: 'https://images.unsplash.com/photo-1594910300957-61c0e3a62886?w=500&q=80',
        description: 'Rich taste with long tea leaves for a great aroma.',
        featured: true
    },
    {
        id: 't4',
        name: 'Brooke Bond Red Label (500g)',
        price: 270.00,
        category: 'tea',
        image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=500&q=80',
        description: 'Blend of CTC tea with natural flavors.',
        featured: false
    },
    {
        id: 't5',
        name: 'Lipton Green Tea Honey Lemon (25 Bags)',
        price: 160.00,
        category: 'tea',
        image: 'https://images.unsplash.com/photo-1627447477353-066bcfa4de0b?w=500&q=80',
        description: 'Refreshing zero calorie green tea for weight management.',
        featured: false
    },
    {
        id: 't6',
        name: 'Wagh Bakri Premium Leaf Tea (250g)',
        price: 155.00,
        category: 'tea',
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80',
        description: 'Strong, consistent taste from the finest tea gardens.',
        featured: false
    },
    {
        id: 'a3',
        name: 'Cycle Pure Agarbathies (3 in 1)',
        price: 80.00,
        category: 'agarbatti',
        image: 'https://images.unsplash.com/photo-1606132766863-71aeb9ea267c?w=500&q=80',
        description: 'Combo pack of Lily, Fancy, and Intimate fragrances.',
        featured: true
    },
    {
        id: 'a4',
        name: 'Mangaldeep Temple Mogra Agarbatti',
        price: 50.00,
        category: 'agarbatti',
        image: 'https://images.unsplash.com/photo-1596433808952-4ebbef2861a4?w=500&q=80',
        description: 'Devotional mogra fragrance for daily prayers.',
        featured: false
    },
    {
        id: 'a5',
        name: 'Zed Black Premium Incense Sticks',
        price: 75.00,
        category: 'agarbatti',
        image: 'https://images.unsplash.com/photo-1606132766863-71aeb9ea267c?w=500&q=80',
        description: 'Rich, deep woody fragrance for meditation.',
        featured: false
    },
    {
        id: 'oth3',
        name: 'Aashirvaad Shudh Chakki Atta (5kg)',
        price: 240.00,
        category: 'others',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80',
        description: '100% pure wheat flour for soft rotis.',
        featured: true
    },
    {
        id: 'oth4',
        name: 'India Gate Basmati Rice Classic (1kg)',
        price: 195.00,
        category: 'others',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80',
        description: 'Premium long grain basmati rice for biryanis.',
        featured: false
    },
    {
        id: 'oth5',
        name: 'Tata Salt (1kg)',
        price: 25.00,
        category: 'others',
        image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=500&q=80',
        description: 'Vacuum evaporated iodized salt.',
        featured: false
    },
    {
        id: 'oth6',
        name: 'Everest Garam Masala (100g)',
        price: 78.00,
        category: 'others',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&q=80',
        description: 'Perfect blend of Indian spices.',
        featured: false
    },
    {
        id: 'oth7',
        name: 'Madhur Pure & Hygienic Sugar (1kg)',
        price: 55.00,
        category: 'others',
        image: 'https://images.unsplash.com/photo-1589170366657-61c1664fb9be?w=500&q=80',
        description: 'Sparkling white pure sugar crystals.',
        featured: false
    }
];
