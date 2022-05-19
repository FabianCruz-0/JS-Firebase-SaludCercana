const express = require("express");
const path = require("path");
const exhbs = require("express-handlebars")
const fileURLToPath = require("url");
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, orderBy, doc, addDoc } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require("firebase/auth");
const bodyParser = require('body-parser');

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

function getOut(user){
if(user != null )
{
    return true
} else 
{
    return false
}
}

app.get('/', async (req, res) => {
    const servicios = await getServices(db);
    var user = await getUser();

    res.render('index', { servicios: servicios, session: user })
})

app.get('/servicio', async (req, res) => {
    var user = await getUser();
    res.render('servicio/index', { session: user });
})

app.get('/servicios', async (req, res) => {
    var user = await getUser();
    res.render('servicios/index', { session: user });
})

app.get('/agregarServicio', async (req, res) => {
    var user = await getUser();
    if(getOut(user)) {
        const typesServices = await getTypesServices(db);
        res.render('agregarServicio/index', { session: user, typesServices: typesServices });
    } else {
        res.redirect('/')
    }
})

app.post('/agregarServicio', async (req, res) => {
    var user = await getUser();

    if(getOut(user)) {
        await addDoc(collection(db, "Servicios"), {
            userEmail: req.body.userEmail,
            TipoServicio: req.body.TipoServicio,
            Calle: req.body.calle,
            Numero: req.body.numero,
            Colonia: req.body.colonia,
            Municipio: req.body.municipio,
            Estado: req.body.estado,
            Horario: req.body.horario,
            Descripcion: req.body.descripcion
        });
    
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
    if(getOut(user)) {
        res.redirect('/')
    } else {
        res.render('login/index', { session: user });
    }
})

app.post('/login', async (req, res) => {

    if(getOut(user)) {
        res.redirect('/')
    } else {
        const user = req.body.user
        const pass = req.body.pass
    
        signInWithEmailAndPassword(auth, user, pass)
            .then((userCredential) => {
                res.redirect('/')
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
            });
    }
})

app.get('/perfil', async (req, res) => {
    var user = await getUser();

    if(getOut(user)) {
        res.render('perfil/index', { session: user });
    } else {
        res.redirect('/')
    }
})

app.get('/signout', async (req, res) => {
    var user = await getUser();
    auth.signOut();
    res.redirect('/');
})

app.get('/signin', async (req, res) => {
    var user = await getUser();
    if(getOut(user)) {
        res.redirect('/')
    } else {
        res.render('signin/index', { session: user });
    }
})

app.post('/signin', async (req, res) => {
    var user = await getUser();
    if(getOut(user)) {
        res.redirect('/')
    } else {
        const name = req.body.name
        const tel = req.body.tel
        const correo = req.body.correo
        const pass = req.body.pass
    
        await createUserWithEmailAndPassword(auth, correo, pass)
            .then (async(userCredential) => {
                
                await addDoc(collection(db, "Usuarios"), {
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
            })
    }
})

app.listen(app.get('port'), () => {
    console.log(`App listening on port ${app.get('port')}`)
})