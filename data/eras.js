// Criminal Minds Across the Eras — chart data. Seasons 1–15 = CBS run, 16–19 = Criminal Minds: Evolution.
// Each entry: [label, startSeason, endSeason, bg, fg?]
const NAVY="#1f3a5f", BLUE="#8fb3e0", LBLUE="#cfe0f5", RED="#c62828", DRED="#7f0000", ORANGE="#f2994a",
      GOLD="#f2c94c", GREEN="#4f8a3f", LGREEN="#a8d08d", PURPLE="#6a3d9a", LPURP="#c9b3e6", GRAY="#7f7f7f",
      DGRAY="#333", WHITE="#fff", BLACK="#000", TEAL="#2a9d8f", PINK="#f4a6b0", BROWN="#8b5a2b";

window.ERA_CATS = [
  ["showrunners","Showrunner"],
  ["network","Network & format"],
  ["roster","BAU roster"],
  ["arcs","Major arcs"],
  ["villains","Serial-arc UnSubs (big bads)"],
  ["recurring","Recurring characters"],
];

window.ERAS = {
  showrunners: [
    ["Jeff Davis (creator)", 1, 1, GOLD, BLACK],
    ["Ed Bernero", 2, 6, ORANGE, BLACK],
    ["Erica Messer", 7, 15, BLUE, BLACK],
    ["Erica Messer — Evolution", 16, 19, RED, WHITE],
  ],
  network: [
    [["CBS — the original run", 1, 15, NAVY, WHITE], ["Paramount+ — Criminal Minds: Evolution", 16, 19, RED, WHITE]],
    [["22–26 episode seasons", 1, 13, LBLUE, BLACK], ["15 eps", 14, 14, GRAY, WHITE], ["10-episode seasons, serialized", 15, 19, DGRAY, WHITE]],
  ],
  roster: [
    [["Hotch — Unit Chief (leaves 12x06)", 1, 12, NAVY, WHITE], ["Prentiss — Unit Chief", 13, 19, PURPLE, WHITE]],
    [["Gideon (leaves 3x02)", 1, 2, GOLD, BLACK], ["Rossi (from 3x06)", 3, 19, BROWN, WHITE]],
    [["Reid", 1, 15, TEAL, WHITE]],
    [["Morgan", 1, 11, GREEN, WHITE], ["Alvez", 12, 19, LGREEN, BLACK]],
    [["Garcia", 1, 19, PINK, BLACK]],
    [["JJ", 1, 5, BLUE, BLACK], ["Seaver", 6, 6, LPURP, BLACK], ["JJ", 7, 19, BLUE, BLACK]],
    [["Elle (leaves 2x06)", 1, 1, ORANGE, BLACK], ["Prentiss (from 2x09)", 2, 7, PURPLE, WHITE], ["Blake", 8, 9, LBLUE, BLACK], ["Callahan", 10, 10, LPURP, BLACK], ["Prentiss", 11, 11, PURPLE, WHITE], ["Walker", 12, 12, GRAY, WHITE], ["Simmons", 13, 15, GREEN, WHITE], ["Tyler Green", 16, 19, DGRAY, WHITE]],
    [["Tara Lewis", 11, 19, TEAL, WHITE]],
    [["Section Chief Strauss", 2, 8, WHITE, BLACK], ["Cruz", 9, 10, LBLUE, BLACK], ["Barnes", 13, 14, WHITE, BLACK], ["Dep. Dir. Bailey", 16, 16, WHITE, BLACK]],
  ],
  arcs: [
    [["The Fisher King", 1, 2, GOLD, BLACK], ["Hotch vs. The Reaper", 4, 5, DRED, WHITE], ["Prentiss vs. Ian Doyle", 6, 7, PURPLE, WHITE], ["The Replicator", 8, 8, BLACK, WHITE], ["Mr. Scratch", 10, 13, DGRAY, WHITE], ["The Chameleon", 14, 15, GREEN, WHITE], ["Sicarius / Elias Voit", 16, 18, RED, WHITE]],
    [["Elle shot & leaves", 1, 1, ORANGE, BLACK], ["Frank & Gideon's exit", 2, 3, GOLD, BLACK], ["Reid & Maeve", 8, 8, PINK, BLACK], ["Morgan abducted; leaves", 11, 11, GREEN, WHITE], ["Reid framed & imprisoned", 12, 12, TEAL, WHITE], ["The Believers cult", 13, 13, LGREEN, BLACK], ["Gold Star", 17, 17, GOLD, BLACK], ["Voit's endgame", 18, 18, RED, WHITE]],
    [["Reid's Dilaudid addiction", 2, 3, TEAL, WHITE], ["Prentiss 'dies' & returns", 6, 7, LPURP, BLACK], ["Cat Adams", 11, 15, DRED, WHITE], ["Rossi's PTSD", 17, 17, BROWN, WHITE]],
  ],
  villains: [
    [["The Fisher King (Randall Garner)", 1, 2, GOLD, BLACK], ["George Foyet — The Reaper", 4, 5, DRED, WHITE], ["Ian Doyle", 6, 7, PURPLE, WHITE], ["John Curtis — The Replicator", 8, 8, BLACK, WHITE], ["Peter Lewis — Mr. Scratch", 10, 13, DGRAY, WHITE], ["Everett Lynch — The Chameleon", 14, 15, GREEN, WHITE], ["Elias Voit — Sicarius", 16, 18, RED, WHITE]],
    [["Karl Arnold — The Fox", 1, 1, ORANGE, BLACK], ["Frank Breitkopf", 2, 3, GOLD, BLACK], ["Karl Arnold returns", 5, 5, ORANGE, BLACK], ["Billy Flynn — Prince of Darkness", 6, 6, BLACK, WHITE], ["Diane Turner (Maeve's stalker)", 8, 8, PINK, BLACK], ["Cat Adams", 11, 15, DRED, WHITE], ["Damien Booth — Gold Star", 17, 17, GOLD, BLACK]],
    [["Tobias Hankel", 2, 2, TEAL, WHITE], ["Lindsey Vaughn", 12, 12, PINK, BLACK], ["Benjamin Merva — The Believers", 13, 13, LGREEN, BLACK]],
  ],
  recurring: [
    [["Haley Hotchner", 1, 5, LBLUE, BLACK], ["Beth Clemmons", 7, 9, LBLUE, BLACK], ["Krystall Rossi", 13, 15, BROWN, WHITE], ["Rebecca Wilson (DOJ)", 16, 17, GRAY, WHITE]],
    [["Jack Hotchner", 1, 12, NAVY, WHITE], ["Sydney & Holly Voit", 16, 18, RED, WHITE]],
    [["Diana Reid", 1, 15, TEAL, WHITE]],
    [["Will LaMontagne & Henry", 3, 19, BLUE, BLACK]],
    [["Kevin Lynch", 3, 8, PINK, BLACK], ["Savannah Hayes", 9, 11, GREEN, WHITE], ["Vincent Orlov / Voit's contacts", 17, 18, GRAY, WHITE]],
  ],
};
window.SEASON_META = {
  1:{years:"2005–06",showrunner:"Davis"},2:{years:"2006–07",showrunner:"Bernero"},3:{years:"2007–08",showrunner:"Bernero"},
  4:{years:"2008–09",showrunner:"Bernero"},5:{years:"2009–10",showrunner:"Bernero"},6:{years:"2010–11",showrunner:"Bernero"},
  7:{years:"2011–12",showrunner:"Messer"},8:{years:"2012–13",showrunner:"Messer"},9:{years:"2013–14",showrunner:"Messer"},
  10:{years:"2014–15",showrunner:"Messer"},11:{years:"2015–16",showrunner:"Messer"},12:{years:"2016–17",showrunner:"Messer"},
  13:{years:"2017–18",showrunner:"Messer"},14:{years:"2018–19",showrunner:"Messer"},15:{years:"2020",showrunner:"Messer"},
  16:{years:"2022–23 · Evolution",showrunner:"Messer"},17:{years:"2024 · Evolution",showrunner:"Messer"},18:{years:"2025 · Evolution",showrunner:"Messer"},19:{years:"2026 · Evolution",showrunner:"Messer"},
};
