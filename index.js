const express = require("express");
const path = require("path");
const exhbs = require("express-handlebars")
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, where, doc, addDoc, getDoc, query, updateDoc, setDoc } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require("firebase/auth");
const bodyParser = require('body-parser');
const alert = require('alert');

const firebaseConfig = {
    apiKey: "AIzaSyDDdBnSoCTSNcp2dfn7ro9xmJWWdzW0Tss",
    authDomain: "saludcercana-a0cc7.firebaseapp.com",
    projectId: "saludcercana-a0cc7",
    storageBucket: "saludcercana-a0cc7.appspot.com",
    messagingSenderId: "1012723325782",
    appId: "1:1012723325782:web:55ff640a734a1b0841d4f7"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth();

const app = express()

app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'))

app.engine('.hbs', exhbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    helpers: require('./public/js/helpers.js'),
    extname: '.hbs'
}))

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));




/*------------------- RUTAS -------------------*/

async function getUser() {
    const user = await auth.currentUser;
    return user
}

async function getServices(db) {
    const servicesCol = collection(db, 'Servicios');
    const servicesSnapshot = await getDocs(servicesCol);
    const services = servicesSnapshot.docs.map(doc => doc.data());
    return services;
}
async function getTypesServices(db) {
    const typesServicesCol = collection(db, 'TiposServicios');
    const typesServicesSnapshot = await getDocs(typesServicesCol);
    const typesServices = typesServicesSnapshot.docs.map(doc => doc.data());
    return typesServices;
}

async function getComentarios(db, servicioId) {
    const commentsCol = query(collection(db, 'Comentarios'), where('idServicio', '==', servicioId));
    const commentsSnapshot = await getDocs(commentsCol);
    const comments = commentsSnapshot.docs.map(doc => doc.data());
    return comments;
}

function getOut(user) {
    if (user != null) {
        return true
    } else {
        return false
    }
}

app.get('/', async (req, res) => {
    const servicios = await getServices(db);
    var user = await getUser();
    const typesServices = await getTypesServices(db);

    res.render('index', { servicios: servicios, session: user, typesServices: typesServices })
})

app.get('/servicio/:servicioId', async (req, res) => {
    var user = await getUser();
    const servicioId = req.params.servicioId;

    const docRef = doc(db, "Servicios", servicioId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const documento = docSnap.data();
        const ubiMaps = documento.Calle + "%20" + documento.Numero + ",%20" + documento.Colonia + ",%20" + documento.Municipio + ",%20" + documento.Estado;

        const comentarios = await getComentarios(db, servicioId);
        res.render('servicio/index', { session: user, ubicacion: ubiMaps, documento: documento, comentarios: comentarios });
    } else {
        alert('No existe ese servicio')
        res.redirect('/');
    }

})

