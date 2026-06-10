  const firebaseConfig = {
    apiKey: "AIzaSyADfNQH8VC6MgN9T7O6xFpRlr2eN3at65s",
    authDomain: "planificador-docente-b7a6b.firebaseapp.com",
    projectId: "planificador-docente-b7a6b",
    storageBucket: "planificador-docente-b7a6b.firebasestorage.app",
    messagingSenderId: "775763706860",
    appId: "1:775763706860:web:e753b1f2b43c47f680f6c9",
    measurementId: "G-ZCQJSCN1KZ"
  };
  firebase.initializeApp(firebaseConfig);
  const _auth = firebase.auth();
  const _db   = firebase.firestore();
  const _provider = new firebase.auth.GoogleAuthProvider();

  window._fbSignIn  = () => _auth.signInWithPopup(_provider).catch(e => console.error(e));
  window._fbSignOut = () => _auth.signOut();
  window._fbSave    = async (data) => {
    const user = _auth.currentUser; if(!user) return;
    await _db.collection('planificadores').doc(user.uid).set(data);
  };
  window._fbLoad = async () => {
    const user = _auth.currentUser; if(!user) return null;
    const snap = await _db.collection('planificadores').doc(user.uid).get();
    return snap.exists ? snap.data() : null;
  };

  window.addEventListener('load', () => {
    _auth.onAuthStateChanged(async (user) => {
      if(user) {
        setAuthUI(true, user.displayName || user.email);
        setSyncMsg('☁ Sincronizando con la nube...');
        const remoto = await window._fbLoad();
        if(remoto && remoto.version) {
          importRemoteData(remoto);
          setSyncOk('☁ Datos cargados desde la nube ✓');
        } else {
          await window._fbSave(getLocalSnapshot());
          setSyncOk('☁ Datos locales sincronizados ✓');
        }
      } else {
        setAuthUI(false, '');
        setSyncMsg('Sin conexión a la nube. Los cambios se guardan localmente.');
      }
    });
  });
