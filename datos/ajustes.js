/* Dexter · ajustes de disponibilidad
   Cargar DESPUÉS de disponibilidad.js. Sirve para corregir juegos sin editar la lista grande.
   Índices: 0 Rojo/Azul · 1 Amarillo · 2 Oro/Plata · 3 Cristal · 4 Rubí/Zafiro · 5 Esmeralda · 6 RF/VH
            7 Diamante/Perla · 8 Platino · 9 HG/SS · 10 Negro/Blanco · 11 N2/B2 · 12 X/Y · 13 ROZA
            14 Sol/Luna · 15 USUL · 16 Let's Go · 17 Espada/Escudo · 18 DBPR · 19 Leyendas: Arceus
            20 Escarlata/Púrpura · 21 Leyendas: Z-A */
(function (D) {
  const add = (n, i) => {
    const a = D.AV[n] || (D.AV[n] = []);
    if (!a.includes(i)) {
      a.push(i);
      a.sort((x, y) => x - y);
    }
  };

  /* Diamante Brillante / Perla Reluciente: se pueden obtener las 493 especies de Kanto a Sinnoh
     (#001 Bulbasaur a #493 Arceus). Algunos míticos solo por evento o por datos de guardado de otros juegos.
     Las formas de Alola y Galar no están; esas tienen su propia lista en datos/formas.js y no se tocan aquí.
     Fuente: serebii.net/brilliantdiamondshiningpearl/unobtainable.shtml */
  D.REGIONS.slice(0, 4).forEach((r) => r.pokemon.forEach((n) => add(n, 18)));

  /* Correcciones sueltas: "Nombre": [índices de juego] */
  const EXTRA = {};
  for (const n in EXTRA) EXTRA[n].forEach((i) => add(n, i));
})(window.DATA);