app.post('/servicios', async (req, res) => {
    var user = await getUser();

    const data = req.body
    const TipoServicio = data.TipoServicio
    const Colonia = data.colonia
    const Postal = data.postal
    const Municipio = data.municipio
    const Estado = data.estado

    if (Colonia != '' && Postal != '' && Municipio != '' && Estado != '') {
        async function getServices(db) {
            const servicesCol = query(collection(db, 'Servicios'),
                where("TipoServicio", "==", TipoServicio),
                where("Colonia", "==", Colonia),
                where("Postal", "==", Postal),
                where("Municipio", "==", Municipio),
                where("Estado", "==", Estado));
            const servicesSnapshot = await getDocs(servicesCol);
            const services = servicesSnapshot.docs.map(doc => doc.data());
            return services;
        }
        const servicios = await getServices(db);
        res.render('servicios/index', { session: user, servicios: servicios, data: data });
    } else if (Colonia == '' && Postal != '' && Municipio != '' && Estado != '') {
        async function getServices(db) {
            const servicesCol = query(collection(db, 'Servicios'),
                where("TipoServicio", "==", TipoServicio),
                where("Postal", "==", Postal),
                where("Municipio", "==", Municipio),
                where("Estado", "==", Estado));
            const servicesSnapshot = await getDocs(servicesCol);
            const services = servicesSnapshot.docs.map(doc => doc.data());
            return services;
        }
        const servicios = await getServices(db);
        res.render('servicios/index', { session: user, servicios: servicios, data: data });
    } else if (Colonia != '' && Postal == '' && Municipio != '' && Estado != '') {
        async function getServices(db) {
            const servicesCol = query(collection(db, 'Servicios'),
                where("TipoServicio", "==", TipoServicio),
                where("Colonia", "==", Colonia),
                where("Municipio", "==", Municipio),
                where("Estado", "==", Estado));
            const servicesSnapshot = await getDocs(servicesCol);
            const services = servicesSnapshot.docs.map(doc => doc.data());
            return services;
        }
        const servicios = await getServices(db);
        res.render('servicios/index', { session: user, servicios: servicios, data: data });
    } else if (Colonia != '' && Postal != '' && Municipio == '' && Estado != '') {
        async function getServices(db) {
            const servicesCol = query(collection(db, 'Servicios'),
                where("TipoServicio", "==", TipoServicio),
                where("Postal", "==", Postal),
                where("Colonia", "==", Colonia),
                where("Estado", "==", Estado));
            const servicesSnapshot = await getDocs(servicesCol);
            const services = servicesSnapshot.docs.map(doc => doc.data());
            return services;
        }
        const servicios = await getServices(db);
        res.render('servicios/index', { session: user, servicios: servicios, data: data });
    } else if (Colonia != '' && Postal != '' && Municipio != '' && Estado == '') {
        async function getServices(db) {
            const servicesCol = query(collection(db, 'Servicios'),
                where("TipoServicio", "==", TipoServicio),
                where("Postal", "==", Postal),
                where("Colonia", "==", Colonia),
                where("Municipio", "==", Municipio));
            const servicesSnapshot = await getDocs(servicesCol);
            const services = servicesSnapshot.docs.map(doc => doc.data());
            return services;
        }
        const servicios = await getServices(db);
        res.render('servicios/index', { session: user, servicios: servicios, data: data });
    } else if (Colonia == '' && Postal == '' && Municipio != '' && Estado != '') {
        async function getServices(db) {
            const servicesCol = query(collection(db, 'Servicios'),
                where("TipoServicio", "==", TipoServicio),
                where("Estado", "==", Estado),
                where("Municipio", "==", Municipio));
            const servicesSnapshot = await getDocs(servicesCol);
            const services = servicesSnapshot.docs.map(doc => doc.data());
            return services;
        }
        const servicios = await getServices(db);
        res.render('servicios/index', { session: user, servicios: servicios, data: data });
    }
    else if (Colonia == '' && Postal != '' && Municipio == '' && Estado != '') {
        async function getServices(db) {
            const servicesCol = query(collection(db, 'Servicios'),
                where("TipoServicio", "==", TipoServicio),
                where("Postal", "==", Postal),
                where("Estado", "==", Estado));
            const servicesSnapshot = await getDocs(servicesCol);
            const services = servicesSnapshot.docs.map(doc => doc.data());
            return services;
        }
        const servicios = await getServices(db);
        res.render('servicios/index', { session: user, servicios: servicios, data: data });
    }
    else if (Colonia == '' && Postal != '' && Municipio != '' && Estado == '') {
        async function getServices(db) {
            const servicesCol = query(collection(db, 'Servicios'),
                where("TipoServicio", "==", TipoServicio),
                where("Postal", "==", Postal),
                where("Municipio", "==", Municipio));
            const servicesSnapshot = await getDocs(servicesCol);
            const services = servicesSnapshot.docs.map(doc => doc.data());
            return services;
        }
        const servicios = await getServices(db);
        res.render('servicios/index', { session: user, servicios: servicios, data: data });
    }
    else if (Colonia != '' && Postal == '' && Municipio == '' && Estado != '') {
        async function getServices(db) {
            const servicesCol = query(collection(db, 'Servicios'),
                where("TipoServicio", "==", TipoServicio),
                where("Colonia", "==", Colonia),
                where("Estado", "==", Estado));
            const servicesSnapshot = await getDocs(servicesCol);
            const services = servicesSnapshot.docs.map(doc => doc.data());
            return services;
        }
        const servicios = await getServices(db);
        res.render('servicios/index', { session: user, servicios: servicios, data: data });
    } else if (Colonia != '' && Postal == '' && Municipio != '' && Estado == '') {
        async function getServices(db) {
            const servicesCol = query(collection(db, 'Servicios'),
                where("TipoServicio", "==", TipoServicio),
                where("Colonia", "==", Colonia),
                where("Municipio", "==", Municipio));
            const servicesSnapshot = await getDocs(servicesCol);
            const services = servicesSnapshot.docs.map(doc => doc.data());
            return services;
        }
        const servicios = await getServices(db);
        res.render('servicios/index', { session: user, servicios: servicios, data: data });
    }
    else if (Colonia != '' && Postal != '' && Municipio == '' && Estado == '') {
        async function getServices(db) {
            const servicesCol = query(collection(db, 'Servicios'),
                where("TipoServicio", "==", TipoServicio),
                where("Postal", "==", Postal),
                where("Colonia", "==", Colonia));
            const servicesSnapshot = await getDocs(servicesCol);
            const services = servicesSnapshot.docs.map(doc => doc.data());
            return services;
        }
        const servicios = await getServices(db);
        res.render('servicios/index', { session: user, servicios: servicios, data: data });
    }
    else if (Colonia != '' && Postal == '' && Municipio == '' && Estado == '') {
        async function getServices(db) {
            const servicesCol = query(collection(db, 'Servicios'),
                where("TipoServicio", "==", TipoServicio),
                where("Colonia", "==", Colonia));
            const servicesSnapshot = await getDocs(servicesCol);
            const services = servicesSnapshot.docs.map(doc => doc.data());
            return services;
        }
        const servicios = await getServices(db);
        res.render('servicios/index', { session: user, servicios: servicios, data: data });
    }
    else if (Colonia == '' && Postal != '' && Municipio == '' && Estado == '') {
        async function getServices(db) {
            const servicesCol = query(collection(db, 'Servicios'),
                where("TipoServicio", "==", TipoServicio),
                where("Postal", "==", Postal));
            const servicesSnapshot = await getDocs(servicesCol);
            const services = servicesSnapshot.docs.map(doc => doc.data());
            return services;
        }
        const servicios = await getServices(db);
        res.render('servicios/index', { session: user, servicios: servicios, data: data });
    }
    else if (Colonia == '' && Postal == '' && Municipio != '' && Estado == '') {
        async function getServices(db) {
            const servicesCol = query(collection(db, 'Servicios'),
                where("TipoServicio", "==", TipoServicio),
                where("Municipio", "==", Municipio));
            const servicesSnapshot = await getDocs(servicesCol);
            const services = servicesSnapshot.docs.map(doc => doc.data());
            return services;
        }
        const servicios = await getServices(db);
        res.render('servicios/index', { session: user, servicios: servicios, data: data });
    }
    else if (Colonia != '' && Postal != '' && Municipio != '' && Estado == '') {
        async function getServices(db) {
            const servicesCol = query(collection(db, 'Servicios'),
                where("TipoServicio", "==", TipoServicio),
                where("Estado", "==", Estado));
            const servicesSnapshot = await getDocs(servicesCol);
            const services = servicesSnapshot.docs.map(doc => doc.data());
            return services;
        }
        const servicios = await getServices(db);
        res.render('servicios/index', { session: user, servicios: servicios, data: data });
    }
    else if (Colonia == '' && Postal == '' && Municipio == '' && Estado == '') {
        async function getServices(db) {
            const servicesCol = query(collection(db, 'Servicios'),
                where("TipoServicio", "==", TipoServicio));
            const servicesSnapshot = await getDocs(servicesCol);
            const services = servicesSnapshot.docs.map(doc => doc.data());
            return services;
        }
        const servicios = await getServices(db);
        res.render('servicios/index', { session: user, servicios: servicios, data: data });
    }

})

