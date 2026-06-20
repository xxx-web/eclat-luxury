export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  img: string;
  desc: string;
  tag?: string;
}

export const allProducts: Product[] = [
  {
    id: 'yueguang',
    name: '月光之泪项链',
    category: '珠宝臻品',
    price: 12800,
    rating: 4.9,
    img: '/images/yueguang.png',
    desc: '以月光为灵感，甄选天然珍珠，匠心独运，宛如月华倾泻。',
    tag: '甄选',
  },
  {
    id: 'gold_rose_earring',
    name: '金玫瑰耳环',
    category: '珠宝臻品',
    price: 8600,
    rating: 4.8,
    img: '/images/gold_rose_earring.png',
    desc: '18K金玫瑰造型，甄选钻石点缀，绽放优雅光芒。',
    tag: '畅销',
  },
  {
    id: 'emerald_ring',
    name: '翡翠花园戒指',
    category: '珠宝臻品',
    price: 22500,
    rating: 4.9,
    img: '/images/emerald_ring.png',
    desc: '甄选哥伦比亚祖母绿，配以钻石花园造型，奢华臻品。',
    tag: '',
  },
  {
    id: 'pearl_bracelet',
    name: '珍珠手链',
    category: '珠宝臻品',
    price: 6800,
    rating: 4.7,
    img: '/images/pearl_bracelet.png',
    desc: '天然淡水珍珠，匠心串制，温润典雅，彰显品味。',
    tag: '甄选',
  },
  {
    id: 'noir_absolu_perfume',
    name: '黑夜Absolute',
    category: '香水雅韵',
    price: 3200,
    rating: 4.9,
    img: '/images/noir_absolu_perfume.png',
    desc: '深邃黑夜中的绝对魅力，乌木与玫瑰的永恒对话。',
    tag: '畅销',
  },
  {
    id: 'rose_celeste_perfume',
    name: '天穹玫瑰',
    category: '香水雅韵',
    price: 2800,
    rating: 4.8,
    img: '/images/rose_celeste_perfume.png',
    desc: '来自天穹的玫瑰芬芳，清新花香，适合日常臻选。',
    tag: '甄选',
  },
  {
    id: 'bois_sacre_perfume',
    name: '神圣之木',
    category: '香水雅韵',
    price: 3500,
    rating: 4.7,
    img: '/images/bois_sacre_perfume.png',
    desc: '沉香与檀木的神圣交融，木质调中的臻品之作。',
    tag: '',
  },
  {
    id: 'quilted_tote_bag',
    name: '菱格纹托特包',
    category: '奢华手袋',
    price: 18500,
    rating: 4.8,
    img: '/images/quilted_tote_bag.png',
    desc: '经典菱格纹，甄选小牛皮，法国匠心工艺，永恒优雅。',
    tag: '畅销',
  },
  {
    id: 'woven_chain_bag',
    name: '编织链条包',
    category: '奢华手袋',
    price: 12800,
    rating: 4.7,
    img: '/images/woven_chain_bag.png',
    desc: '匠心编织皮革，金属链条点缀，现代与经典的完美交融。',
    tag: '甄选',
  },
];
