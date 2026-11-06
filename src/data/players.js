
const photo = (id) =>
  id
    ? `https://assets.nhle.com/mugs/nhl/20252026/MTL/${id}.png`
    : null;

export const players = [
  { nom: "Nick Suzuki", idNhl: 8480018, numero: 14, pos: "C", age: 27, ovr: 91, salaire: 7.875, equipe: "Canadiens de Montréal", photo: photo(8480018) },
  { nom: "Cole Caufield", idNhl: 8481540, numero: 13, pos: "AD", age: 25, ovr: 91, salaire: 7.85, equipe: "Canadiens de Montréal", photo: photo(8481540) },
  { nom: "Juraj Slafkovský", idNhl: 8483515, numero: 20, pos: "AG", age: 22, ovr: 87, salaire: 7.6, equipe: "Canadiens de Montréal", photo: photo(8483515) },
  { nom: "Lane Hutson", idNhl: 8483457, numero: 48, pos: "D", age: 22, ovr: 94, salaire: 8.85, equipe: "Canadiens de Montréal", photo: photo(8483457) },
  { nom: "Noah Dobson", idNhl: 8478445, numero: 53, pos: "D", age: 26, ovr: 89, salaire: 9.5, equipe: "Canadiens de Montréal", photo: photo(8480865) },
  { nom: "Kaiden Guhle", idNhl: 8482087, numero: 21, pos: "D", age: 24, ovr: 86, salaire: 5.55, equipe: "Canadiens de Montréal", photo: photo(8482087) },
  { nom: "Mike Matheson", idNhl: 8476875, numero: 8, pos: "D", age: 32, ovr: 85, salaire: 6.0, equipe: "Canadiens de Montréal", photo: photo(8476875) },
  { nom: "Alexandre Carrier", idNhl: 8478851, numero: 45, pos: "D", age: 30, ovr: 84, salaire: 3.75, equipe: "Canadiens de Montréal", photo: photo(8478851) },
  { nom: "Arber Xhekaj", idNhl: 8480813, numero: 72, pos: "D", age: 25, ovr: 82, salaire: 1.5, equipe: "Canadiens de Montréal", photo: photo(8480813) },
  { nom: "Adam Engström", idNhl: 8483686, numero: 42, pos: "D", age: 22, ovr: 79, salaire: 0.9, equipe: "Canadiens de Montréal", photo: photo(8483686) },
  { nom: "Patrik Laine", idNhl: 8477492, numero: 92, pos: "AD", age: 28, ovr: 84, salaire: 8.7, equipe: "Canadiens de Montréal", photo: photo(8477492) },
  { nom: "Kirby Dach", idNhl: 8481523, numero: 77, pos: "C", age: 25, ovr: 83, salaire: 3.6, equipe: "Canadiens de Montréal", photo: photo(8481523) },
  { nom: "Alex Newhook", idNhl: 8481618, numero: 15, pos: "C/AG", age: 25, ovr: 82, salaire: 2.9, equipe: "Canadiens de Montréal", photo: photo(8481618) },
  { nom: "Phillip Danault", idNhl: 8476479, numero: 24, pos: "C", age: 33, ovr: 84, salaire: 5.5, equipe: "Canadiens de Montréal", photo: photo(8476479) },
  { nom: "Josh Anderson", idNhl: 8476981, numero: 17, pos: "AD", age: 32, ovr: 82, salaire: 5.5, equipe: "Canadiens de Montréal", photo: photo(8476981) },
  { nom: "Jake Evans", idNhl: 8478133, numero: 71, pos: "C", age: 30, ovr: 82, salaire: 2.85, equipe: "Canadiens de Montréal", photo: photo(8478133) },
  { nom: "Zachary Bolduc", idNhl: 8482737, numero: 76, pos: "AG", age: 23, ovr: 83, salaire: 4.2, equipe: "Canadiens de Montréal", photo: photo(8482737) },
  { nom: "Ivan Demidov", idNhl: 8484786, numero: 93, pos: "AD", age: 20, ovr: 89, salaire: 0.941, equipe: "Canadiens de Montréal", photo: photo(8484786) },
  { nom: "Oliver Kapanen", idNhl: 8480865, numero: 91, pos: "C", age: 23, ovr: 81, salaire: 0.943, equipe: "Canadiens de Montréal", photo: photo(8480865) },
  { nom: "Alexandre Texier", idNhl: 8480074, numero: 85, pos: "AG", age: 27, ovr: 82, salaire: 2.5, equipe: "Canadiens de Montréal", photo: photo(8480074) },
  { nom: "Chris Kreider", idNhl: 8475184, numero: 22, pos: "AG", age: 35, ovr: 85, salaire: 2.15, equipe: "Canadiens de Montréal", photo: photo(8475184) },
  { nom: "Owen Beck", idNhl: 8483424, numero: 62, pos: "C", age: 22, ovr: 78, salaire: 0.79, equipe: "Canadiens de Montréal", photo: photo(8483424) },
  { nom: "Florian Xhekaj", idNhl: 8484403, numero: 63, pos: "AG", age: 22, ovr: 76, salaire: 0.943, equipe: "Canadiens de Montréal", photo: photo(8484403) },
  { nom: "Jakub Dobeš", idNhl: 8482487, numero: 75, pos: "G", age: 25, ovr: 84, salaire: 0.925, equipe: "Canadiens de Montréal", photo: photo(8482487) },
  { nom: "Jacob Fowler", idNhl: 8484170, numero: 32, pos: "G", age: 22, ovr: 87, salaire: 0.925, equipe: "Canadiens de Montréal", photo: photo(8484170) },
  { nom: "Samuel Montembeault", idNhl: 8476434, numero: 35, pos: "G", age: 30, ovr: 83, salaire: 3.15, equipe: "Canadiens de Montréal", photo: photo(8476434) }
];
