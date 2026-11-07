
const creerAgent = (nom, ancienneEquipe, statut = "UFA") => ({
  id: "fa-" + nom
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-"),

  nom,
  position: "À déterminer",
  age: "—",
  ovr: "—",
  potentiel: "—",
  offre: 0.8,
  ancienSalaire: 0,
  ancienneEquipe,
  statut,
  photo: ""
});

export const AGENTS_LIBRES_DEPART = [

  // ANAHEIM DUCKS
  creerAgent("Petr Mrazek", "Anaheim"),
  creerAgent("Jan Mysak", "Anaheim"),

  // BUFFALO SABRES
  creerAgent("Gavin Bayreuther", "Buffalo"),
  creerAgent("Tanner Pearson", "Buffalo"),
  creerAgent("Olivier Nadeau", "Buffalo"),

  // CALGARY FLAMES
  creerAgent("Jake Bean", "Calgary"),
  creerAgent("Nick Cicek", "Calgary"),
  creerAgent("Parker Bell", "Calgary"),
  creerAgent("Carter King", "Calgary"),

  // CAROLINA HURRICANES
  creerAgent("Justin Robidas", "Carolina", "RFA"),
  creerAgent("Kyle Masters", "Carolina"),

  // CHICAGO BLACKHAWKS
  creerAgent("Joey Anderson", "Chicago"),
  creerAgent("Matt Grzelcyk", "Chicago"),

  // COLUMBUS BLUE JACKETS
  creerAgent("Hudson Fasching", "Columbus"),
  creerAgent("Brendan Smith", "Columbus"),

  // DALLAS STARS
  creerAgent("Adam Erne", "Dallas"),
  creerAgent("Kole Lind", "Dallas"),
  creerAgent("Kyle McDonald", "Dallas"),
  creerAgent("Jeremie Poirier", "Dallas"),
  creerAgent("Antonio Stranges", "Dallas"),

  // DETROIT RED WINGS
  creerAgent("Simon Edvinsson", "Detroit", "RFA"),
  creerAgent("Travis Hamonic", "Detroit"),
  creerAgent("David Perron", "Detroit"),
  creerAgent("James van Riemsdyk", "Detroit"),
  creerAgent("Austin Watson", "Detroit"),

  // EDMONTON OILERS
  creerAgent("Adam Henrique", "Edmonton"),
  creerAgent("Curtis Lazar", "Edmonton"),

  // FLORIDA PANTHERS
  creerAgent("Aleksi Heponiemi", "Florida"),
  creerAgent("Logan Hutsko", "Florida"),
  creerAgent("Luke Kunin", "Florida"),

  // LOS ANGELES KINGS
  creerAgent("Logan Brown", "Los Angeles"),

  // MINNESOTA WILD
  creerAgent("Robby Fabbri", "Minnesota"),
  creerAgent("Ben Gleason", "Minnesota"),
  creerAgent("Jeff Petry", "Minnesota"),
  creerAgent("Vladimir Tarasenko", "Minnesota"),

  // MONTREAL CANADIENS
  creerAgent("Patrik Laine", "Montreal"),

  // NASHVILLE PREDATORS
  creerAgent("Kevin Gravel", "Nashville"),
  creerAgent("Dalton Bancroft", "Nashville"),
  creerAgent("Ryder Rolston", "Nashville"),
  creerAgent("Christoffer Sedoff", "Nashville"),

  // NEW JERSEY DEVILS
  creerAgent("Evgenii Dadonov", "New Jersey"),
  creerAgent("Jonathan Gruden", "New Jersey"),
  creerAgent("Tyler Brennan", "New Jersey"),

  // NEW YORK ISLANDERS
  creerAgent("Adam Boqvist", "New York Islanders"),
  creerAgent("Tristan Lennox", "New York Islanders"),

  // NEW YORK RANGERS
  creerAgent("Talyn Boyko", "New York Rangers"),

  // OTTAWA SENATORS
  creerAgent("James Reimer", "Ottawa"),
  creerAgent("Arthur Kaliyev", "Ottawa"),

  // PHILADELPHIA FLYERS
  creerAgent("Oscar Eklind", "Philadelphia"),
  creerAgent("Artem Guryev", "Philadelphia"),
  creerAgent("Brett Harrison", "Philadelphia"),

  // SAN JOSE SHARKS
  creerAgent("Sasha Chmelevski", "San Jose"),
  creerAgent("Samuel Laberge", "San Jose"),
  creerAgent("Nick Leddy", "San Jose"),
  creerAgent("Shane Bowers", "San Jose"),
  creerAgent("Pavol Regenda", "San Jose"),
  creerAgent("Philipp Kurashev", "San Jose"),

  // SEATTLE KRAKEN
  creerAgent("Matt Murray", "Seattle"),

  // ST. LOUIS BLUES
  creerAgent("Vadim Zherenko", "St. Louis"),
  creerAgent("Thomas Bordeleau", "St. Louis"),

  // TAMPA BAY LIGHTNING
  creerAgent("Waltteri Merela", "Tampa Bay"),

  // TORONTO MAPLE LEAFS
  creerAgent("Matt Benning", "Toronto"),
  creerAgent("Travis Boyd", "Toronto"),
  creerAgent("Vyacheslav Peksa", "Toronto"),

  // UTAH MAMMOTH
  creerAgent("Kevin Connauton", "Utah"),
  creerAgent("Michal Kunc", "Utah"),
  creerAgent("Anson Thornton", "Utah"),

  // VANCOUVER CANUCKS
  creerAgent("Derek Forbort", "Vancouver"),
  creerAgent("Evander Kane", "Vancouver"),
  creerAgent("Joseph LaBate", "Vancouver"),
  creerAgent("Jayden Grubbe", "Vancouver"),

  // VEGAS GOLDEN KNIGHTS
  creerAgent("Ben Hutton", "Vegas"),
  creerAgent("Brandon Saad", "Vegas"),
  creerAgent("Reilly Smith", "Vegas"),

  // WASHINGTON CAPITALS
  creerAgent("Tobias Geisser", "Washington"),
  creerAgent("Ryan Hofer", "Washington"),

  // WINNIPEG JETS
  creerAgent("Gustav Nyquist", "Winnipeg"),

  // AUTRES RFA
  creerAgent("Vyacheslav Buteyets", "Anaheim", "RFA")
];
