/* Dexter · guardar el progreso en la cuenta de Google (Firebase)
   Si hay sesión iniciada, cada cambio se guarda también en la nube. */
(function () {
  firebase.initializeApp({
    apiKey: "AIzaSyBDhItQj-ghTDGf_qfKmiwsO59SQBtHdx8",
    authDomain: "dexter-12fab.firebaseapp.com",
    projectId: "dexter-12fab",
    storageBucket: "dexter-12fab.firebasestorage.app",
    messagingSenderId: "939216433635",
    appId: "1:939216433635:web:fc6c1c98641a85aee170d6",
  });
  const auth = firebase.auth(),
    db = firebase.firestore(),
    gp = new firebase.auth.GoogleAuthProvider();
  let user = null,
    ready = false,
    t = null;
  const ref = () => db.collection("users").doc(user.uid);
  window.Sync = {
    /* cb(usuario, progresoGuardadoEnLaNube) se llama al iniciar o cerrar sesión */
    onUser(cb) {
      return auth.onAuthStateChanged(async (u) => {
        user = u;
        ready = false;
        if (!u) return cb(null, null);
        let remote = null;
        try {
          const s = await ref().get();
          if (s.exists) remote = JSON.parse(s.data().d);
        } catch (e) {
          console.warn("Dexter: no se pudo leer la nube", e);
        }
        ready = true;
        cb(u, remote);
      });
    },
    /* Guarda con un pequeño retraso para no escribir en cada toque */
    save(data) {
      if (!user || !ready) return;
      clearTimeout(t);
      t = setTimeout(
        () =>
          ref()
            .set({
              d: JSON.stringify(data),
              t: firebase.firestore.FieldValue.serverTimestamp(),
            })
            .catch((e) =>
              console.warn("Dexter: no se pudo guardar en la nube", e),
            ),
        1200,
      );
    },
    signIn() {
      auth.signInWithPopup(gp).catch((e) => {
        if (/popup|not-supported/.test(e.code)) auth.signInWithRedirect(gp);
        else if (
          e.code !== "auth/cancelled-popup-request" &&
          e.code !== "auth/popup-closed-by-user"
        )
          alert("No se pudo iniciar sesión: " + e.message);
      });
    },
    signOut() {
      auth.signOut();
    },
  };
})();
