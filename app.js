/* Dexter · lógica de la app (React + htm, sin compilar)
   Cargar al final, después de los datos, de sync.js y de celebrar.js. */
const { useState, useEffect, useDeferredValue, useMemo, useRef } = React;
const html = htm.bind(React.createElement);
/* Reproduce una animación CSS sobre un elemento, aunque se toque varias veces seguidas */
const Animar = (el, clase = "pop") => {
  if (!el) return;
  el.classList.remove(clase);
  void el.offsetWidth;
  el.classList.add(clase);
  el.addEventListener("animationend", () => el.classList.remove(clase), {
    once: true,
  });
};
/* Estrellitas shiny alrededor del Pokémon, en dos tandas como al aparecer uno shiny en combate.
   Van sobre la página (no dentro de React) porque la imagen cambia a la versión shiny al marcarla. */
const STAR =
  '<svg viewBox="0 0 24 24"><path d="M12 0Q12 12 24 12Q12 12 12 24Q12 12 0 12Q12 12 12 0Z"/></svg>';
const Estrellas = (sp) => {
  if (!sp || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const s = sp.getBoundingClientRect(),
    cx = s.left + s.width / 2,
    cy = s.top + s.height / 2,
    r = s.width * 0.42;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.random() * 0.5,
      z = 10 + Math.random() * 10,
      el = document.createElement("span");
    el.className = "star";
    el.innerHTML = STAR;
    el.style.cssText =
      `left:${cx + Math.cos(a) * r}px;top:${cy + Math.sin(a) * r}px;width:${z}px;height:${z}px;` +
      `--dx:${Math.cos(a) * 14}px;--dy:${Math.sin(a) * 14}px;animation-delay:${(i % 2) * 0.3 + Math.random() * 0.08}s`;
    document.body.appendChild(el);
    el.addEventListener("animationend", () => el.remove(), { once: true });
  }
};
const { REGIONS, GAMES, AV, REGIONAL, VARIANTS } = window.DATA;
const GMAX = new Set(window.DATA.GMAX || []);
const KEY = "dexter.v1",
  PKEY = "dexter.prefs";
const META = window.DATA.META || {};
const M = (x) => META[x.k] || META[x.b];
const CATS = [
  ["ini", "Iniciales"],
  ["leg", "Legendarios"],
  ["sing", "Singulares"],
  ["mega", "Megaevoluciones"],
  ["bebe", "Bebés"],
  ["reg", "Regionales"],
  ["ultra", "Ultraentes"],
  ["para", "Paradojas"],
];
const TYPES = [
  "Normal",
  "Fuego",
  "Agua",
  "Planta",
  "Eléctrico",
  "Hielo",
  "Lucha",
  "Veneno",
  "Tierra",
  "Volador",
  "Psíquico",
  "Bicho",
  "Roca",
  "Fantasma",
  "Dragón",
  "Siniestro",
  "Acero",
  "Hada",
];
const passF = (x, fc, ft) => {
  const m = M(x);
  if (!m) return !fc && !ft.length;
  if (fc === "reg") {
    if (!/ de (Alola|Galar|Hisui|Paldea)/.test(x.k)) return false;
  } else if (fc && (x.f || !m[3].includes(fc))) return false;
  if (
    ft.length &&
    (ft.length === 1
      ? !m[2].includes(ft[0])
      : !(m[2].includes(ft[0]) && m[2].includes(ft[1])))
  )
    return false;
  return true;
};
const fmtM = (x) => {
  const m = M(x);
  return m
    ? (m[0] / 10).toFixed(1) + " m · " + (m[1] / 10).toFixed(1) + " kg"
    : "";
};
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch (e) {
    return {};
  }
};
/* Preferencias: vw = vista ('reg' Pokédex regionales, 'game' Pokédex del juego, 'esp' dex especiales), gm = juego que estás jugando,
   fm = qué mostrar ('' todos, 'all' solo los que faltan, 'shiny' los que faltan en shiny), ox = mostrar "Fuera de la Pokédex", sd = dex especial elegida */
