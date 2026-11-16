/* Dexter · lógica de la app (React + htm, sin compilar)
   Cargar al final, después de los datos y de sync.js. */
const { useState, useEffect, useDeferredValue } = React;
const html = htm.bind(React.createElement);
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
const loadP = () => {
  try {
    return {
      go: "new",
      po: "num",
      forms: true,
      ...(JSON.parse(localStorage.getItem(PKEY)) || {}),
    };
  } catch (e) {
    return { go: "new", po: "num", forms: true };
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
};
/* Campos de las especies con dos Megaevoluciones (ver MEGA2 más abajo) */
const MKEYS = ["megaX", "megaY", "megaN", "megaZ"];
const isEmpty = (x) =>
  !x.games.length &&
  !x.shiny &&
  !x.alpha &&
  !x.mega &&
  !x.gmax &&
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
  const out = [];
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
];
const SHINY_LOCK = new Set(window.DATA.SHINY_LOCK || []);
const ALPHA_GAMES = ["Leyendas: Arceus", "Leyendas: Z-A"];
/* Se calcula una sola vez: juegos posibles, marcas posibles y nombre normalizado para buscar */
const EK = {};
ENTRIES.forEach((l) =>
  l.forEach((x) => {
    x.av = new Set((FAV[x.k] || AV[x.b] || []).map((i) => GAMES[i]));
    const m = M(x);
    x.can = {
      shiny: !SHINY_LOCK.has(x.b),
      alpha: ALPHA_GAMES.some((g) => x.av.has(g)),
      mega: !x.reg && !!(m && m[3].includes("mega")),
      gmax: !x.reg && GMAX.has(x.b),
    };
    x.n0 = norm(label(x, false));
    x.n1 = norm(label(x, true));
    EK[x.k] = x;
  }),
);
/* Imágenes a probar en orden según las marcas: Gigamax > Mega > normal, en versión shiny si corresponde.
   Si una no existe (por ejemplo, algunas megas nuevas), pasa a la siguiente; al final, la normal. */