app.get('/agregarServicio', async (req, res) => {
    var user = await getUser();
    if (getOut(user)) {
        const typesServices = await getTypesServices(db);
        res.render('agregarServicio/index', { session: user, typesServices: typesServices });
    } else {
        alert('No cuenta con usuario, no puede agregar un servicio.')
        res.redirect('/')
    }
})

app.post('/agregarServicio', async (req, res) => {
    var user = await getUser();

    if (getOut(user)) {

        var nombreUsuario = ""
        var telefonoUsuario = ""

        const docRef = doc(db, "Usuarios", req.body.userEmail);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const documento = docSnap.data();
            nombreUsuario = documento.Nombre;
            telefonoUsuario = documento.Telefono;
        } else {
            console.log("No such document!");
        }

        const id = await addDoc(collection(db, "Servicios"), {
            userEmail: req.body.userEmail,
            userName: nombreUsuario,
            userTel: telefonoUsuario,
            TipoServicio: req.body.TipoServicio,
            Calle: req.body.calle,
            Numero: req.body.numero,
            Colonia: req.body.colonia,
            Postal: req.body.postal,
            Municipio: req.body.municipio,
            Estado: req.body.estado,
            Horario: req.body.horario,
            Descripcion: req.body.descripcion
        }).then(async function (docRef) {
            await updateDoc(doc(db, "Servicios", docRef.id), {
                ID: docRef.id
            });
        })
        alert('Se registró Servicio con éxito.')
        res.redirect('/');
    } else {
        res.redirect('/')
    }
})

