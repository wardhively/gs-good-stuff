"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Sprout } from "lucide-react";

interface DailyVerse {
  reference: string;
  text: string;
  farmInsight: string;
}

const VERSES: DailyVerse[] = [
  {
    reference: "Ecclesiastes 3:1-2",
    text: "To everything there is a season, and a time to every purpose under the heaven: a time to plant, and a time to pluck up that which is planted.",
    farmInsight: "Every stage of the dahlia lifecycle — storing, jugging, planting, digging — has its right moment. Trust the season you're in.",
  },
  {
    reference: "Galatians 6:9",
    text: "And let us not be weary in well doing: for in due season we shall reap, if we faint not.",
    farmInsight: "Those long days of dividing tubers and prepping beds will pay off when the orders start rolling in. Keep going.",
  },
  {
    reference: "Mark 4:26-29",
    text: "So is the kingdom of God, as if a man should cast seed into the ground; and should sleep, and rise night and day, and the seed should spring and grow up, he knoweth not how.",
    farmInsight: "You do the planting and the watering, but God handles the growing. Your dahlias don't need you to worry — they need you to be faithful.",
  },
  {
    reference: "Matthew 13:31-32",
    text: "The kingdom of heaven is like a grain of mustard seed, which a man took and sowed in his field: which indeed is the least of all seeds, but when it is grown, it is the greatest among herbs.",
    farmInsight: "G&S Good Stuff started with a few hundred tubers. By 2030, the plan is 82,000. Small beginnings, big harvest.",
  },
  {
    reference: "Isaiah 28:23-26",
    text: "Give ear and hear my voice; listen and hear my speech. Does the plowman plow all day to sow? His God instructs him to discretion and teaches him.",
    farmInsight: "Good farming is wisdom, not just labor. Knowing when to stop prepping and start planting is a skill God teaches through experience.",
  },
  {
    reference: "Psalm 65:9-10",
    text: "You visit the earth and water it, You greatly enrich it; the river of God is full of water; You provide their grain, for so You have prepared it.",
    farmInsight: "Every rain on the Canisteo River valley is provision. Even the wet areas on the farm map are part of God's irrigation plan.",
  },
  {
    reference: "Proverbs 12:11",
    text: "He who tills his land will be satisfied with bread, but he who follows vain things lacks understanding.",
    farmInsight: "Stay focused on the real work — zones prepped, tubers divided, orders shipped. The results come from showing up daily.",
  },
  {
    reference: "2 Corinthians 9:6",
    text: "But this I say: He who sows sparingly will also reap sparingly, and he who sows bountifully will also reap bountifully.",
    farmInsight: "The five-year plan is ambitious for a reason. Every extra tuber planted this year multiplies into future inventory and revenue.",
  },
  {
    reference: "Genesis 1:11-12",
    text: "Then God said, 'Let the earth bring forth grass, the herb that yields seed, and the fruit tree that yields fruit according to its kind.' And it was so.",
    farmInsight: "Every dahlia variety produces 'according to its kind.' That's why tracking each variety's performance matters — God built reliability into creation.",
  },
  {
    reference: "John 12:24",
    text: "Most assuredly, I say to you, unless a grain of wheat falls into the ground and dies, it shall remain alone; but if it dies, it produces much grain.",
    farmInsight: "Division is the heart of the dahlia business. One clump dies to its singular form and becomes four or five new tubers. Sacrifice multiplies.",
  },
  {
    reference: "James 5:7",
    text: "Therefore be patient, brethren, until the coming of the Lord. See how the farmer waits for the precious fruit of the earth, waiting patiently for it until it receives the early and latter rain.",
    farmInsight: "After planting, there's nothing to do but wait and watch the soil temp. Patience isn't passive — it's trusting God's timing for the growing season.",
  },
  {
    reference: "Psalm 126:5-6",
    text: "Those who sow in tears shall reap in joy. He who continually goes forth weeping, bearing seed for sowing, shall doubtless come again with rejoicing, bringing his sheaves with him.",
    farmInsight: "Some seasons are hard — late frost, pest damage, market slowdowns. But faithfulness in the tough seasons brings the biggest harvest.",
  },
  {
    reference: "Isaiah 55:10-11",
    text: "For as the rain comes down and the snow from heaven, and do not return there, but water the earth and make it bring forth and bud — so shall My word be.",
    farmInsight: "Every investment in the farm — soil amendments, irrigation, equipment — is seed that doesn't come back void. Trust the process.",
  },
  {
    reference: "Hosea 10:12",
    text: "Sow to yourselves in righteousness, reap in mercy; break up your fallow ground: for it is time to seek the Lord.",
    farmInsight: "New zones on the farm map are literally fallow ground waiting to be broken. Each new bed is an act of faith in future growth.",
  },
  {
    reference: "Proverbs 27:23-27",
    text: "Be diligent to know the state of your flocks, and attend to your herds; for riches are not forever. The hay appears, the tender grass shows itself, and herbs of the mountains are gathered.",
    farmInsight: "This is why the inventory system exists — know the state of every variety, every zone, every piece of equipment. Diligence is stewardship.",
  },
  {
    reference: "Matthew 6:28-29",
    text: "Consider the lilies of the field, how they grow: they neither toil nor spin; and yet I say to you that even Solomon in all his glory was not arrayed like one of these.",
    farmInsight: "Dahlias are living proof of God's artistry. Every dinner plate bloom you grow is a cathedral of color that no human designer could match.",
  },
  {
    reference: "1 Corinthians 3:6-7",
    text: "I planted, Apollos watered, but God gave the increase. So then neither he who plants is anything, nor he who waters, but God who gives the increase.",
    farmInsight: "You and Suzy each play your part — Gary in the field, Suzy on orders. But the real growth comes from above.",
  },
  {
    reference: "Psalm 104:14",
    text: "He causes the grass to grow for the cattle, and vegetation for the service of man, that he may bring forth food from the earth.",
    farmInsight: "Your dahlia operation is part of God's design for humans to cultivate the earth. This work has purpose beyond profit.",
  },
  {
    reference: "Proverbs 16:3",
    text: "Commit your works to the Lord, and your thoughts will be established.",
    farmInsight: "Before the planting season, before the big orders — commit the plan to God. The five-year vision works best when it's held with open hands.",
  },
  {
    reference: "Jeremiah 29:5",
    text: "Build houses and dwell in them; plant gardens and eat their fruit.",
    farmInsight: "God told His people to plant where they are. Addison, NY is your place. The dahlia farm is your garden. Bloom where you're planted.",
  },
  {
    reference: "Matthew 25:21",
    text: "His lord said to him, 'Well done, good and faithful servant; you were faithful over a few things, I will make you ruler over many things.'",
    farmInsight: "Starting with 400 tubers and stewarding them well is how you get to 82,000. Faithfulness in the small season opens the door to the big one.",
  },
  {
    reference: "Colossians 3:23",
    text: "And whatever you do, do it heartily, as to the Lord and not to men.",
    farmInsight: "Every tuber divided cleanly, every order packed carefully, every zone prepped thoroughly — it's all worship when done for the Lord.",
  },
  {
    reference: "Psalm 1:3",
    text: "He shall be like a tree planted by the rivers of water, that brings forth its fruit in its season, whose leaf also shall not wither; and whatever he does shall prosper.",
    farmInsight: "The Canisteo River runs through your valley. Be rooted like those trees along its banks — steady, fruitful, season after season.",
  },
  {
    reference: "Genesis 8:22",
    text: "While the earth remains, seedtime and harvest, cold and heat, summer and winter, and day and night shall not cease.",
    farmInsight: "The rhythm of your farm calendar — frost dates, planting windows, dig season — is built into creation itself. You can count on it.",
  },
  {
    reference: "Luke 12:27-28",
    text: "Consider the lilies, how they grow: they neither toil nor spin; yet I tell you, even Solomon in all his glory was not arrayed like one of these.",
    farmInsight: "When worry about the business creeps in, walk through the dahlia rows. God clothes the flowers. He'll take care of the farm.",
  },
  {
    reference: "Isaiah 61:11",
    text: "For as the earth brings forth its bud, and as the garden causes the things that are sown in it to spring forth, so the Lord God will cause righteousness and praise to spring forth.",
    farmInsight: "Your dahlia garden is a living parable. Every bloom that springs up is a reminder that God causes good things to grow.",
  },
  {
    reference: "Psalm 37:3",
    text: "Trust in the Lord, and do good; dwell in the land, and feed on His faithfulness.",
    farmInsight: "Dwell in Addison, work the land, trust God with the harvest. That's the business plan underneath the five-year plan.",
  },
  {
    reference: "Proverbs 3:9-10",
    text: "Honor the Lord with your possessions, and with the firstfruits of all your increase; so your barns will be filled with plenty.",
    farmInsight: "The first tubers of the season, the first revenue — give God the credit and the thanks. Generosity opens the door to abundance.",
  },
  {
    reference: "2 Timothy 2:6",
    text: "The hardworking farmer must be first to partake of the crops.",
    farmInsight: "You're putting in the hours — early mornings, long dig days, late-night packing. You deserve to enjoy the fruit of this labor.",
  },
  {
    reference: "Song of Solomon 2:11-12",
    text: "For lo, the winter is past, the rain is over and gone. The flowers appear on the earth; the time of singing has come.",
    farmInsight: "After the long Addison winter, when the last frost passes in May and the dahlias start pushing green — that's this verse come to life.",
  },
  {
    reference: "Ecclesiastes 11:6",
    text: "In the morning sow your seed, and in the evening do not withhold your hand; for you do not know which will prosper, either this or that, or whether both alike will be good.",
    farmInsight: "Plant more varieties than you think you need. Some will surprise you. The market picks winners you didn't expect.",
  },
  {
    reference: "Philippians 4:19",
    text: "And my God shall supply all your need according to His riches in glory by Christ Jesus.",
    farmInsight: "When equipment breaks, when a zone floods, when orders slow down — God's supply chain doesn't have backorder problems.",
  },
  {
    reference: "Deuteronomy 28:12",
    text: "The Lord will open to you His good treasure, the heavens, to give the rain to your land in its season, and to bless all the work of your hand.",
    farmInsight: "Rain in its season is the prayer for every Addison growing year. Too much floods the Canisteo valley; too little stunts the tubers. God knows the balance.",
  },
  {
    reference: "Psalm 85:12",
    text: "Yes, the Lord will give what is good; and our land will yield its increase.",
    farmInsight: "The land in Addison is good land. With faithful stewardship and God's blessing, it will yield everything the five-year plan promises and more.",
  },
];

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export default function ScriptureOfDay() {
  const [expanded, setExpanded] = useState(false);
  const dayOfYear = getDayOfYear();
  const verse = VERSES[dayOfYear % VERSES.length];

  return (
    <div className="mx-4 mt-3 mb-1 rounded-xl border border-fence bg-linen shadow-sm overflow-hidden">
      {/* Header — always visible, toggles expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-petal" />
          <span className="text-xs font-bold uppercase tracking-widest text-soil">
            Scripture of the Day
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-stone-c" />
        ) : (
          <ChevronDown className="w-4 h-4 text-stone-c" />
        )}
      </button>

      {/* Expandable body */}
      {expanded && (
        <div className="px-4 pb-4">
          {/* Reference */}
          <p className="text-sm font-semibold text-soil mb-1.5">
            {verse.reference}
          </p>

          {/* Verse text — italic serif */}
          <p className="text-sm text-root leading-relaxed italic font-serif mb-3">
            &ldquo;{verse.text}&rdquo;
          </p>

          {/* Farm insight callout */}
          <div className="flex items-start gap-2 bg-leaf-lt rounded-lg px-3 py-2">
            <Sprout className="w-4 h-4 text-leaf mt-0.5 flex-shrink-0" />
            <p className="text-xs text-leaf-dk leading-relaxed">
              {verse.farmInsight}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
