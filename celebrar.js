/* Dexter · celebración al completar una Pokédex (Lottie)
   Cargar ANTES de app.js. La librería se descarga solo la primera vez que se completa algo.
   La animación va en anim/completado.json (descárgala de lottiefiles.com en formato Lottie JSON). */
(function () {
  const SRC =
    "https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie_light.min.js";
  let lib = null;
  const load = () =>
    lib ||
    (lib = new Promise((ok, ko) => {
      const s = document.createElement("script");
      s.src = SRC;
      s.onload = () => ok(window.lottie);
      s.onerror = ko;
      document.head.appendChild(s);
    }));
  window.Celebrar = async function (texto) {
    const box = document.createElement("div");
    box.className = "celeb";
    box.innerHTML = '<div class="celeb-anim"></div><p></p>';
    box.querySelector("p").textContent = texto;
    document.body.appendChild(box);
    const cerrar = () => box.remove();
    box.onclick = cerrar;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches)
      return setTimeout(cerrar, 2500);
    try {
      const lottie = await load();
      const a = lottie.loadAnimation({
        container: box.firstChild,
        renderer: "svg",
        loop: false,
        autoplay: true,
        path: "anim/completado.json",
      });
      a.addEventListener("complete", () => setTimeout(cerrar, 800));
      a.addEventListener("data_failed", () => setTimeout(cerrar, 2500));
    } catch (e) {
      setTimeout(cerrar, 2500);
    }
  };
})();