app.get('/ayuda', async (req, res) => {
    var user = await getUser();
    res.render('ayuda/index', { session: user });
})

app.get('/contacto', async (req, res) => {
    var user = await getUser();
    res.render('contacto/index', { session: user });
})

app.get('/login', async (req, res) => {
    var user = await getUser();
    if (getOut(user)) {
        res.redirect('/')
    } else {
        res.render('login/index', { session: user });
    }
})

app.post('/login', async (req, res) => {
    var user = await getUser();
    if (getOut(user)) {
        res.redirect('/')
    } else {
        const user = req.body.user
        const pass = req.body.pass

        signInWithEmailAndPassword(auth, user, pass)
            .then((userCredential) => {
                alert('Inició sesión con éxito.')
                res.redirect('/')
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode)
                console.log(errorMessage)
                alert('Usuario no se puede ingresar.')
                res.redirect('/login');
            });
    }
})

app.get('/perfil', async (req, res) => {
    var user = await getUser();

    if (getOut(user)) {
        res.render('perfil/index', { session: user });
    } else {
        res.redirect('/')
    }
})

app.get('/signout', async (req, res) => {
    var user = await getUser();
    alert('Cerró sesión con éxito.')
    auth.signOut();
    res.redirect('/login');
})

app.get('/signin', async (req, res) => {
    var user = await getUser();
    if (getOut(user)) {
        res.redirect('/')
    } else {
        res.render('signin/index', { session: user });
    }
})

app.post('/signin', async (req, res) => {
    var user = await getUser();
    if (getOut(user)) {
        res.redirect('/')
    } else {
        const name = req.body.name
        const tel = req.body.tel
        const correo = req.body.correo
        const pass = req.body.pass

        await createUserWithEmailAndPassword(auth, correo, pass)
            .then(async (userCredential) => {
                alert('Se registró con éxito.')
                await setDoc(doc(db, "Usuarios", correo), {
                    Nombre: req.body.name,
                    Telefono: req.body.tel,
                    Correo: req.body.correo,
                    Contrasena: req.body.pass
                });

                res.redirect('/');
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode)
                console.log(errorMessage)
                alert('Usuario no se puede registrar.')
                res.redirect('/signin');
            })
    }
})

app.post('/servicio/review', async (req, res) => {
    await addDoc(collection(db, "Comentarios"), {
        Nombre: req.body.nombre,
        Comentario: req.body.comentario,
        idServicio: req.body.idServicio,
    }).then(function () {
        res.redirect('/servicio/' + req.body.idServicio)
    })
})

app.listen(app.get('port'), () => {
    console.log(`App listening on port ${app.get('port')}`)
})