// Public-domain lines. Author and work are shown under the passage.
export type Quote = {
  text: string;
  author: string;
  work: string;
};

export const quotes: readonly Quote[] = [
  {
    text: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
    author: "Jane Austen",
    work: "Pride and Prejudice",
  },
  {
    text: "I declare after all there is no enjoyment like reading! How much sooner one tires of any thing than of a book!",
    author: "Jane Austen",
    work: "Pride and Prejudice",
  },
  {
    text: "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness.",
    author: "Charles Dickens",
    work: "A Tale of Two Cities",
  },
  {
    text: "Whether I shall turn out to be the hero of my own life, or whether that station will be held by anybody else, these pages must show.",
    author: "Charles Dickens",
    work: "David Copperfield",
  },
  {
    text: "It is a far, far better thing that I do, than I have ever done; it is a far, far better rest that I go to than I have ever known.",
    author: "Charles Dickens",
    work: "A Tale of Two Cities",
  },
  {
    text: "It is not down on any map; true places never are.",
    author: "Herman Melville",
    work: "Moby-Dick",
  },
  {
    text: "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles, and by opposing end them.",
    author: "William Shakespeare",
    work: "Hamlet",
  },
  {
    text: "This above all: to thine own self be true, and it must follow, as the night the day, thou canst not then be false to any man.",
    author: "William Shakespeare",
    work: "Hamlet",
  },
  {
    text: "Shall I compare thee to a summer's day? Thou art more lovely and more temperate: Rough winds do shake the darling buds of May, and summer's lease hath all too short a date.",
    author: "William Shakespeare",
    work: "Sonnet 18",
  },
  {
    text: "The only way to get rid of a temptation is to yield to it.",
    author: "Oscar Wilde",
    work: "The Picture of Dorian Gray",
  },
  {
    text: "We are all in the gutter, but some of us are looking at the stars.",
    author: "Oscar Wilde",
    work: "Lady Windermere's Fan",
  },
  {
    text: "The truth is rarely pure and never simple.",
    author: "Oscar Wilde",
    work: "The Importance of Being Earnest",
  },
  {
    text: "You don't know about me without you have read a book by the name of The Adventures of Tom Sawyer; but that ain't no matter.",
    author: "Mark Twain",
    work: "Adventures of Huckleberry Finn",
  },
  {
    text: "The mass of men lead lives of quiet desperation.",
    author: "Henry David Thoreau",
    work: "Walden",
  },
  {
    text: "I went to the woods because I wished to live deliberately, to front only the essential facts of life, and see if I could not learn what it had to teach, and not, when I came to die, discover that I had not lived.",
    author: "Henry David Thoreau",
    work: "Walden",
  },
  {
    text: "Trust thyself: every heart vibrates to that iron string.",
    author: "Ralph Waldo Emerson",
    work: "Self-Reliance",
  },
  {
    text: "I am no bird; and no net ensnares me; I am a free human being with an independent will, which I now exert to leave you.",
    author: "Charlotte Brontë",
    work: "Jane Eyre",
  },
  {
    text: "Whatever our souls are made of, his and mine are the same.",
    author: "Emily Brontë",
    work: "Wuthering Heights",
  },
  {
    text: "Beware; for I am fearless, and therefore powerful.",
    author: "Mary Shelley",
    work: "Frankenstein",
  },
  {
    text: "How often have I said to you that when you have eliminated the impossible, whatever remains, however improbable, must be the truth?",
    author: "Arthur Conan Doyle",
    work: "The Sign of the Four",
  },
  {
    text: "Begin at the beginning, and go on till you come to the end: then stop.",
    author: "Lewis Carroll",
    work: "Alice's Adventures in Wonderland",
  },
  {
    text: "Once upon a midnight dreary, while I pondered, weak and weary, over many a quaint and curious volume of forgotten lore.",
    author: "Edgar Allan Poe",
    work: "The Raven",
  },
  {
    text: "If we had a keen vision and feeling of all ordinary human life, it would be like hearing the grass grow and the squirrel's heart beat, and we should die of that roar which lies on the other side of silence.",
    author: "George Eliot",
    work: "Middlemarch",
  },
  {
    text: "You have seen how a man was made a slave; you shall see how a slave was made a man.",
    author: "Frederick Douglass",
    work: "Narrative of the Life of Frederick Douglass",
  },
  {
    text: "I celebrate myself, and sing myself, and what I assume you shall assume, for every atom belonging to me as good belongs to you.",
    author: "Walt Whitman",
    work: "Song of Myself",
  },
  {
    text: "With every day, and from both sides of my intelligence, the moral and the intellectual, I thus drew steadily nearer to that truth, by whose partial discovery I have been doomed to such a dreadful shipwreck: that man is not truly one, but truly two.",
    author: "Robert Louis Stevenson",
    work: "The Strange Case of Dr Jekyll and Mr Hyde",
  },
  {
    text: "Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal.",
    author: "Abraham Lincoln",
    work: "Gettysburg Address",
  },
];

let previous = -1;

export function pickQuote(random: () => number = Math.random): Quote {
  let index = Math.floor(random() * quotes.length) % quotes.length;
  if (index === previous) index = (index + 1) % quotes.length;
  previous = index;
  return quotes[index];
}
