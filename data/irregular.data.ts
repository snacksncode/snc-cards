const wordsData = [
  {
    question: "być",
    answer: "be | was, were | been",
  },
  {
    question: "stawać się",
    answer: "become | became | become",
  },
  {
    question: "zaczynać",
    answer: "begin | began | begun",
  },
  {
    question: "łamać",
    answer: "break | broke | broken",
  },
  {
    question: "przynosić",
    answer: "bring | brought | brought",
  },
  {
    question: "budować",
    answer: "build | built | built",
  },
  {
    question: "palić",
    answer: "burn | burnt | burnt",
  },
  {
    question: "kupić",
    answer: "buy | bought | bought",
  },
  {
    question: "łapać",
    answer: "catch | caught | caught",
  },
  {
    question: "wybierać",
    answer: "choose | chose | chosen",
  },
  {
    question: "przychodzić",
    answer: "come | came | come",
  },
  {
    question: "kosztować",
    answer: "cost | cost | cost",
  },
  {
    question: "ciąć",
    answer: "cut | cut | cut",
  },
  {
    question: "robić",
    answer: "do | did | done",
  },
  {
    question: "kopać",
    answer: "dig | dug | dug",
  },
  {
    question: "rysować",
    answer: "draw | drew | drawn",
  },
  {
    question: "pić",
    answer: "drink | drank | drunk",
  },
  {
    question: "marzyć, śnić",
    answer: "dream | dreamt | dreamt",
  },
  {
    question: "prowadzić (samochód)",
    answer: "drive | drove | driven",
  },
  {
    question: "jeść",
    answer: "eat | ate | eaten",
  },
  {
    question: "upadać",
    answer: "fall | fell | fallen",
  },
  {
    question: "karmić",
    answer: "feed | fed | fed",
  },
  {
    question: "czuć",
    answer: "feel | felt | felt",
  },
  {
    question: "walczyć",
    answer: "fight | fought | fought",
  },
  {
    question: "znaleźć",
    answer: "find | found | found",
  },
  {
    question: "latać",
    answer: "fly | flew | flown",
  },
  {
    question: "zapomnieć",
    answer: "forget | forgot | forgotten",
  },
  {
    question: "przebaczyć",
    answer: "forgive | forgave | forgiven",
  },
  {
    question: "dostawać",
    answer: "get | got | got",
  },
  {
    question: "dawać",
    answer: "give | gave | given",
  },
  {
    question: "iść",
    answer: "go | went | gone",
  },
  {
    question: "rosnąć",
    answer: "grow | grew | grown",
  },
  {
    question: "mieć",
    answer: "have | had | had",
  },
  {
    question: "slyszeć",
    answer: "hear | heard | heard",
  },
  {
    question: "zranić",
    answer: "hurt | hurt | hurt",
  },
  {
    question: "chować",
    answer: "hide | hid | hidden",
  },
  {
    question: "uderzać",
    answer: "hit | hit | hit",
  },
  {
    question: "trzymać (h...)",
    answer: "hold | held | held",
  },
  {
    question: "(za)trzymać (k...)",
    answer: "keep | kept | kept",
  },
  {
    question: "wiedzieć",
    answer: "know | knew | known",
  },
  {
    question: "tracić",
    answer: "lose | lost | lost",
  },
  {
    question: "leżeć (o sobie)",
    answer: "lie | lay | lain",
  },
  {
    question: "zapalać",
    answer: "light | lit | lit",
  },
  {
    question: "pozwalać",
    answer: "let | let | let",
  },
  {
    question: "pożyczać",
    answer: "lend | lent | lent",
  },
  {
    question: "opuszczać",
    answer: "leave | left | left",
  },
  {
    question: "uczyć się",
    answer: "learn | learnt | learnt",
  },
  {
    question: "prowadzić (nie drive)",
    answer: "lead | led | led",
  },
  {
    question: "spotykać",
    answer: "meet | met | met",
  },
  {
    question: "znaczyć",
    answer: "mean | meant | meant",
  },
  {
    question: "(z)robić (coś)",
    answer: "make | made | made",
  },
  {
    question: "kłaść",
    answer: "put | put | put",
  },
  {
    question: "płacić",
    answer: "pay | paid | paid",
  },
  {
    question: "biegać",
    answer: "run | ran | run",
  },
  {
    question: "dzwonić",
    answer: "ring | rang | rung",
  },
  {
    question: "jezdzić",
    answer: "ride | rode | ridden",
  },
  {
    question: "czytać",
    answer: "read | read | read",
  },
  {
    question: "plywać",
    answer: "swim | swam | swum",
  },
  {
    question: "kraść",
    answer: "steal | stole | stolen",
  },
  {
    question: "stać",
    answer: "stand | stood | stood",
  },
  {
    question: "rozlewać",
    answer: "spill | spilt | spilt",
  },
  {
    question: "wydawać",
    answer: "spend | spent | spent",
  },
  {
    question: "mówić (sp..)",
    answer: "speak | spoke | spoken",
  },
  {
    question: "wąchać",
    answer: "smell | smelt | smelt",
  },
  {
    question: "spać",
    answer: "sleep | slept | slept",
  },
  {
    question: "siedzieć",
    answer: "sit | sat | sat",
  },
  {
    question: "śpiewać",
    answer: "sing | sang | sung",
  },
  {
    question: "zamykać (not close)",
    answer: "shut | shut | shut",
  },
  {
    question: "pokazać",
    answer: "show | showed | shown",
  },
  {
    question: "świecić",
    answer: "shine | shone | shone",
  },
  {
    question: "ustawiać",
    answer: "set | set | set",
  },
  {
    question: "wysyłać",
    answer: "send | sent | sent",
  },
  {
    question: "sprzedawać",
    answer: "sell | sold | sold",
  },
  {
    question: "widzieć",
    answer: "see | saw | seen",
  },
  {
    question: "mówić (sa..)",
    answer: "say | said | said",
  },
  {
    question: "rzucać",
    answer: "throw | threw | thrown",
  },
  {
    question: "myśleć",
    answer: "think | thought | thought",
  },
  {
    question: "mówić / powiedzieć (t...)",
    answer: "tell | told | told",
  },
  {
    question: "drzeć (rozerwać)",
    answer: "tear | tore | torn",
  },
  {
    question: "uczyć",
    answer: "teach | taught | taught",
  },
  {
    question: "zabrać",
    answer: "take | took | taken",
  },
  {
    question: "pisać",
    answer: "write | wrote | written",
  },
  {
    question: "wygrywać",
    answer: "win | won | won",
  },
  {
    question: "nosić",
    answer: "wear | wore | worn",
  },
  {
    question: "budzić",
    answer: "wake | woke | woken",
  },
  {
    question: "rozumieć",
    answer: "understand | understood | understood",
  },
];

const exported: Data = {
  id: "irregular-words-english",
  data: wordsData,
  description: "Just some irregular verbs",
  title: "Irregular Verbs",
  class: "EN",
  tags: ["english", "irregular"],
};

export default exported;
