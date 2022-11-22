// Use this sample to create your own voice commands
intent("What does this app do?", "What can I do here?", (p) => {
  p.play("This is a new project");
});

const API_KEY = "YOUR_KEY";
let savedArticles = [];

// News by Source
intent("(give |show |tell) me the latest news", (p) => {
  let NEWS_API_URL = `https://newsapi.org/v2/top-headlines?apiKey=${API_KEY}&country=in`;
  if (p) {
    NEWS_API_URL = `${NEWS_API_URL}`;
  }
  api.request(
    NEWS_API_URL,
    { headers: { "user-agent": "user agent" } },
    (error, response, body) => {
      const { articles } = JSON.parse(body);
      savedArticles = articles;
      p.play({ command: "newHeadlines", articles });
      p.play(`Here are the (latest|recent) articles `);
      p.play("Would you like me to read the headlines?");
      p.then(confirmation);
    }
  );
});

// News by Term
intent("What's up with $(term* (.*))", (p) => {
  let NEWS_API_URL = `https://newsapi.org/v2/everything`;

  if (p.term.value) {
    p.term.value = p.term.value.toLowerCase().split(" ").join("-");
    NEWS_API_URL = `${NEWS_API_URL}?q=${p.term.value}&apiKey=${API_KEY}`;
  }

  api.request(
    NEWS_API_URL,
    { headers: { "user-agent": "user agent" } },
    (error, response, body) => {
      const { articles } = JSON.parse(body);

      savedArticles = articles;

      p.play({ command: "newHeadlines", articles });
      p.play(`Here are the (latest|recent) articles `);

      p.play("Would you like me to read the headlines?");
      p.then(confirmation);
    }
  );
});

// News by Categories
const CATEGORIES = [
  "business",
  "entertainment",
  "general",
  "health",
  "science",
  "sports",
  "technology",
];
const CATEGORIES_INTENT = `${CATEGORIES.map(
  (category) => `${category}~${category}`
).join("|")}`;
intent(
  `(show|what is|tell me|what's|what are|what're|read) (the|) (recent|latest|) $(N news|headlines) (in|about|on|) $(C~ ${CATEGORIES_INTENT})`,
  `(read|show|get|bring me|give me) (the|) (recent|latest) $(C~ ${CATEGORIES_INTENT}) $(N news|headlines)`,
  (p) => {
    let NEWS_API_URL = `https://newsapi.org/v2/top-headlines?apiKey=${API_KEY}&country=in`;

    if (p.C.value) {
      NEWS_API_URL = `${NEWS_API_URL}&category=${p.C.value}`;
    }
    api.request(
      NEWS_API_URL,
      { headers: { "user-agent": "user agent" } },
      (error, response, body) => {
        const { totalResults, articles } = JSON.parse(body);

        if (!articles.length) {
          p.play("Sorry, please try searching for a different category.");
          return;
        }

        savedArticles = articles;

        p.play({ command: "newHeadlines", articles });

        if (p.C.value) {
          p.play(`Here are the (latest|recent) articles on ${p.C.value}.`);
        } else {
          p.play(`Here are the (latest|recent) news.`);
        }
        p.play("Would you like me to read the headlines?");
        p.then(confirmation);
      }
    );
  }
);

const confirmation = context(() => {
  intent("yes", async (p) => {
    for (let i = 0; i < savedArticles.length; i++) {
      p.play({ command: "highlight", article: savedArticles[i] });
      p.play(`${savedArticles[i].title}`);
    }
  });

  intent("no", (p) => {
    p.play("Sure, sounds good to me.");
  });
});

intent("open (the|) (article|) (number|) $(number* (.*))", (p) => {
  if (p.number.value) {
    p.play({
      command: "open",
      number: p.number.value,
      articles: savedArticles,
    });
  }
});

intent("(go|) back", (p) => {
  p.play("Sure, going back");
  p.play({ command: "newHeadlines", articles: [] });
});
