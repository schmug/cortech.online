// GENERATED FILE — do not edit by hand.
// Regenerate: node scripts/generate-podcast-sources.mjs <path-to.opml>
//
// A point-in-time snapshot of the feeds the Cortech Daily podcast reads,
// exported from Don't Hype Me (https://donthype.me). Served as an importable
// subscription list at /podcast/sources.opml.
//
// This is the show's INBOUND list — what it reads. Not to be confused with
// src/pages/feeds.opml.ts, the OUTBOUND list of feeds this site publishes.

export type SourceFeed = {
  title: string;
  xmlUrl: string;
  /** Don't Hype Me's own taxonomy tags, carried through as OPML `category`. */
  category?: string;
};

export type SourceGroup = {
  name: string;
  feeds: SourceFeed[];
};

/** 78 feeds across 11 groups. */
export const PODCAST_SOURCE_GROUPS: SourceGroup[] = [
  {
    name: 'AI',
    feeds: [
      {
        title: '"anthropic" - Google News',
        xmlUrl: 'https://news.google.com/rss/search?q=anthropic',
        category: '/type/news',
      },
      {
        title: 'AI',
        xmlUrl: 'https://blog.google/technology/ai/rss/',
        category: '/type/corporate',
      },
      {
        title: 'Anthropic',
        xmlUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCrDwWp7EBBv4NwvScIpBDOA',
        category: '/source/video,/type/corporate',
      },
      {
        title: 'Anthropic Engineering Blog',
        xmlUrl:
          'https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_anthropic_engineering.xml',
        category: '/type/corporate,/topic/engineering',
      },
      {
        title: 'Anthropic Frontier Red Team Blog',
        xmlUrl:
          'https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_anthropic_red.xml',
        category: '/type/research,/topic/ai-safety',
      },
      {
        title: 'Anthropic News',
        xmlUrl:
          'https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_anthropic_news.xml',
        category: '/type/corporate',
      },
      {
        title: 'Anthropic Research',
        xmlUrl:
          'https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_anthropic_research.xml',
        category: '/type/research',
      },
      {
        title: "Daniel Paleka's Newsletter",
        xmlUrl: 'https://newsletter.danielpaleka.com/feed',
        category: '/source/newsletter,/type/people,/topic/ai-safety',
      },
      {
        title: "Don't Worry About the Vase",
        xmlUrl: 'https://thezvi.substack.com/feed',
        category: '/source/newsletter,/type/people,/type/analysis',
      },
      { title: 'karpathy', xmlUrl: 'https://karpathy.bearblog.dev/rss/', category: '/type/people' },
      {
        title: 'Manus AI',
        xmlUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCQgFQdqiFQ_LfFBGP6z9dqQ',
        category: '/source/video,/type/corporate',
      },
      {
        title: 'Nate’s Substack',
        xmlUrl: 'https://natesnewsletter.substack.com/feed.xml',
        category: '/source/newsletter,/type/people',
      },
      {
        title: 'One Useful Thing',
        xmlUrl: 'https://www.oneusefulthing.org/feed',
        category: '/source/newsletter,/type/people',
      },
      {
        title: 'OpenAI',
        xmlUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCXZCJLdBC09xxGZ6gcdrc6A',
        category: '/source/video,/type/corporate',
      },
      {
        title: "Simon Willison's Weblog",
        xmlUrl: 'https://simonwillison.net/atom/everything/',
        category: '/type/people,/topic/engineering',
      },
    ],
  },
  {
    name: 'Security',
    feeds: [
      {
        title: '2600 - 2600: The Hacker Quarterly',
        xmlUrl: 'http://www.2600.com/rss.xml',
        category: '/topic/culture',
      },
      {
        title: 'All CISA Advisories',
        xmlUrl: 'https://www.cisa.gov/cybersecurity-advisories/all.xml',
        category: '/topic/government',
      },
      {
        title: 'Articles - ~this week in security~',
        xmlUrl: 'https://this.weekinsecurity.com/articles/rss/',
        category: '/type/analysis',
      },
      {
        title: 'CISA News',
        xmlUrl: 'https://www.cisa.gov/news.xml',
        category: '/topic/government,/type/news',
      },
      {
        title: 'Cyberpunk Librarian',
        xmlUrl: 'https://cyberpunklibrarian.com/feed/',
        category: '/type/people,/topic/culture',
      },
      {
        title: 'Cybersect',
        xmlUrl: 'https://cybersect.substack.com/feed',
        category: '/source/newsletter,/type/people',
      },
      {
        title: 'cybersecurity',
        xmlUrl: 'https://old.reddit.com/r/cybersecurity/.rss',
        category: '/source/reddit,/type/community',
      },
      {
        title: 'darkreading',
        xmlUrl: 'https://www.darkreading.com/rss.xml',
        category: '/type/news',
      },
      {
        title: 'DataBreaches.Net',
        xmlUrl: 'https://databreaches.net/feed/',
        category: '/type/news,/topic/breaches',
      },
      {
        title: 'Distributed Email of Secrets',
        xmlUrl: 'https://ddosecrets.substack.com/feed',
        category: '/source/newsletter,/topic/leaks,/type/journalism',
      },
      {
        title: 'Have I Been Pwned latest breaches',
        xmlUrl: 'https://haveibeenpwned.com/feed/breaches/',
        category: '/topic/breaches',
      },
      {
        title: 'Help Net Security',
        xmlUrl: 'https://www.helpnetsecurity.com/feed/',
        category: '/type/news',
      },
      {
        title: 'Jack Rhysider',
        xmlUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCMIqrmh2lMdzhlCPK5ahsAg',
        category: '/source/video,/source/podcast,/type/people',
      },
      {
        title: 'K-12 Cybersecurity Insider - K12 SIX',
        xmlUrl: 'https://www.k12six.org/k12-cybersecurity-insider?format=rss',
        category: '/topic/education',
      },
      {
        title: 'MCNC CNE',
        xmlUrl: 'https://cne.mcnc.org/feed.xml',
        category: '/topic/education,/topic/government',
      },
      {
        title: 'Open Source Security',
        xmlUrl: 'https://seclists.org/rss/oss-sec.rss',
        category: '/topic/oss',
      },
      {
        title: 'Phrack Magazine',
        xmlUrl: 'http://iosifache.me/feeds/phrack.xml',
        category: '/topic/culture',
      },
      {
        title: 'PogoWasRight.org',
        xmlUrl: 'https://pogowasright.org/feed/',
        category: '/type/news,/topic/privacy',
      },
      {
        title: 'The DFIR Report',
        xmlUrl: 'https://thedfirreport.com/feed/',
        category: '/topic/forensics,/type/research',
      },
      {
        title: 'Zack Whittaker, Author at TechCrunch',
        xmlUrl: 'https://techcrunch.com/author/zack-whittaker/feed/',
        category: '/type/people,/type/journalism',
      },
    ],
  },
  {
    name: 'Privacy',
    feeds: [
      {
        title: 'Reject Convenience',
        xmlUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC-ufRLYrXxrIEApGn9VG5pQ',
        category: '/source/video',
      },
      { title: 'Techlore', xmlUrl: 'https://techlore.tech/rss/', category: '/type/people' },
      {
        title: 'The Opt Out Project',
        xmlUrl: 'https://www.optoutproject.net/feed',
        category: '/type/analysis',
      },
    ],
  },
  {
    name: 'Tech News',
    feeds: [
      {
        title: 'Ars Technica - All content',
        xmlUrl: 'https://feeds.arstechnica.com/arstechnica/index',
      },
      {
        title: 'Hacker News',
        xmlUrl: 'https://news.ycombinator.com/rss',
        category: '/type/community',
      },
      {
        title: 'HackerNoon - The Markup',
        xmlUrl: 'https://hackernoon.com/u/TheMarkup/feed',
        category: '/type/journalism',
      },
      {
        title: 'MIT Technology Review',
        xmlUrl: 'https://www.technologyreview.com/feed/',
        category: '/type/research',
      },
      { title: 'TechCrunch', xmlUrl: 'https://techcrunch.com/feed/', category: '/topic/business' },
      {
        title: 'The Verge',
        xmlUrl: 'https://www.theverge.com/rss/index.xml',
        category: '/topic/culture',
      },
      { title: 'WIRED', xmlUrl: 'https://wired.com/feed/rss', category: '/topic/culture' },
    ],
  },
  {
    name: 'Personal Blogs',
    feeds: [
      { title: 'Bram’s Thoughts', xmlUrl: 'https://bramcohen.com/feed', category: '/type/people' },
      {
        title: "Dan Shapiro's Blog",
        xmlUrl: 'https://www.danshapiro.com/blog/feed/',
        category: '/type/people,/topic/business',
      },
      {
        title: 'Daring Fireball',
        xmlUrl: 'https://daringfireball.net/feeds/main',
        category: '/type/people,/topic/apple',
      },
      {
        title: 'daverupert.com',
        xmlUrl: 'https://daverupert.com/atom.xml',
        category: '/type/people,/topic/webdev',
      },
      {
        title: 'David Noel Ng',
        xmlUrl: 'https://dnhkng.github.io/feed.xml',
        category: '/type/people',
      },
      {
        title: 'Deven Jadhav',
        xmlUrl: 'https://notes.deven.dev/posts_feed',
        category: '/type/people,/topic/engineering',
      },
      {
        title: 'Dries Buytaert',
        xmlUrl: 'https://dri.es/rss.xml',
        category: '/type/people,/topic/oss',
      },
      {
        title: 'Geoffrey Huntley',
        xmlUrl: 'https://ghuntley.com/rss/',
        category: '/type/people,/topic/engineering',
      },
      {
        title: 'So long and thanks for all the fish.',
        xmlUrl: 'https://jordankasper.com/rss',
        category: '/type/people',
      },
      {
        title: 'Theo - t3․gg',
        xmlUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCbRP3c757lWg9M-U7TyEkXA',
        category: '/source/video,/type/people,/topic/webdev',
      },
    ],
  },
  {
    name: 'News & Politics',
    feeds: [
      {
        title: '404 Media',
        xmlUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC7YMZb0X_W06ToOazhFuXIQ',
        category: '/source/video,/type/journalism,/type/investigative',
      },
      {
        title: 'English - VICE',
        xmlUrl: 'https://www.vice.com/en/feed/?locale=en_us',
        category: '/topic/culture',
      },
      {
        title: 'MegaLag',
        xmlUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCwhB8cJTSLxyubnKSS-PLJg',
        category: '/source/video,/type/journalism,/type/investigative',
      },
      {
        title: 'ProPublica',
        xmlUrl: 'https://www.propublica.org/feeds/propublica/main',
        category: '/type/journalism,/type/investigative',
      },
      {
        title: 'The Ezra Klein Show',
        xmlUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCnxuOd8obvLLtf5_-YKFbiQ',
        category: '/source/video,/source/podcast,/topic/politics,/type/analysis',
      },
      {
        title: 'TheHill.com Just In',
        xmlUrl: 'https://thehill.com/homenews/feed/',
        category: '/topic/politics',
      },
      { title: 'Top stories - Google News', xmlUrl: 'https://news.google.com/rss' },
      {
        title: 'Vox',
        xmlUrl: 'https://vox.com/rss/index.xml',
        category: '/topic/politics,/type/analysis',
      },
      {
        title: 'Vox',
        xmlUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCLXo7UDZvByw2ixzpQCufnA',
        category: '/source/video,/topic/politics',
      },
    ],
  },
  {
    name: 'Local NC',
    feeds: [
      {
        title: 'NCGA Joint Legislative Oversight Committee on Information Technology Documents',
        xmlUrl: 'https://www.ncleg.gov/Documents/RSS/4/',
        category: '/topic/government',
      },
      {
        title: 'Newport/Morehead City, NC',
        xmlUrl: 'https://www.weather.gov/rss_page.php?site_name=mhx',
        category: '/topic/weather',
      },
      {
        title: 'Press Releases',
        xmlUrl: 'https://www.dpi.nc.gov/news/feed',
        category: '/topic/government,/topic/education',
      },
    ],
  },
  {
    name: 'Sysadmin & IT',
    feeds: [
      {
        title: 'ashes to ashes, rust to rust',
        xmlUrl: 'https://old.reddit.com/r/iiiiiiitttttttttttt/.rss',
        category: '/source/reddit,/type/community,/topic/humor',
      },
      {
        title: 'K-12 Systems Administrators',
        xmlUrl: 'https://old.reddit.com/r/k12sysadmin/.rss',
        category: '/source/reddit,/type/community,/topic/education',
      },
      {
        title: 'Sysadmin',
        xmlUrl: 'https://old.reddit.com/r/sysadmin/.rss',
        category: '/source/reddit,/type/community',
      },
    ],
  },
  {
    name: 'Science & Education',
    feeds: [
      {
        title: 'Kurzgesagt – In a Nutshell',
        xmlUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCsXVk37bltHxD1rDPwtNM8Q',
        category: '/source/video,/topic/education',
      },
      {
        title: 'TED',
        xmlUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCAuUUnT6oDeKwE6v1NGQxug',
        category: '/source/video,/topic/education,/topic/culture',
      },
    ],
  },
  {
    name: 'Humor & Meta',
    feeds: [
      {
        title: 'DepthHub: A jumping-off point for deeply-involved subreddits',
        xmlUrl: 'https://old.reddit.com/r/DepthHub/.rss',
        category: '/source/reddit,/type/community',
      },
      {
        title: 'People Who Ate The Onion',
        xmlUrl: 'https://old.reddit.com/r/AteTheOnion/.rss',
        category: '/source/reddit,/type/community,/topic/humor',
      },
    ],
  },
  {
    name: 'Deep Dive',
    feeds: [
      {
        title: 'Benn Jordan',
        xmlUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCshObcm-nLhbu8MY50EZ5Ng',
        category: '/source/video,/type/essay,/topic/music,/topic/privacy',
      },
      {
        title: 'CHUPPL',
        xmlUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCizJl3TxBunh-LzpwyPYg0w',
        category: '/source/video,/type/essay,/type/journalism,/type/investigative',
      },
      {
        title: 'fern',
        xmlUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCODHrzPMGbNv67e84WDZhQQ',
        category: '/source/video,/type/essay,/type/journalism,/type/investigative',
      },
      {
        title: 'Lauran Irion',
        xmlUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC2S4560XyLjhrj1P0e7s6zA',
        category: '/source/video,/type/essay,/topic/culture',
      },
    ],
  },
];

export const PODCAST_SOURCE_COUNT = 78;
