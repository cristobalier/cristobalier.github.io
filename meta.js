/* Dexter · tipos, categorías, altura y peso (window.DATA.META)
   Cargar DESPUÉS de disponibilidad.js y ANTES del script principal.
   La primera vez descarga los datos de PokéAPI (una sola consulta), los guarda en el navegador
   y recarga la página. Después los lee del caché.
   META[nombre] = [altura en dm, peso en hg, [tipos], [categorías]] */
(function (D) {
  const CK = "dexter.meta.v1";
  try {
    const c = JSON.parse(localStorage.getItem(CK));
    if (c && Object.keys(c).length) {
      D.META = c;
      return;
    }
  } catch (e) {}
  D.META = {};
  const TY = {
    normal: "Normal",
    fire: "Fuego",
    water: "Agua",
    grass: "Planta",
    electric: "Eléctrico",
    ice: "Hielo",
    fighting: "Lucha",
    poison: "Veneno",
    ground: "Tierra",
    flying: "Volador",
    psychic: "Psíquico",
    bug: "Bicho",
    rock: "Roca",
    ghost: "Fantasma",
    dragon: "Dragón",
    dark: "Siniestro",
    steel: "Acero",
    fairy: "Hada",
  };
  const slug = (n) =>
    n
      .toLowerCase()
      .replace("♀", "-f")
      .replace("♂", "-m")
      .replace("type: null", "type-null")
      .replace(/[’'.:]/g, "")
      .replace(/é/g, "e")
      .replace(/\s+/g, "-");
  const ULTRA = new Set([
    "Nihilego",
    "Buzzwole",
    "Pheromosa",
    "Xurkitree",
    "Celesteela",
    "Kartana",
    "Guzzlord",
    "Poipole",
    "Naganadel",
    "Stakataka",
    "Blacephalon",
  ]);
  const PARA = new Set([
    "Great Tusk",
    "Scream Tail",
    "Brute Bonnet",
    "Flutter Mane",
    "Slither Wing",
    "Sandy Shocks",
    "Iron Treads",
    "Iron Bundle",
    "Iron Hands",
    "Iron Jugulis",
    "Iron Moth",
    "Iron Thorns",
    "Roaring Moon",
    "Iron Valiant",
    "Walking Wake",
    "Iron Leaves",
    "Gouging Fire",
    "Raging Bolt",
    "Iron Boulder",
    "Iron Crown",
  ]);
  /* Especies con Megaevolución (incluye las de Leyendas: Z-A y Megadimensión; lista aproximada) */
  const MEGA = new Set([
    "Venusaur",
    "Charizard",
    "Blastoise",
    "Beedrill",
    "Pidgeot",
    "Alakazam",
    "Slowbro",
    "Gengar",
    "Kangaskhan",
    "Pinsir",
    "Gyarados",
    "Aerodactyl",
    "Mewtwo",
    "Ampharos",
    "Steelix",
    "Scizor",
    "Heracross",
    "Houndoom",
    "Tyranitar",
    "Sceptile",
    "Blaziken",
    "Swampert",
    "Gardevoir",
    "Sableye",
    "Mawile",
    "Aggron",
    "Medicham",
    "Manectric",
    "Sharpedo",
    "Camerupt",
    "Altaria",
    "Banette",
    "Absol",
    "Glalie",
    "Salamence",
    "Metagross",
    "Latias",
    "Latios",
    "Kyogre",
    "Groudon",
    "Rayquaza",
    "Lopunny",
    "Garchomp",
    "Lucario",
    "Abomasnow",
    "Gallade",
    "Audino",
    "Diancie",
    "Clefable",
    "Victreebel",
    "Starmie",
    "Dragonite",
    "Meganium",
    "Feraligatr",
    "Skarmory",
    "Froslass",
    "Emboar",
    "Excadrill",
    "Scolipede",
    "Scrafty",
    "Eelektross",
    "Chandelure",
    "Chesnaught",
    "Delphox",
    "Greninja",
    "Pyroar",
    "Floette",
    "Malamar",
    "Barbaracle",
    "Dragalge",
    "Hawlucha",
    "Zygarde",
    "Drampa",
    "Falinks",
    "Raichu",
    "Chimecho",
    "Staraptor",
    "Heatran",
    "Darkrai",
    "Golurk",
    "Meowstic",
    "Crabominable",
    "Golisopod",
    "Magearna",
    "Zeraora",
    "Scovillain",
    "Glimmora",
    "Tatsugiri",
    "Baxcalibur",
  ]);
  /* Iniciales: las 3 líneas al inicio de cada región (en Teselia, después de Victini) */
  const INI = new Set();
  D.REGIONS.forEach((r) => {
    if (r.name === "Hisui") return;
    const s = r.name.startsWith("Teselia") ? 1 : 0;
    r.pokemon.slice(s, s + 9).forEach((n) => INI.add(n));
  });
  /* Sufijo de sprite -> sufijo de PokéAPI para formas regionales */
  const RS = {
    alolan: "alola",
    galarian: "galar",
    "galarian-standard": "galar-standard",
    hisuian: "hisui",
    paldean: "paldea",
    "paldean-combat": "paldea-combat-breed",
    "paldean-blaze": "paldea-blaze-breed",
    "paldean-aqua": "paldea-aqua-breed",
  };
  const Q = `{ pokemon { name height weight is_default pokemon_species_id pokemontypes(order_by: {slot: asc}) { type { name } } }
    pokemonspecies { id name is_legendary is_mythical is_baby } }`;
  fetch("https://graphql.pokeapi.co/v1beta2", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: Q }),
  })
    .then((r) => r.json())
    .then(({ data }) => {
      const P = {},
        DEF = {},
        SP = {},
        M = {};
      data.pokemon.forEach((p) => {
        const v = {
          h: p.height,
          w: p.weight,
          t: p.pokemontypes.map((x) => TY[x.type.name]).filter(Boolean),
        };
        P[p.name] = v;
        if (p.is_default) DEF[p.pokemon_species_id] = v;
      });
      data.pokemonspecies.forEach((s) => (SP[s.name] = s));
      const put = (k, p, c) => {
        if (p) M[k] = [p.h, p.w, p.t, c];
      };
      D.REGIONS.forEach((r) =>
        r.pokemon.forEach((n) => {
          const s = SP[slug(n)];
          if (!s) return;
          const c = [];
          if (INI.has(n)) c.push("ini");
          if (s.is_legendary) c.push("leg");
          if (s.is_mythical) c.push("sing");
          if (MEGA.has(n)) c.push("mega");
          if (s.is_baby) c.push("bebe");
          if (ULTRA.has(n)) c.push("ultra");
          if (PARA.has(n)) c.push("para");
          put(n, DEF[s.id], c);
          /* Formas con tipos propios (Rotom, Oricorio…); si PokéAPI no la tiene, usa la de la especie */
          const v = D.VARIANTS[n];
          if (v)
            v[1].forEach(([lab, suf]) =>
              put(n + " (" + lab + ")", P[slug(n) + "-" + suf], []),
            );
        }),
      );
      D.REGIONAL.forEach(([b, , lab, suf]) =>
        put(b + " " + lab, P[slug(b) + "-" + (RS[suf] || suf)], []),
      );
      if (Object.keys(M).length < 900) throw new Error("META incompleto");
      localStorage.setItem(CK, JSON.stringify(M));
      location.reload();
    })
    .catch((e) => console.warn("Dexter: no se pudo cargar META", e));
})(window.DATA);
