// Everyday English for the word sprints. Shuffled when a run starts.
const LIST = `
a about above act add after again against age ago air all almost
along already also always am among an and animal another answer any
appear are area around as ask at away back base be beauty because
been before began behind best better between big bird black blue
boat body book both box boy bring brought build busy but by call
came can car care carry cause center change check child children
city class clear close color come common complete contain corner
correct could country course cover cross cut dark day decide deep
develop did different do does dog done door down dozen draw drive
dry during each early earth east easy eat edge eight end enjoy
enough even ever every example expect explain extra eye face fact
fall family far fast father feel feet few field figure fill final
find fire first fish five floor follow food foot for force form
found four free friend from front full game garden gave get girl
give go gold good great green ground group grow half hand happen
hard has have he head hear heard heat help her here high hill him
his hold home horse hot hour house how however hundred idea if
important in inch interest into is island it job join jump just
keep kind king knew know land language large last late laugh lay
learn leave left less let letter life light like line list listen
little live long look lot love low machine made main make man many
mark may me mean measure men might mile mind minute miss money
month moon more morning most mother mountain move much music must
my name near need never new next night no north not note nothing
now number of off often old on once one only open or order other
our out over own page paper part pass pattern people person picture
piece place plain plan plane plant play point possible pound power
problem produce put quality question quick quite rain ran reach
read ready real record red remember rest rich right river road rock
room round run said same saw say school sea second see seem self
sentence serve set seven several shape she ship short should show
side simple since sing six size sleep small snow so some something
song soon sound south space special stand star start stay step
still stood stop story street strong study such sun sure table tail
take talk teach tell ten test text than that the their them then
there these they thing think this those though thought three
through time to today told too took top toward town travel tree
true try turn two under until up us use usual very voice wait walk
want war warm was watch water way we week weight well went were
west what wheel when where which while white who whole why will
wind window winter with wonder wood word work world would write
year yes yet you young your zone
`;

export const words: readonly string[] = LIST.trim().split(/\s+/);

export function makeWords(count: number, random: () => number = Math.random): string {
  const out: string[] = [];
  let previous = -1;
  for (let i = 0; i < count; i++) {
    let index = Math.floor(random() * words.length) % words.length;
    if (index === previous) index = (index + 1) % words.length;
    previous = index;
    out.push(words[index]);
  }
  return out.join(" ");
}