const PDEF = {
  go: "new",
  po: "num",
  forms: true,
  vw: "reg",
  gm: "",
  fm: "",
  ox: false,
  sd: "mega",
};
const loadP = () => {
  try {
    return { ...PDEF, ...(JSON.parse(localStorage.getItem(PKEY)) || {}) };
  } catch (e) {
    return { ...PDEF };
  }
};
const norm = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const slug = (n) =>
  n
    .toLowerCase()
    .replace("♀", "-f")
    .replace("♂", "-m")
    .replace("type: null", "type-null")
    .replace(/[’'.:]/g, "")
    .replace(/é/g, "e")
    .replace(/\s+/g, "-");
const blank = {
  games: [],
  shiny: false,
  alpha: false,
  mega: false,
  megaX: false,
  megaY: false,
  megaN: false,
  megaZ: false,
  gmax: false,
  primal: false,
  unown: [],
};
/* Campos de las especies con dos Megaevoluciones (ver MEGA2 más abajo) */
const MKEYS = ["megaX", "megaY", "megaN", "megaZ"];
const isEmpty = (x) =>
  !x.games.length &&
  !x.shiny &&
  !x.alpha &&
  !x.mega &&
  !x.gmax &&
  !x.primal &&
  !(x.unown && x.unown.length) &&
  !MKEYS.some((k) => x[k]);
/* Junta dos progresos sin perder nada: une los juegos y suma las marcas */
const merge = (a, b) => {
  const r = { ...a };
  for (const k in b) {
    const x = a[k],
      y = { ...blank, ...b[k] };
    if (!x) {
      r[k] = y;
      continue;
    }
    r[k] = {
      games: [...new Set([...x.games, ...y.games])],
      shiny: x.shiny || y.shiny,
      alpha: x.alpha || y.alpha,
      mega: x.mega || y.mega,
      gmax: x.gmax || y.gmax,
      primal: !!(x.primal || y.primal),
      unown: [...new Set([...(x.unown || []), ...(y.unown || [])])],
    };
    MKEYS.forEach((m) => {
      r[k][m] = !!(x[m] || y[m]);
    });
  }
  return r;
};
/* Número de Pokédex nacional según el orden de las regiones */
const NUM = {};
let _c = 0;
REGIONS.forEach((r) =>
  r.pokemon.forEach((n) => {
    NUM[n] = ++_c;
  }),
);
const GI = {};
GAMES.forEach((g, i) => (GI[g] = i));
const GSORT = {
  new: (a, b) => GI[b] - GI[a],
  old: (a, b) => GI[a] - GI[b],
  az: (a, b) => a.localeCompare(b, "es"),
};
/* Entradas: especie base y formas. k = clave de guardado, s = sprite, b = especie base */
const FAV = {};
const ENTRIES = REGIONS.map((r) => {
  const out = [],
    seen = new Set();
  r.pokemon.forEach((n) => {
    const v = VARIANTS[n];
    out.push({ k: n, b: n, s: (v && v[2]) || slug(n), f: 0, def: v && v[0] });
    if (v)
      v[1].forEach(([lab, suf, g]) => {
        const k = n + " (" + lab + ")";
        if (g) FAV[k] = g;
        out.push({ k, b: n, s: slug(n) + "-" + suf, f: 1 });
      });
  });
  REGIONAL.filter((x) => x[1] === r.name).forEach(([b, , lab, suf, g]) => {
    const k = b + " " + lab;
    FAV[k] = g;
    out.push({ k, b, s: slug(b) + "-" + suf, f: 1, reg: 1 });
  });
  out.forEach((x, i) => (x.o = i));
  return out;
});
const label = (x, forms) => (forms && x.def ? x.b + " (" + x.def + ")" : x.k);
/* Marcas especiales y en qué Pokémon se pueden obtener */
/* Ícono shiny: dos destellos de cuatro puntas, como en los juegos */
const Shiny = () =>
  html`<svg class="shi" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M9 7Q9 15 17 15Q9 15 9 23Q9 15 1 15Q9 15 9 7ZM19 1Q19 6 24 6Q19 6 19 11Q19 6 14 6Q19 6 19 1Z"
    />
  </svg>`;
/* [clave, etiqueta del botón, nombre para los mensajes] */
const MARKS = [
  ["shiny", html`<${Shiny} /> Shiny`, "Shiny"],
  ["alpha", "α Alfa", "Alfa"],
  ["mega", "M Mega", "Mega"],
  ["gmax", "G Gigamax", "Gigamax"],
  ["primal", "Ω Primigenio", "Primigenio"],
];
/* Regresión Primigenia: solo Kyogre y Groudon (Rayquaza tiene Megaevolución, no Primigenio) */
const PRIMAL = new Set(["Kyogre", "Groudon"]);
const SHINY_LOCK = new Set(window.DATA.SHINY_LOCK || []);
/* Juegos donde existe cada marca (índices de GAMES). Shiny desde Oro/Plata; Mega en X/Y, ROZA, Sol/Luna,
   USUL, Let's Go y Z-A; Gigamax solo en Espada/Escudo; Alfa en las dos Leyendas; Primigenio en ROZA, Sol/Luna y USUL. */
const MARK_GAMES = {
  shiny: [
    2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  ],
  alpha: [19, 21],
  mega: [12, 13, 14, 15, 16, 21],
  gmax: [17],
  primal: [13, 14, 15],
};
const MG = {};
for (const k in MARK_GAMES) MG[k] = new Set(MARK_GAMES[k].map((i) => GAMES[i]));
/* Megas que llegaron con Leyendas: Z-A y su DLC: solo existen en ese juego */
const ZA_MEGA = new Set([
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
const ZA = new Set([GAMES[21]]);
/* Excepciones: NO_MEGA usa el nombre exacto (especie o forma) y NO_ALPHA la especie con todas sus formas.
   Zygarde: solo la forma 100% puede megaevolucionar (en Z-A); ninguna forma puede ser alfa */
const NO_MEGA = new Set(["Zygarde", "Zygarde (10%)"]),
  NO_ALPHA = new Set(["Zygarde"]);
/* ¿Se puede tener esta marca en este juego? Sin juego: en alguno de los juegos donde aparece */
const canIn = (x, k, g) =>
  !!x.can[k] && (g ? x.mg[k].has(g) : x.mg[k].size > 0);
/* Se calcula una sola vez: juegos posibles, marcas posibles y nombre normalizado para buscar */
const EK = {};
ENTRIES.forEach((l) =>
  l.forEach((x) => {
    x.av = new Set((FAV[x.k] || AV[x.b] || []).map((i) => GAMES[i]));
    const m = M(x);
    x.can = {
      shiny: !SHINY_LOCK.has(x.b) && !SHINY_LOCK.has(x.k),
      alpha: !NO_ALPHA.has(x.b),
      mega: !x.reg && !NO_MEGA.has(x.k) && !!(m && m[3].includes("mega")),
      gmax: !x.reg && GMAX.has(x.b),
      primal: PRIMAL.has(x.b),
    };
    /* x.form: si la especie tiene esa forma (para las imágenes). x.can: si se puede marcar en algún juego donde aparece */
    x.form = { ...x.can };
    x.mg = {};
    for (const k in MG)
      x.mg[k] = new Set(
        [...x.av].filter(
          (g) =>
            MG[k].has(g) && (k !== "mega" || !ZA_MEGA.has(x.b) || ZA.has(g)),
        ),
      );
    for (const k in MG) x.can[k] = x.can[k] && x.mg[k].size > 0;
    x.n0 = norm(label(x, false));
    x.n1 = norm(label(x, true));
    EK[x.k] = x;
  }),
);
/* Pokédex del juego: secciones con las especies en el orden del juego (datos/pokedex.js).
   Cada especie va con sus formas disponibles en ese juego. Al final va "Fuera de la Pokédex" con lo que se
   obtiene en el juego sin estar en sus Pokédex; se puede ocultar y no cuenta en el total. Los juegos sin Pokédex se agrupan
   por región. Se calcula una vez por juego. dn = número en la Pokédex del juego. */
const GDEX = window.DATA.GDEX || {};
const BYSLUG = {},
  FORMS = {};
ENTRIES.forEach((l) =>
  l.forEach((x) => {
    if (x.f) (FORMS[x.b] = FORMS[x.b] || []).push(x);
    else BYSLUG[slug(x.b)] = x.b;
  }),
);
const GCACHE = {};
const gameSecs = (g) =>
  GCACHE[g] ||
  (GCACHE[g] = (() => {
    const out = [],
      seen = new Set();
    (GDEX[GI[g]] || []).forEach(([name, list, first = 1]) => {
      const rows = [];
      list.split(" ").forEach((s, i) => {
        const b = BYSLUG[s];
        if (!b) return;
        seen.add(b);
        [EK[b], ...(FORMS[b] || [])].forEach((x) => {
          if (x.av.has(g)) rows.push({ ...x, dn: i + first });
        });
      });
      out.push({ name, list: rows });
    });
    /* Lo que se consigue en el juego pero no está en ninguna de sus Pokédex (Escaneo Isla, eventos, legendarios del DLC…) */
    if (out.length) {
      const rows = ENTRIES.flat().filter((x) => !seen.has(x.b) && x.av.has(g));
      if (rows.length)
        out.push({ name: "Fuera de la Pokédex", list: rows, extra: true });
      return out;
    }
    REGIONS.forEach((r, i) => {
      const rows = ENTRIES[i].filter((x) => x.av.has(g));
      if (rows.length) out.push({ name: r.name, list: rows });
    });
    return out;
  })());
/* Imágenes a probar en orden según las marcas: Gigamax > Mega > normal, en versión shiny si corresponde.
   Si una no existe (por ejemplo, algunas megas nuevas), pasa a la siguiente; al final, la normal. */
const IMG = "https://img.pokemondb.net/sprites/home/",
  ART = "https://img.pokemondb.net/artwork/large/";
/* Especies con dos Megaevoluciones: cada una se marca aparte.
   [campo guardado, nombre, sufijo de la imagen]. Para sumar otra especie, agrégala aquí. */
const XY = [
  ["megaX", "Mega X", "mega-x"],
  ["megaY", "Mega Y", "mega-y"],
];
const NZ = [
  ["megaN", "Mega", "mega"],
  ["megaZ", "Mega Z", "mega-z"],
];
const MEGA2 = {
  Charizard: XY,
  Mewtwo: XY,
  Raichu: XY,
  Absol: NZ,
  Garchomp: NZ,
  Lucario: NZ,
};
/* Por cada imagen se prueba en orden: sprite de PokémonDB, sprite de PokéAPI y la ilustración oficial.
   PokéAPI ya tiene las Megas nuevas de Z-A (normal y shiny), pero sus imágenes van por número,
   así que se le pregunta el número una vez y se guarda en el navegador. */
const urls = (list, e) =>
  list.flatMap((s) => [
    ...(e && e.shiny
      ? [IMG + "shiny/" + s + ".png", { api: s, sh: true }]
      : []),
    IMG + "normal/" + s + ".png",
    { api: s, sh: false },
    ART + s + ".jpg",
  ]);
/* Nombre en PokéAPI a partir del nombre de la imagen de PokémonDB */
const apiName = (s) =>
  s
    .replace(/-gigantamax$/, "-gmax")
    .replace(/-alolan/, "-alola")
    .replace(/-galarian/, "-galar")
    .replace(/-hisuian/, "-hisui")
    .replace(/-paldean/, "-paldea");
const PAPI =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/",
  AKEY = "dexter.api";
const AIDS = (() => {
    try {
      return JSON.parse(localStorage.getItem(AKEY)) || {};
    } catch (e) {
      return {};
    }
  })(),
  APEND = {};
const apiId = (n) =>
  n in AIDS
    ? Promise.resolve(AIDS[n])
    : APEND[n] ||
      (APEND[n] = fetch("https://pokeapi.co/api/v2/pokemon/" + n)
        .then((r) => (r.ok ? r.json().then((j) => j.id) : null))
        .catch(() => undefined)
        .then((id) => {
          if (id !== undefined) {
            AIDS[n] = id;
            try {
              localStorage.setItem(AKEY, JSON.stringify(AIDS));
            } catch (e) {}
          }
          return id || null;
        }));
const megaImgs = (x, e) => {
  const b = slug(x.b),
    o = MEGA2[x.b];
  if (!o) return [b + "-mega", b + "-mega-x"];
  const f = o.find(([k]) => e[k]) || o[0];
  return [b + "-" + f[2]];
};
/* Gigamax: algunas especies tienen el nombre de la imagen distinto (Urshifu tiene dos estilos, Toxtricity dos formas) */
const GMAX_IMG = {
  Urshifu: [
    "urshifu-single-strike-gigantamax",
    "urshifu-rapid-strike-gigantamax",
  ],
  Toxtricity: ["toxtricity-gigantamax", "toxtricity-amped-gigantamax"],
};
const gmaxImgs = (x) => GMAX_IMG[x.b] || [slug(x.b) + "-gigantamax"];
/* Unown: imagen de cada letra (A es la forma normal) */
const UNOWN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!?".split("");
const PSPR =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
/* PokémonDB nombra cada letra unown-a … unown-z, unown-em (!) y unown-qm (?).
   No se usa la imagen genérica de respaldo: si una letra no carga, se ve la letra en vez de la A */
const unownImg = (l, sh) => {
  const d = l === "!" ? "em" : l === "?" ? "qm" : l.toLowerCase(),
    p = l === "!" ? "exclamation" : l === "?" ? "question" : l.toLowerCase();
  return [
    IMG + (sh ? "shiny/" : "normal/") + "unown-" + d + ".png",
    "https://img.pokemondb.net/sprites/legends-arceus/" +
      (sh ? "shiny/" : "normal/") +
      "unown-" +
      d +
      ".png",
    PSPR + (sh ? "shiny/" : "") + "201" + (l === "A" ? "" : "-" + p) + ".png",
  ];
};
const srcs = (x, e) => {
  const list = [];
  if (e && e.gmax && x.form.gmax) list.push(...gmaxImgs(x));
  if (e && e.primal && x.form.primal) list.push(slug(x.b) + "-primal");
  if (e && e.mega && x.form.mega) list.push(...megaImgs(x, e));
  list.push(x.s);
  return urls(list, e);
};
/* En la ficha: una imagen por cada versión que tienes marcada (normal, cada Mega, Gigamax, cada letra de Unown) */
const views = (x, e, lt) => {
  if (x.b === "Unown" && lt) return [[lt, unownImg(lt, e.shiny)]];
  if (x.b === "Unown" && e.unown && e.unown.length)
    return UNOWN.filter((l) => e.unown.includes(l)).map((l) => [
      l,
      unownImg(l, e.shiny),
    ]);
  const b = slug(x.b),
    v = [["Normal", [x.s]]],
    o = MEGA2[x.b];
  if (x.form.mega && o) {
    o.forEach(([k, t, s]) => {
      if (e[k]) v.push([t, [b + "-" + s]]);
    });
    if (e.mega && !o.some(([k]) => e[k])) v.push(["Mega", [b + "-" + o[0][2]]]);
  } else if (x.form.mega && e.mega) v.push(["Mega", megaImgs(x, e)]);
  if (x.form.gmax && e.gmax) v.push(["Gigamax", gmaxImgs(x)]);
  if (x.form.primal && e.primal) v.push(["Primigenio", [b + "-primal"]]);
  return v.map(([t, list]) => [t, urls(list, e)]);
};
/* Dex especiales: una fila por cada versión que se puede marcar.
   k = clave de la fila, x = especie, m = marca (para saber en qué juegos existe), name = nombre a mostrar,
   img = imágenes a probar, on(e) = si la tienes, set(e) = la marca o desmarca en el progreso de la especie */
const SD = [
  ["mega", "Megadex"],
  ["gmax", "Gigamax dex"],
  ["alpha", "Alfa dex"],
  ["unown", "Unown dex"],
];
const SPECIAL = (() => {
  const all = ENTRIES.flat(),
    base = all.filter((x) => !x.f),
    cat = (x) => (M(x) || [0, 0, [], []])[3];
  const tog = (k) => (e) => {
    e[k] = !e[k];
  };
  const mega = [];
  /* Normalmente la Mega va en la forma base; si la base no puede (Zygarde), va en la forma que sí puede */
  all
    .filter((x) => !x.f || NO_MEGA.has(x.b))
    .forEach((x) => {
      const b = slug(x.b),
        o = MEGA2[x.b];
      if (x.form.mega) {
        if (o)
          o.forEach(([k, t, s]) =>
            mega.push({
              k: x.k + "|" + k,
              x,
              m: "mega",
              name: t.replace("Mega", "Mega " + x.b),
              img: urls([b + "-" + s]),
              on: (e) => !!e[k],
              set: (e) => {
                e[k] = !e[k];
                e.mega = o.some(([m]) => e[m]);
              },
            }),
          );
        else
          mega.push({
            k: x.k + "|mega",
            x,
            m: "mega",
            name: "Mega " + x.b,
            img: urls(megaImgs(x, {})),
            on: (e) => !!e.mega,
            set: tog("mega"),
          });
      }
      /* La Regresión Primigenia va en la Megadex, junto a las Megas */
      if (x.form.primal)
        mega.push({
          k: x.k + "|primal",
          x,
          m: "primal",
          name: x.b + " Primigenio",
          img: urls([b + "-primal"]),
          on: (e) => !!e.primal,
          set: tog("primal"),
        });
    });
  const gmax = base
    .filter((x) => x.form.gmax)
    .map((x) => ({
      k: x.k + "|gmax",
      x,
      m: "gmax",
      name: x.b + " Gigamax",
      img: urls(gmaxImgs(x)),
      on: (e) => !!e.gmax,
      set: tog("gmax"),
    }));
  /* Alfas: especies y formas regionales de las Leyendas, sin legendarios ni singulares (no aparecen como alfa) */
  const alpha = all
    .filter(
      (x) =>
        (!x.f || x.reg) &&
        x.mg.alpha.size &&
        !cat(x).some((c) => c === "leg" || c === "sing"),
    )
    .map((x) => ({
      k: x.k + "|alpha",
      x,
      m: "alpha",
      name: x.k + " alfa",
      img: urls([x.s]),
      on: (e) => !!e.alpha,
      set: tog("alpha"),
    }));
  /* Unown: las 28 formas (A–Z, ! y ?). Se guardan en la lista "unown" de la especie */
  const u = EK["Unown"],
    unown = !u
      ? []
      : UNOWN.map((l) => {
          return {
            k: "Unown|" + l,
            x: u,
            l,
            m: "unown",
            name: "Unown " + l,
            img: unownImg(l),
            on: (e) => (e.unown || []).includes(l),
            set: (e) => {
              const v = e.unown || [];
              e.unown = v.includes(l) ? v.filter((z) => z !== l) : [...v, l];
            },
          };
        });
  return { mega, gmax, alpha, unown };
})();
function Sprite({ name, src, cls }) {
  const [i, setI] = useState(0);
  const [api, setApi] = useState({});
  const c = src[i];
  /* Si toca una imagen de PokéAPI, primero se busca su número */
  useEffect(() => {
    if (!c || typeof c === "string" || i in api) return;
    let live = true;
    apiId(apiName(c.api)).then((id) => {
      if (!live) return;
      id
        ? setApi((a) => ({
            ...a,
            [i]: PAPI + (c.sh ? "shiny/" : "") + id + ".png",
          }))
        : setI(i + 1);
    });
    return () => {
      live = false;
    };
  }, [i]);
  const url = typeof c === "string" ? c : api[i];
  return i >= src.length
    ? html`<div class=${"sp ph " + (cls || "")}>${name[0]}</div>`
    : url
      ? html`<img
          class=${"sp " + (cls || "")}
          loading="lazy"
          alt=""
          src=${url}
          onError=${() => setI(i + 1)}
        />`
      : html`<div class=${"sp " + (cls || "")}></div>`;
}
/* gm: juego que estás jugando. Si hay uno, solo se muestran las marcas que existen en ese juego */
function Sheet({ x, title, e, av, upd, del, close, gs, gm, lt }) {
  const name = x.k;
  const [g, setG] = useState("");
  const [conf, setConf] = useState(false);
  const [all, setAll] = useState(false);
  const opts = gs(all ? GAMES : av);
  const has = !isEmpty(e);
  /* Al marcar shiny salen estrellitas alrededor de la imagen de la ficha */
  const tg = (k, t) =>
    html`<button
      class=${e[k] ? "on" : ""}
      onClick=${(ev) => {
        if (k === "shiny" && !e.shiny)
          Estrellas(ev.currentTarget.closest(".sh").querySelector(".hd .sp"));
        upd(name, (x) => {
          x[k] = !x[k];
        });
      }}
    >
      ${t}
    </button>`;
  /* Cada Mega se marca aparte; "mega" queda encendido si tienes cualquiera */
  const mo = x.form.mega && MEGA2[x.b];
  const tgm = (k, t) =>
    html`<button
      key=${k}
      class=${e[k] ? "on" : ""}
      onClick=${() =>
        upd(name, (x) => {
          x[k] = !x[k];
          x.mega = mo.some(([m]) => x[m]);
        })}
    >
      ${t}
    </button>`;
  const two = !!mo;
  const vw = views(x, e, lt);
  return html`<div class="ov" onClick=${close}>
    <div class="sh" onClick=${(ev) => ev.stopPropagation()}>
      <div class="hd">
        ${vw.length === 1
          ? html`<${Sprite} key=${vw[0][1][0]} name=${name} src=${vw[0][1]} />`
          : html`<div class="gal">
              ${vw.map(
                ([t, src]) =>
                  html`<figure key=${t}>
                    <${Sprite} key=${src[0]} name=${name} src=${src} />
                    <figcaption>${t}</figcaption>
                  </figure>`,
              )}
            </div>`}
        <h3>
          <span class="num">#${String(NUM[x.b]).padStart(4, "0")}</span>${lt
            ? "Unown " + lt
            : title}
        </h3>
      </div>
      ${opts.length
        ? html`<div class="add">
            <select value=${g} onChange=${(ev) => setG(ev.target.value)}>
              <option value="">
                ${all
                  ? "Cualquier juego (sin validar)"
                  : "¿En qué juego lo capturaste?"}
              </option>
              ${opts.map(
                (x) => html`<option key=${x} value=${x}>${x}</option>`,
              )}
            </select>
            <button
              onClick=${(ev) => {
                if (g) {
                  Animar(
                    ev.currentTarget.closest(".sh").querySelector(".hd .sp"),
                  );
                  upd(name, (x) => {
                    if (!x.games.includes(g)) x.games.push(g);
                  });
                  setG("");
                }
              }}
            >
              Añadir
            </button>
          </div>`
        : html`<p class="mu">
            No aparece en ningún juego de la lista (datos aproximados).
          </p>`}
      <button class="cl" onClick=${() => setAll(!all)}>
        ${all ? "Volver a solo juegos posibles" : "Mostrar todos los juegos"}
      </button>
      <div class="gc">
        ${gs(e.games).map(
          (x) =>
            html`<span key=${x}
              >${x}<b
                onClick=${() =>
                  upd(name, (y) => {
                    y.games = y.games.filter((z) => z !== x);
                  })}
                >×</b
              ></span
            >`,
        )}
      </div>
      <div class="tgl">
        ${MARKS.map(([k, t]) =>
          k === "mega" && two
            ? canIn(x, k, gm) || mo.some(([m]) => e[m])
              ? mo.map(([m, t]) => tgm(m, "M " + t))
              : null
            : canIn(x, k, gm) || e[k]
              ? tg(k, t)
              : null,
        )}
      </div>
      ${lt
        ? html`<div class="tgl">
            <button
              class=${e.unown.includes(lt) ? "on" : ""}
              onClick=${() =>
                upd(name, (y) => {
                  const v = y.unown || [];
                  y.unown = v.includes(lt)
                    ? v.filter((z) => z !== lt)
                    : [...v, lt];
                })}
            >
              Tengo Unown ${lt}
            </button>
          </div>`
        : null}
      ${x.b === "Unown" && e.unown.length
        ? html`<p class="mu">
            Unown dex: ${e.unown.length} de ${UNOWN.length} formas
            (${UNOWN.filter((l) => e.unown.includes(l)).join(" ")})
          </p>`
        : null}
      <div class="sbtn">
        <button class="ok" onClick=${close}>Cerrar</button> ${has
          ? conf
            ? html`<button
                class="rel on"
                onClick=${() => {
                  del(name);
                  close();
                }}
              >
                Sí, liberar
              </button>`
            : html`<button class="rel" onClick=${() => setConf(true)}>
                Liberar
              </button>`
          : null}
      </div>
      ${conf
        ? html`<p class="hint">
            Se borrará todo lo marcado de ${title}. Toca "Sí, liberar" para
            confirmar o "Cerrar" para dejarlo.
          </p>`
        : null}
    </div>
  </div>`;
}
function Footer() {
  return html`<footer>
    <p>
      Dexter es un proyecto independiente. ¿Ideas, errores o sugerencias?
      Escríbeme o sígueme, y si te sirve puedes apoyar el proyecto.
    </p>
    <div class="lk">
      <a
        href="https://www.instagram.com/cristobalier"
        target="_blank"
        rel="noopener"
        >Instagram @cristobalier</a
      >
      <a
        href="#"
        onClick=${(ev) => {
          ev.preventDefault();
          location.href =
            "mai" + "lto:" + ["onirico14todo", "icloud.com"].join("@");
        }}
        >✉ Escríbeme</a
      >
      <a
        class="kofi"
        href="https://ko-fi.com/cristobalier"
        target="_blank"
        rel="noopener"
        >☕ Apóyame en Ko-fi</a
      >
    </div>
    <small
      >Datos de disponibilidad aproximados. Pokémon y sus nombres son marcas de
      sus respectivos dueños. Si inicias sesión, tu progreso se guarda en tu
      cuenta de Google y no se comparte con nadie.</small
    >
  </footer>`;
}
function App() {
  const [sm, setSm] = useState(false);
  const [pk, setPk] = useState({});
  const [bg, setBg] = useState("");
  const [bm, setBm] = useState([]);
  const [msg, setMsg] = useState("");
  const [data, setData] = useState(load);
  /* Marca si el último cambio lo hiciste tú (y no la sincronización con la nube) */
  const yo = useRef(false);
  const [q, setQ] = useState("");
  const [reg, setReg] = useState(-1);
  const [sel, setSel] = useState(null);
  const [lt, setLt] = useState(null);
  const [pr, setPr] = useState(loadP);
  const sp = (k, v) => setPr((p) => ({ ...p, [k]: v }));
  /* El juego elegido y la vista se recuerdan para la próxima vez */
  const gm = GAMES.includes(pr.gm) ? pr.gm : "",
    setGm = (v) => sp("gm", v),
    vw = pr.vw;
  const gv = vw === "game" && !!gm;
  useEffect(() => setReg(-1), [vw, gm]);
  const [fc, setFc] = useState("");
  const [ft, setFt] = useState([]);
  const [fo, setFo] = useState(false);
  const [fx, setFx] = useState(false);
  /* Los controles se esconden al bajar por la lista y vuelven apenas subes un poco (o al tocar arriba) */
  const [hide, setHide] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY,
        d = y - last;
      if (Math.abs(d) < 8) return;
      const typing =
        document.activeElement && document.activeElement.tagName === "INPUT";
      setHide(d > 0 && y > 160 && !typing);
      last = y;
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const [user, setUser] = useState(null);
  useEffect(
    () =>
      window.Sync &&
      Sync.onUser((u, remote) => {
        setUser(u);
        if (u) setData((d) => merge(d, remote || {}));
      }),
    [],
  );
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {}
    window.Sync && Sync.save(data);
  }, [data]);
  useEffect(() => {
    try {
      localStorage.setItem(PKEY, JSON.stringify(pr));
    } catch (e) {}
  }, [pr]);
  const gs = (arr) => [...arr].sort(GSORT[pr.go] || GSORT.new);
  const upd = (n, fn) =>
    setData((d) => {
      yo.current = true;
      const x = { ...blank, ...(d[n] || {}) };
      x.games = [...x.games];
      fn(x);
      const r = { ...d };
      isEmpty(x) ? delete r[n] : (r[n] = x);
      return r;
    });
  const del = (n) =>
    setData((d) => {
      const r = { ...d };
      delete r[n];
      return r;
    });
  const av = (x) => [...x.av];
  const inG = (x) => !gm || x.av.has(gm);
  const own = (n) =>
    gm
      ? !!(data[n] && data[n].games.includes(gm))
      : !!(data[n] && data[n].games.length);
  const tgl = (n) =>
    upd(n, (x) => {
      x.games = x.games.includes(gm)
        ? x.games.filter((z) => z !== gm)
        : [...x.games, gm];
    });
  const base = ENTRIES.map((l) =>
    l.filter((x) => (pr.forms || !x.f) && inG(x)),
  );
  const cnt = base.map((l) => l.filter((x) => !x.f));
  const secs = gv ? gameSecs(gm) : null;
  /* fm: '' todos, 'all' solo los que faltan, 'shiny' los que faltan en shiny (las versiones antiguas guardaban true) */
  const fm = pr.fm === true ? "all" : pr.fm || "",
    fs = fm === "shiny";
  const inS = (x) => !fs || x.can.shiny;
  const got = (x) => (fs ? !!(data[x.k] && data[x.k].shiny) : own(x.k));
  /* En la Pokédex del juego una especie puede salir en dos secciones: para el total se cuenta una vez */
  /* "Fuera de la Pokédex" no cuenta en el total, igual que en el juego */
  const scope = (
    secs
      ? [
          ...new Map(
            secs
              .filter((s) => !s.extra)
              .flatMap((s) => s.list)
              .filter((x) => !x.f)
              .map((x) => [x.k, x]),
          ).values(),
        ]
      : cnt.flat()
  ).filter(inS);
  /* Dex especiales: todas las filas de la dex elegida (sin filtro de juego ni de "me faltan") */
  const esp = vw === "esp",
    sd = SPECIAL[pr.sd] ? pr.sd : "mega";
  const son = (r) => !!data[r.x.k] && r.on({ ...blank, ...data[r.x.k] });
  const srows = esp ? SPECIAL[sd] : [];
  const total = esp ? srows.length : scope.length;
  const owned = esp ? srows.filter(son).length : scope.filter(got).length;
  /* Celebración: cuando marcas el último que faltaba en la Pokédex que estás viendo */
  const dexId = esp ? "esp:" + sd : vw + ":" + gm + (fs ? ":shiny" : "");
  const dexName =
    (esp
      ? SD.find(([k]) => k === sd)[1]
      : gv
        ? "Pokédex de " + gm
        : gm
          ? "Living Dex de " + gm
          : "Living Dex") + (fs ? " shiny" : "");
  const lleno = total > 0 && owned === total;
  const prev = useRef({ id: dexId, lleno });
  useEffect(() => {
    const p = prev.current,
      mio = yo.current;
    prev.current = { id: dexId, lleno };
    yo.current = false;
    if (mio && p.id === dexId && !p.lleno && lleno && window.Celebrar)
      Celebrar("¡" + dexName + " completa!");
  }, [owned, total, dexId]);
  /* La búsqueda usa un valor diferido para que escribir no se trabe */
  const dq = useDeferredValue(q);
  const nq = norm(dq);
  const cmp =
    pr.po === "az"
      ? (a, b) => label(a, pr.forms).localeCompare(label(b, pr.forms), "es")
      : pr.po === "desc"
        ? (a, b) => b.o - a.o
        : (a, b) => a.o - b.o;
  const pass = (x) =>
    (pr.forms || !x.f || fc === "reg") &&
    passF(x, fc, ft) &&
    (!nq || (pr.forms ? x.n1 : x.n0).includes(nq)) &&
    (!fm || (fs ? x.can.shiny && !got(x) : !own(x.k)));
  let slist = srows.filter((r) => !nq || norm(r.name).includes(nq));
  if (pr.po === "az")
    slist = [...slist].sort((a, b) => a.name.localeCompare(b.name, "es"));
  else if (pr.po === "desc") slist = [...slist].reverse();
  let groups = secs
    ? secs.map((s, i) => {
        const l = s.list.filter(pass),
          sl =
            pr.po === "az" ? l.sort(cmp) : pr.po === "desc" ? l.reverse() : l;
        /* La sección de fuera se puede ocultar: queda el título con su botón */
        return {
          r: { name: s.name },
          i,
          all: s.list.filter((x) => !x.f),
          extra: s.extra,
          n: l.length,
          list: s.extra && !pr.ox ? [] : sl,
        };
      })
    : REGIONS.map((r, i) => ({
        r,
        i,
        all: cnt[i],
        list: ENTRIES[i].filter((x) => inG(x) && pass(x)).sort(cmp),
      }));
  groups = groups.filter(
    (g) => (reg < 0 || g.i === reg) && (g.list.length || (g.extra && g.n)),
  );
  if (pr.po === "desc")
    groups = [
      ...groups.filter((g) => !g.extra).reverse(),
      ...groups.filter((g) => g.extra),
    ];
  if (/^[hw][ud]$/.test(pr.po)) {
    const k = pr.po[0] === "h" ? 0 : 1,
      s = pr.po[1] === "u" ? 1 : -1,
      seen = new Set();
    const list = groups
      .flatMap((g) => g.list)
      .filter((x) => !seen.has(x.k) && seen.add(x.k))
      .sort((a, b) => s * (((M(a) || [])[k] || 0) - ((M(b) || [])[k] || 0)));
    groups = list.length
      ? [
          {
            r: { name: k ? "Peso" : "Altura" },
            i: -1,
            all: list.filter((x) => !x.f),
            list,
          },
        ]
      : [];
  }
  /* Sugerencias del buscador: los nombres de lo que estás viendo (región o juego) */
  const sugg = useMemo(
    () =>
      esp
        ? SPECIAL[sd].map((r) => r.name)
        : [
            ...new Set(
              (secs ? secs.flatMap((s) => s.list) : ENTRIES.flat().filter(inG))
                .filter((x) => pr.forms || !x.f)
                .map((x) => label(x, pr.forms)),
            ),
          ],
    [secs, gm, pr.forms, esp, sd],
  );
  /* Botones de sección: en la Pokédex del juego solo si el juego tiene más de una Pokédex */
  const chips = secs
    ? (GDEX[GI[gm]] || []).length > 1
      ? secs.filter((s) => !s.extra).map((s) => s.name)
      : []
    : REGIONS.map((r) => r.name);
  const sx = sel && EK[sel];
  const togglePick = (n) =>
    setPk((p) => {
      const r = { ...p };
      r[n] ? delete r[n] : (r[n] = true);
      return r;
    });
  const picked = Object.keys(pk).filter((k) => pk[k]);
  const pickedEntries = picked.map((k) => EK[k]).filter(Boolean);
  const bgames = [...new Set(pickedEntries.flatMap(av))];
  const selectVisible = () =>
    setPk((p) => {
      const r = { ...p };
      groups.forEach((g) =>
        g.list.forEach((x) => {
          r[x.k] = true;
        }),
      );
      return r;
    });
  const openSel = (on) => {
    setSm(on);
    setPk({});
    setMsg("");
    setBg(on ? gm : "");
    setBm([]);
  };
  const toggleMark = (k) =>
    setBm((a) => (a.includes(k) ? a.filter((z) => z !== k) : [...a, k]));
  /* Marcas que se ofrecen: solo las que puede tener al menos uno de los seleccionados (en el juego elegido, si hay) */
  const bmarks = MARKS.filter(([k]) =>
    pickedEntries.some((x) => canIn(x, k, bg)),
  );
  const bms = bm.filter((k) => bmarks.some(([m]) => m === k));
  /* Añade o quita el juego elegido y las marcas elegidas en los seleccionados.
     Solo se aplica lo que es posible en cada Pokémon (un juego donde aparece, una marca que puede tener). */
  const applyBulk = (add) => {
    const g = bg,
      bm = bms;
    if (!g && !bm.length) return;
    const plan = pickedEntries.map((x) => ({
      k: x.k,
      g: !!g && x.av.has(g),
      m: add ? bm.filter((m) => canIn(x, m, g)) : bm,
    }));
    const done = plan.filter((p) => p.g || p.m.length).length,
      partial = add
        ? plan.filter((p) => p.m.length < bm.length || (g && !p.g)).length
        : 0;
    setData((d) => {
      yo.current = true;
      const r = { ...d };
      plan.forEach((p) => {
        if (!p.g && !p.m.length) return;
        const x = { ...blank, ...(r[p.k] || {}) };
        x.games = [...x.games];
        if (p.g)
          x.games = add
            ? x.games.includes(g)
              ? x.games
              : [...x.games, g]
            : x.games.filter((z) => z !== g);
        p.m.forEach((m) => {
          x[m] = add;
          /* En especies con dos Megas, "Mega" en la selección marca la primera si no tenías ninguna; al quitar, quita todas */
          const o = m === "mega" && MEGA2[EK[p.k].b];
          if (o) {
            if (!add)
              o.forEach(([k]) => {
                x[k] = false;
              });
            else if (!o.some(([k]) => x[k])) x[o[0][0]] = true;
          }
        });
        isEmpty(x) ? delete r[p.k] : (r[p.k] = x);
      });
      return r;
    });
    const what = [
      g,
      ...MARKS.filter(([k]) => bm.includes(k)).map(([, , nm]) => nm),
    ]
      .filter(Boolean)
      .join(" + ");
    setMsg(
      (add ? "Añadido " : "Quitado ") +
        what +
        " en " +
        done +
        (partial
          ? " · " +
            partial +
            " sin aplicar en parte (no es posible en esos Pokémon)"
          : ""),
    );
  };

  return html`<div>
    <header class=${hide && !fx ? "hide" : ""}>
      <h1>Dexter</h1>
      <div class="acct">
        ${user
          ? html`<span>☁︎ Guardado en ${user.email}</span
              ><button onClick=${() => Sync.signOut()}>Cerrar sesión</button>`
          : html`<button onClick=${() => window.Sync && Sync.signIn()}>
              Iniciar sesión con Google para no perder tu progreso
            </button>`}
      </div>
      <div class="top">
        <span
          >${esp
            ? SD.find(([k]) => k === sd)[1]
            : (gv ? "Pokédex de " + gm : gm || "Living Dex") +
              (fs ? " · shiny" : "")}</span
        ><span
          >${owned} / ${total} ·
          ${total ? ((owned / total) * 100).toFixed(1) : 0} %</span
        >
      </div>
      <div class="bar">
        <i style=${{ width: (total ? (owned / total) * 100 : 0) + "%" }}></i>
      </div>
      <div class="opts vw">
        <button
          class=${vw !== "game" && !esp ? "on" : ""}
          onClick=${() => sp("vw", "reg")}
        >
          Regionales
        </button>
        <button
          class=${vw === "game" ? "on" : ""}
          onClick=${() => sp("vw", "game")}
        >
          Del juego
        </button>
        <button
          class=${esp ? "on" : ""}
          onClick=${() => {
            sp("vw", "esp");
            openSel(false);
          }}
        >
          Especiales
        </button>
      </div>
      ${esp
        ? null
        : html`<select
            class="gsel"
            value=${gm}
            onChange=${(e) => setGm(e.target.value)}
          >
            <option value="">
              ${vw === "game"
                ? "Elige el juego que estás jugando…"
                : "Todos los juegos (Living Dex)"}
            </option>
            ${gs(GAMES).map(
              (x) => html`<option key=${x} value=${x}>Jugando: ${x}</option>`,
            )}
          </select>`}
      ${esp
        ? null
        : html`<div class="opts">
            <button
              class=${fx || fc || ft.length ? "on" : ""}
              onClick=${() => setFx(!fx)}
            >
              ${fx ? "▴" : "▾"}
              Filtros${fc || ft.length
                ? " · " + ((fc ? 1 : 0) + ft.length)
                : ""}
            </button>
            <select
              aria-label="Qué mostrar"
              class=${fm ? "on" : ""}
              value=${fm}
              onChange=${(e) => sp("fm", e.target.value)}
            >
              <option value="">Ver: todos</option>
              <option value="all">Solo me faltan</option>
              <option value="shiny">Me faltan shiny</option>
            </select>
            <button
              class=${pr.forms ? "on" : ""}
              onClick=${() => sp("forms", !pr.forms)}
            >
              Formas
            </button>
            <button class=${sm ? "on" : ""} onClick=${() => openSel(!sm)}>
              Seleccionar
            </button>
          </div>`}
      ${fx && !esp
        ? html`<div class="opts">
              <select
                aria-label="Orden de los juegos"
                value=${pr.go}
                onChange=${(e) => sp("go", e.target.value)}
              >
                <option value="new">Juegos: más nuevo primero</option>
                <option value="old">Juegos: más antiguo primero</option>
                <option value="az">Juegos: A → Z</option>
              </select>
              <select
                aria-label="Orden de los Pokémon"
                value=${pr.po}
                onChange=${(e) => sp("po", e.target.value)}
              >
                <option value="num">Pokémon: nº ascendente</option>
                <option value="desc">Pokémon: nº descendente</option>
                <option value="az">Pokémon: A → Z</option>
                <option value="hu">Pokémon: altura ↑</option>
                <option value="hd">Pokémon: altura ↓</option>
                <option value="wu">Pokémon: peso ↑</option>
                <option value="wd">Pokémon: peso ↓</option>
              </select>
            </div>
            <div class="opts">
              <select
                aria-label="Categoría"
                value=${fc}
                onChange=${(e) => setFc(e.target.value)}
              >
                <option value="">Categoría: todas</option>
                ${CATS.map(
                  ([k, n]) => html`<option key=${k} value=${k}>${n}</option>`,
                )}
              </select>
              <button
                class=${ft.length ? "on" : ""}
                onClick=${() => setFo(!fo)}
              >
                Tipos${ft.length ? " · " + ft.join("/") : ""}
              </button>
              ${fc || ft.length
                ? html`<button
                    onClick=${() => {
                      setFc("");
                      setFt([]);
                    }}
                  >
                    Limpiar
                  </button>`
                : null}
            </div>
            ${fo
              ? html`<div class="chips tp">
                  ${TYPES.map(
                    (t) =>
                      html`<button
                        key=${t}
                        class=${ft.includes(t) ? "on" : ""}
                        onClick=${() =>
                          setFt((a) =>
                            a.includes(t)
                              ? a.filter((z) => z !== t)
                              : [...a, t].slice(-2),
                          )}
                      >
                        ${t}
                      </button>`,
                  )}
                </div>`
              : null}`
        : null}
      ${esp
        ? html`<div class="hint">
            Toca para marcarlo como conseguido; toca su imagen para ver la ficha
            de la especie.
          </div>`
        : gm
          ? html`<div class="hint">
              Toca un Pokémon para marcarlo en este juego; toca su imagen para
              ver el detalle.
            </div>`
          : null}
      <input
        style=${{ marginTop: 8 }}
        type="search"
        placeholder="Buscar Pokémon o forma…"
        value=${q}
        onInput=${(e) => setQ(e.target.value)}
        list="dx-names"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="none"
        spellcheck=${false}
        enterkeyhint="search"
      />
      <datalist id="dx-names">
        ${sugg.map((n) => html`<option key=${n} value=${n} />`)}
      </datalist>
      ${esp
        ? html`<div class="chips">
            ${SD.map(
              ([k, n]) =>
                html`<button
                  key=${k}
                  class=${sd === k ? "on" : ""}
                  onClick=${() => sp("sd", k)}
                >
                  ${n}
                </button>`,
            )}
          </div>`
        : chips.length
          ? html`<div class="chips">
              <button class=${reg < 0 ? "on" : ""} onClick=${() => setReg(-1)}>
                Todas</button
              >${chips.map(
                (n, i) =>
                  html`<button
                    key=${n}
                    class=${reg === i ? "on" : ""}
                    onClick=${() => setReg(i)}
                  >
                    ${n}
                  </button>`,
              )}
            </div>`
          : null}
    </header>
    ${esp
      ? slist.length
        ? html`<div>
            <h2>
              <span>${SD.find(([k]) => k === sd)[1]}</span
              ><span>${owned}/${total}</span>
            </h2>
            <div class="list">
              ${slist.map((r) => {
                const o = son(r);
                return html`<div
                  class="row"
                  key=${r.k}
                  onClick=${(ev) => {
                    if (!o) Animar(ev.currentTarget.querySelector(".sp"));
                    upd(r.x.k, r.set);
                  }}
                >
                  <span
                    onClick=${(ev) => {
                      ev.stopPropagation();
                      setSel(r.x.k);
                      setLt(r.l || null);
                    }}
                    ><${Sprite} key=${r.k} name=${r.name} src=${r.img}
                  /></span>
                  <div class="nm">
                    <b class=${o ? "" : "mu"}
                      ><span class="num"
                        >#${String(NUM[r.x.b]).padStart(4, "0")}</span
                      >${r.name}</b
                    >
                  </div>
                  <span class=${"ck" + (o ? " on" : "")}>${o ? "✓" : ""}</span>
                </div>`;
              })}
            </div>
          </div>`
        : html`<div class="empty">Sin resultados.</div>`
      : vw === "game" && !gm
        ? html`<div class="empty">
            Elige arriba el juego que estás jugando para ver su Pokédex.
          </div>`
        : groups.length
          ? groups.map(
              ({ r, all, list, extra }) =>
                html`<div key=${r.name}>
                  <h2>
                    <span
                      >${r.name}${extra
                        ? html` <button
                            class="ox"
                            onClick=${() => sp("ox", !pr.ox)}
                          >
                            ${pr.ox ? "Ocultar" : "Mostrar"}
                          </button>`
                        : null}</span
                    ><span
                      >${all.filter(inS).filter(got).length}/${all.filter(inS)
                        .length}</span
                    >
                  </h2>
                  ${extra && !pr.ox
                    ? html`<p class="hint ox-h">
                        Pokémon que se consiguen en este juego sin estar en su
                        Pokédex (eventos, Escaneo Isla, legendarios del DLC…).
                        No cuentan en el total.
                      </p>`
                    : null}
                  <div class="list">
                    ${list.map((x) => {
                      const n = x.k,
                        e = data[n],
                        o = own(n),
                        on = sm ? pk[n] : o;
                      return html`<div
                        class=${"row" + (pk[n] ? " pk" : "")}
                        key=${n}
                        onClick=${(ev) => {
                          if (sm) return togglePick(n);
                          if (!gm) return (setLt(null), setSel(n));
                          if (!o) Animar(ev.currentTarget.querySelector(".sp"));
                          tgl(n);
                        }}
                      >
                        <span
                          onClick=${(ev) => {
                            ev.stopPropagation();
                            sm ? togglePick(n) : (setLt(null), setSel(n));
                          }}
                          ><${Sprite} key=${x.s} name=${n} src=${srcs(x)}
                        /></span>
                        <div class="nm">
                          <b class=${o ? "" : "mu"}
                            ><span class="num"
                              >#${x.dn != null
                                ? String(x.dn).padStart(3, "0")
                                : String(NUM[x.b]).padStart(4, "0")}</span
                            >${label(x, pr.forms)}</b
                          >${/^[hw]/.test(pr.po)
                            ? html`<small>${fmtM(x)}</small>`
                            : null}${e && e.games.length
                            ? html`<small>${gs(e.games).join(", ")}</small>`
                            : null}
                        </div>
                        ${e && e.shiny
                          ? html`<span class="tg y"><${Shiny} /></span>`
                          : null}${e && e.alpha
                          ? html`<span class="tg p">α</span>`
                          : null}${e && e.mega
                          ? html`<span class="tg o">M</span>`
                          : null}${e && e.gmax
                          ? html`<span class="tg r">G</span>`
                          : null}${e && e.primal
                          ? html`<span class="tg o">Ω</span>`
                          : null}
                        <span class=${"ck" + (on ? " on" : "")}
                          >${on ? "✓" : ""}</span
                        >
                      </div>`;
                    })}
                  </div>
                </div>`,
            )
          : html`<div class="empty">Sin resultados.</div>`}
    <${Footer} />
    <div style=${{ height: sm && !esp ? 220 : 30 }}></div>
    ${sm && !esp
      ? html`<div class="bulk">
          <div class="bk-top">
            <b>${picked.length} seleccionados</b>
            <button onClick=${selectVisible}>Todos los visibles</button>
            <button onClick=${() => setPk({})}>Ninguno</button>
            <button onClick=${() => openSel(false)}>Listo</button>
          </div>
          <div class="bk-row">
            <select value=${bg} onChange=${(e) => setBg(e.target.value)}>
              <option value="">Sin cambiar juegos (solo marcas)</option>
              ${gs(bgames).map(
                (x) => html`<option key=${x} value=${x}>${x}</option>`,
              )}
            </select>
          </div>
          ${bmarks.length
            ? html`<div class="bk-row bk-marks">
                ${bmarks.map(
                  ([k, t]) =>
                    html`<button
                      key=${k}
                      class=${bms.includes(k) ? "on" : ""}
                      onClick=${() => toggleMark(k)}
                    >
                      ${t}
                    </button>`,
                )}
              </div>`
            : html`<div class="hint">
                ${picked.length
                  ? "Ninguna marca especial es posible en los seleccionados" +
                    (bg ? " en " + bg : "") +
                    "."
                  : "Elige Pokémon para ver qué marcas puedes añadir."}
              </div>`}
          <div class="bk-row">
            <button
              disabled=${!(bg || bms.length) || !picked.length}
              onClick=${() => applyBulk(true)}
            >
              Añadir</button
            ><button
              disabled=${!(bg || bms.length) || !picked.length}
              onClick=${() => applyBulk(false)}
            >
              Quitar
            </button>
          </div>
          ${msg ? html`<div class="hint">${msg}</div>` : null}
        </div>`
      : null}
    ${sx
      ? html`<${Sheet}
          key=${sx.k}
          x=${sx}
          title=${label(sx, pr.forms)}
          e=${{ ...blank, ...(data[sel] || {}) }}
          av=${av(sx)}
          upd=${upd}
          del=${del}
          close=${() => {
            setSel(null);
            setLt(null);
          }}
          gs=${gs}
          gm=${gm}
          lt=${lt}
        />`
      : null}
  </div>`;
}
ReactDOM.createRoot(document.getElementById("root")).render(html`<${App} />`);
