export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: number;
  keywords: string[];
  // 데이터 기반 포스트는 occupationSlug를 참조
  occupationSlug?: string;
  // 에디토리얼 포스트는 sections 사용
  sections?: {
    heading: string;
    paragraphs: string[];
  }[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "top-10-highest-paying-countries-for-software-engineers-2026",
    title: "Top 10 Highest Paying Countries for Software Engineers (2026)",
    description:
      "Discover which countries pay software engineers the most in 2026. Compare salaries across 42 countries with PPP adjustments and Big Mac purchasing power analysis.",
    excerpt:
      "Software engineering is one of the most in-demand professions globally. But where do software engineers earn the most? We ranked 42 countries by estimated salary.",
    date: "2026-02-01",
    category: "Salary Rankings",
    readTime: 8,
    keywords: [
      "software engineer salary",
      "highest paying countries software engineer",
      "software engineer salary by country",
      "best countries for software engineers",
    ],
    occupationSlug: "software-engineer",
  },
  {
    slug: "top-10-highest-paying-countries-for-nurses-2026",
    title: "Top 10 Highest Paying Countries for Nurses (2026)",
    description:
      "Find out which countries offer the best salaries for nurses in 2026. Compare nursing salaries across 42 countries with cost of living adjustments.",
    excerpt:
      "Nursing is a critical profession worldwide, but compensation varies dramatically. Here are the top 10 countries where nurses earn the most in 2026.",
    date: "2026-02-03",
    category: "Salary Rankings",
    readTime: 7,
    keywords: [
      "nurse salary by country",
      "highest paying countries for nurses",
      "nursing salary comparison",
      "best countries for nurses salary",
    ],
    occupationSlug: "nurse",
  },
  {
    slug: "big-mac-index-salary-comparison-guide",
    title: "The Big Mac Index: A Fun Way to Compare Salaries Around the World",
    description:
      "Learn how the Big Mac Index works and why it's a surprisingly useful tool for comparing salaries and purchasing power across different countries.",
    excerpt:
      "Can a hamburger tell you how much your salary is really worth? The Big Mac Index, created by The Economist, is a surprisingly insightful tool for salary comparison.",
    date: "2026-02-05",
    category: "Guides",
    readTime: 6,
    keywords: [
      "big mac index",
      "big mac index salary",
      "purchasing power comparison",
      "salary comparison big mac",
    ],
    sections: [
      {
        heading: "What Is the Big Mac Index?",
        paragraphs: [
          "The Big Mac Index was invented by The Economist magazine in 1986 as a lighthearted way to measure purchasing power parity (PPP) between countries. The idea is simple: since a McDonald's Big Mac is made with roughly the same ingredients and process everywhere in the world, its price should theoretically be the same across countries when converted to a common currency.",
          "When the price differs, it suggests that one currency is overvalued or undervalued relative to another. Over the decades, this \"Burgernomics\" tool has become one of the most widely cited informal measures of purchasing power, referenced by economists, journalists, and — as it turns out — salary comparison platforms like ours.",
        ],
      },
      {
        heading: "How Does It Apply to Salary Comparisons?",
        paragraphs: [
          "When comparing salaries across countries, nominal figures in US dollars can be misleading. A software engineer earning $120,000 in the United States and another earning $45,000 in Poland might seem like the American is far better off. But what if the Polish engineer's salary can buy 2.5 times more goods and services locally?",
          "This is where the Big Mac Index becomes useful. By dividing an annual salary by the local price of a Big Mac, you get a \"Big Mac count\" — the number of Big Macs your annual salary could buy. This number strips away currency conversion complexities and gives you a tangible, everyday measure of purchasing power.",
          "For example, if a Big Mac costs $5.69 in the US and 21 PLN ($5.20) in Poland, the Polish engineer's salary of $45,000 could buy approximately 8,654 Big Macs, while the American engineer's $120,000 could buy about 21,090. The ratio (2.4x) is much smaller than the nominal salary ratio (2.7x), showing that the real purchasing power gap is narrower than it first appears.",
        ],
      },
      {
        heading: "Why Big Macs and Not Something Else?",
        paragraphs: [
          "McDonald's operates in over 100 countries, making the Big Mac one of the most universally available consumer products. The burger requires a mix of agricultural products (beef, wheat, lettuce), labor, real estate, and utilities — making it a surprisingly comprehensive basket of goods compressed into a single item.",
          "Of course, the Big Mac Index has limitations. Local tastes, taxes, import duties, and McDonald's pricing strategies all affect the price. In some countries, McDonald's is a premium dining option, while in others it's budget fast food. India doesn't even sell beef Big Macs. Despite these quirks, the index remains remarkably useful as a rough-and-ready comparison tool.",
        ],
      },
      {
        heading: "Big Mac Index vs. PPP: What's the Difference?",
        paragraphs: [
          "Purchasing Power Parity (PPP) is a more rigorous economic concept that compares the price of a broad basket of goods and services across countries. Organizations like the World Bank and OECD calculate PPP conversion factors based on thousands of items.",
          "The Big Mac Index is essentially a single-item PPP estimate. It's less precise but far more intuitive. On our platform, we show both: PPP-adjusted salaries (using World Bank data) give you the academically rigorous comparison, while Big Mac counts give you the fun, instantly understandable one.",
          "Both tell a similar story: nominal salary rankings can be misleading. A country that ranks #1 in nominal salary might drop several positions when adjusted for purchasing power, and vice versa.",
        ],
      },
      {
        heading: "How We Use the Big Mac Index on Am I Paid Fairly",
        paragraphs: [
          "On every salary comparison page, you'll see a \"Big Mac Power\" metric alongside the nominal salary and PPP-adjusted salary. This shows how many Big Macs your annual salary could buy in that country, using the latest Big Mac price data from The Economist's open dataset.",
          "We track Big Mac prices across 42 countries, giving you a consistent comparison framework. When you compare software engineer salaries in Switzerland ($140,000+) versus Thailand ($15,000), the Big Mac count reveals that the purchasing power gap is significantly smaller than the nominal salary gap suggests.",
          "Whether you're considering relocating for work, negotiating a salary for a remote position, or simply curious about how your pay compares globally, the Big Mac Index offers a quick, tangible reality check that pure currency conversions can't provide.",
        ],
      },
    ],
  },
  {
    slug: "purchasing-power-parity-explained-salary-guide",
    title:
      "Purchasing Power Parity Explained: Why Your Salary Means Different Things in Different Countries",
    description:
      "Understand how purchasing power parity (PPP) affects your real salary. Learn why a $50,000 salary in one country can be worth more than $100,000 in another.",
    excerpt:
      "A $100,000 salary sounds great — but is it? Depending on where you live, it could make you wealthy or barely cover rent. Here's how PPP reveals the truth.",
    date: "2026-02-07",
    category: "Guides",
    readTime: 7,
    keywords: [
      "purchasing power parity",
      "PPP salary",
      "cost of living salary comparison",
      "real salary value",
    ],
    sections: [
      {
        heading: "What Is Purchasing Power Parity (PPP)?",
        paragraphs: [
          "Purchasing Power Parity is an economic theory that allows us to compare the purchasing power of different currencies. In simple terms, PPP tells you how much money you'd need in one country to buy the same goods and services that a certain amount of money would buy in another country.",
          "For example, if a basket of everyday items (groceries, rent, transportation, utilities) costs $3,000 per month in New York but only $1,200 per month in Bangkok, then $1,200 in Bangkok has roughly the same purchasing power as $3,000 in New York. The PPP conversion factor between the US and Thailand would reflect this 2.5x difference.",
        ],
      },
      {
        heading: "Why Nominal Salaries Are Misleading",
        paragraphs: [
          "When you see salary comparison websites listing $120,000 for a software engineer in the US and $25,000 for one in India, your first reaction might be that American engineers are nearly 5 times better off. But this nominal comparison ignores a crucial fact: prices in India are dramatically lower than in the US.",
          "After PPP adjustment, that $25,000 Indian salary might have the purchasing power equivalent of $75,000 in the US. The Indian engineer can afford a comfortable apartment, hire household help, eat out regularly, and save money — a lifestyle that might require $150,000+ in San Francisco.",
          "This is why PPP matters enormously for anyone comparing salaries across countries, whether you're considering international relocation, negotiating remote work compensation, or simply trying to understand global wage inequality.",
        ],
      },
      {
        heading: "How PPP Is Calculated",
        paragraphs: [
          "The World Bank and OECD calculate PPP conversion factors through the International Comparison Program (ICP). Researchers collect prices for thousands of goods and services across participating countries — everything from bread and milk to haircuts and hospital visits.",
          "These prices are then compared to a reference country (usually the United States) to create PPP conversion factors. A PPP factor of 0.35 for India, for example, means that for every dollar of purchasing power in the US, you only need $0.35 worth of Indian rupees to buy the same things in India.",
          "It's important to note that PPP factors are averages across a basket of goods. Individual items can vary wildly — imported electronics might cost the same worldwide, while locally produced food and services can be dramatically cheaper in developing countries.",
        ],
      },
      {
        heading: "PPP in Practice: Real-World Examples",
        paragraphs: [
          "Consider a nurse earning $75,000 in the United States versus one earning $18,000 in Poland. At first glance, the American nurse earns over 4x more. But Poland's PPP factor suggests that the cost of living is roughly 50% of the US level. After PPP adjustment, the Polish nurse's salary is equivalent to about $36,000 in US purchasing power — still lower, but the gap narrows from 4x to about 2x.",
          "Switzerland provides the opposite example. A teacher earning $90,000 in Switzerland sounds impressive, but the extremely high cost of living means the PPP-adjusted value might be closer to $65,000 in US terms. The nominal salary advantage partially evaporates when you account for $2,500/month rent for a modest apartment and $20 lunch bills.",
          "These examples illustrate why our platform shows both nominal and PPP-adjusted salaries for every occupation in every country. The full picture requires both numbers.",
        ],
      },
      {
        heading: "How to Use PPP Data When Comparing Your Salary",
        paragraphs: [
          "When using our salary comparison tool, pay attention to three figures: the nominal salary (in USD), the PPP-adjusted salary, and the Big Mac count. Together, they give you a comprehensive picture of what a salary truly means in each country.",
          "If you're considering relocating, the PPP-adjusted salary is your most reliable indicator. If a job offer in another country shows a lower nominal salary but a higher PPP-adjusted salary, you'd likely enjoy a better standard of living despite the smaller number on your paycheck.",
          "For remote workers negotiating location-based pay adjustments, PPP data provides objective backing for your case. If your employer proposes a 40% pay cut for moving from New York to Lisbon, but PPP data shows Lisbon's cost of living is only 35% lower, you have data to support a smaller adjustment.",
          "Remember that PPP is a national average — living costs can vary dramatically within a country. A salary that's comfortable in a rural area might be tight in the capital city. Use PPP as a starting point, then research specific cities for a more accurate picture.",
        ],
      },
    ],
  },
  {
    slug: "how-much-do-doctors-earn-around-the-world-2026",
    title: "How Much Do Doctors Earn Around the World? A 42-Country Comparison (2026)",
    description:
      "Compare doctor salaries across 42 countries in 2026. See which countries pay doctors the most, with PPP adjustments and purchasing power analysis.",
    excerpt:
      "The medical profession is respected worldwide, but doctor salaries vary enormously by country. We compared earnings across 42 countries to find where doctors are paid the most.",
    date: "2026-02-09",
    category: "Salary Rankings",
    readTime: 8,
    keywords: [
      "doctor salary by country",
      "highest paying countries for doctors",
      "physician salary comparison",
      "doctor salary worldwide",
    ],
    occupationSlug: "doctor",
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
  return [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