const IMG = "https://img.pokemondb.net/sprites/home/";
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
const urls = (list, e) => [
  ...(e && e.shiny ? list.map((s) => IMG + "shiny/" + s + ".png") : []),
  ...list.map((s) => IMG + "normal/" + s + ".png"),
];
const megaImgs = (x, e) => {
  const b = slug(x.b),
    o = MEGA2[x.b];
  if (!o) return [b + "-mega", b + "-mega-x"];
  const f = o.find(([k]) => e[k]) || o[0];
  return [b + "-" + f[2]];
};
const srcs = (x, e) => {
  const list = [];
  if (e && e.gmax && x.can.gmax) list.push(slug(x.b) + "-gigantamax");
  if (e && e.mega && x.can.mega) list.push(...megaImgs(x, e));
  list.push(x.s);
  return urls(list, e);
};
/* En la ficha: una imagen por cada versión que tienes marcada (normal, cada Mega, Gigamax) */
const views = (x, e) => {
  const b = slug(x.b),
    v = [["Normal", [x.s]]],
    o = MEGA2[x.b];
  if (x.can.mega && o) {
    o.forEach(([k, t, s]) => {
      if (e[k]) v.push([t, [b + "-" + s]]);
    });
    if (e.mega && !o.some(([k]) => e[k])) v.push(["Mega", [b + "-" + o[0][2]]]);
  } else if (x.can.mega && e.mega) v.push(["Mega", megaImgs(x, e)]);
  if (x.can.gmax && e.gmax) v.push(["Gigamax", [b + "-gigantamax"]]);
  return v.map(([t, list]) => [t, urls(list, e)]);
};
function Sprite({ name, src, cls }) {
  const [i, setI] = useState(0);
  return i >= src.length
    ? html`<div class=${"sp ph " + (cls || "")}>${name[0]}</div>`
    : html`<img
        class=${"sp " + (cls || "")}
        loading="lazy"
        alt=""
        src=${src[i]}
        onError=${() => setI(i + 1)}
      />`;
}
function Sheet({ x, title, e, av, upd, del, close, gs }) {
  const name = x.k;
  const [g, setG] = useState("");
  const [conf, setConf] = useState(false);
  const [all, setAll] = useState(false);
  const opts = gs(all ? GAMES : av);
  const has = !isEmpty(e);
  const tg = (k, t) =>
    html`<button
      class=${e[k] ? "on" : ""}
      onClick=${() =>
        upd(name, (x) => {
          x[k] = !x[k];
        })}
    >
      ${t}
    </button>`;
  /* Cada Mega se marca aparte; "mega" queda encendido si tienes cualquiera */
  const mo = x.can.mega && MEGA2[x.b];
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
  const vw = views(x, e);
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
          <span class="num">#${String(NUM[x.b]).padStart(4, "0")}</span>${title}
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
              onClick=${() => {
                if (g) {
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
            ? mo.map(([m, t]) => tgm(m, "M " + t))
            : x.can[k] || e[k]
              ? tg(k, t)
              : null,
        )}
      </div>
      ${has
        ? conf
          ? html`<button
              class="rel"
              onClick=${() => {
                del(name);
                close();
              }}
            >
              Confirmar: liberar a ${title}
            </button>`
          : html`<button class="rel" onClick=${() => setConf(true)}>
              Liberar Pokémon
            </button>`
        : null}
      <button class="cl" onClick=${close}>Cerrar</button>
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
  const [q, setQ] = useState("");
  const [reg, setReg] = useState(-1);
  const [gm, setGm] = useState("");
  const [sel, setSel] = useState(null);
  const [pr, setPr] = useState(loadP);
  const sp = (k, v) => setPr((p) => ({ ...p, [k]: v }));
  const [fc, setFc] = useState("");
  const [ft, setFt] = useState([]);
  const [fo, setFo] = useState(false);
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
  const total = cnt.reduce((a, l) => a + l.length, 0);
  const owned = cnt.reduce((a, l) => a + l.filter((x) => own(x.k)).length, 0);
  /* La búsqueda usa un valor diferido para que escribir no se trabe */
  const dq = useDeferredValue(q);
  const nq = norm(dq);
  const cmp =
    pr.po === "az"
      ? (a, b) => label(a, pr.forms).localeCompare(label(b, pr.forms), "es")
      : pr.po === "desc"
        ? (a, b) => b.o - a.o
        : (a, b) => a.o - b.o;
  let groups = REGIONS.map((r, i) => ({
    r,
    i,
    all: cnt[i],
    list: ENTRIES[i]
      .filter(
        (x) =>
          (pr.forms || !x.f || fc === "reg") &&
          inG(x) &&
          passF(x, fc, ft) &&
          (!nq || (pr.forms ? x.n1 : x.n0).includes(nq)),
      )
      .sort(cmp),
  })).filter((g) => (reg < 0 || g.i === reg) && g.list.length);
  if (pr.po === "desc") groups = groups.slice().reverse();
  if (/^[hw][ud]$/.test(pr.po)) {
    const k = pr.po[0] === "h" ? 0 : 1,
      s = pr.po[1] === "u" ? 1 : -1;
    const list = groups
      .flatMap((g) => g.list)
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
  /* Añade o quita el juego elegido y las marcas elegidas en los seleccionados.
     Solo se aplica lo que es posible en cada Pokémon (un juego donde aparece, una marca que puede tener). */
  const applyBulk = (add) => {
    const g = bg;
    if (!g && !bm.length) return;
    const plan = pickedEntries.map((x) => ({
      k: x.k,
      g: !!g && x.av.has(g),
      m: add ? bm.filter((m) => x.can[m]) : bm,
    }));
    const done = plan.filter((p) => p.g || p.m.length).length,
      partial = add
        ? plan.filter((p) => p.m.length < bm.length || (g && !p.g)).length
        : 0;
    setData((d) => {
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
    <header>
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
        <span>${gm || "Living Dex"}</span
        ><span
          >${owned} / ${total} ·
          ${total ? ((owned / total) * 100).toFixed(1) : 0} %</span
        >
      </div>
      <div class="bar">
        <i style=${{ width: (total ? (owned / total) * 100 : 0) + "%" }}></i>
      </div>
      <select value=${gm} onChange=${(e) => setGm(e.target.value)}>
        <option value="">Todos los juegos (Living Dex)</option>
        ${gs(GAMES).map(
          (x) => html`<option key=${x} value=${x}>Jugando: ${x}</option>`,
        )}
      </select>
      <div class="opts">
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
        <button
          style=${{ flex: "0 0 auto" }}
          class=${pr.forms ? "on" : ""}
          onClick=${() => sp("forms", !pr.forms)}
        >
          Formas
        </button>
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
        <button class=${ft.length ? "on" : ""} onClick=${() => setFo(!fo)}>
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
        <button class=${sm ? "on" : ""} onClick=${() => openSel(!sm)}>
          Seleccionar
        </button>
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
        : null}
      ${gm
        ? html`<div class="hint">
            Toca un Pokémon para marcarlo en este juego; toca su imagen para ver
            el detalle.
          </div>`
        : null}
      <input
        style=${{ marginTop: 8 }}
        type="search"
        placeholder="Buscar Pokémon o forma…"
        value=${q}
        onInput=${(e) => setQ(e.target.value)}
      />
      <div class="chips">
        <button class=${reg < 0 ? "on" : ""} onClick=${() => setReg(-1)}>
          Todas</button
        >${REGIONS.map(
          (r, i) =>
            html`<button
              key=${r.name}
              class=${reg === i ? "on" : ""}
              onClick=${() => setReg(i)}
            >
              ${r.name}
            </button>`,
        )}
      </div>
    </header>
    ${groups.length
      ? groups.map(
          ({ r, all, list }) =>
            html`<div key=${r.name}>
              <h2>
                <span>${r.name}</span
                ><span
                  >${all.filter((x) => own(x.k)).length}/${all.length}</span
                >
              </h2>
              <div class="list">
                ${list.map((x) => {
                  const n = x.k,
                    e = data[n],
                    o = own(n),
                    on = sm ? pk[n] : o;
                  return html`<div
                    class=${"row" + (pk[n] ? " pk" : "")}
                    key=${n}
                    onClick=${() =>
                      sm ? togglePick(n) : gm ? tgl(n) : setSel(n)}
                  >
                    <span
                      onClick=${(ev) => {
                        ev.stopPropagation();
                        sm ? togglePick(n) : setSel(n);
                      }}
                      ><${Sprite}
                        key=${srcs(x, e)[0]}
                        name=${n}
                        src=${srcs(x, e)}
                    /></span>
                    <div class="nm">
                      <b class=${o ? "" : "mu"}
                        ><span class="num"
                          >#${String(NUM[x.b]).padStart(4, "0")}</span
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
    <div style=${{ height: sm ? 220 : 30 }}></div>
    ${sm
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
          <div class="bk-row bk-marks">
            ${MARKS.map(
              ([k, t]) =>
                html`<button
                  key=${k}
                  class=${bm.includes(k) ? "on" : ""}
                  onClick=${() => toggleMark(k)}
                >
                  ${t}
                </button>`,
            )}
          </div>
          <div class="bk-row">
            <button
              disabled=${!(bg || bm.length) || !picked.length}
              onClick=${() => applyBulk(true)}
            >
              Añadir</button
            ><button
              disabled=${!(bg || bm.length) || !picked.length}
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
          close=${() => setSel(null)}
          gs=${gs}
        />`
      : null}
  </div>`;
}
ReactDOM.createRoot(document.getElementById("root")).render(html`<${App} />`);
