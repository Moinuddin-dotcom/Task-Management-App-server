const express = require('express')
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 8004
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const corsOption = {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'https://task-management-applicat-4ece4.web.app'],
    credentials: true,
    optionalSuccessStatus: 200,
}

// middleware
app.use(cors(corsOption))
app.use(express.json())
app.use(cookieParser())


// const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.afwrd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const verifyToken = (req, res, next) => {
    const token = req.cookies?.token
    console.log(token)
    if (!token) return res.status(401).send({ message: "Unauthorized access" })
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).send({ message: "Unauthorized access" })
        req.user = decoded
    })
    next()

}

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        const userCollection = client.db('todoDB').collection('users');
        const taskCollection = client.db('todoDB').collection('tasks');

        //jwt token
        app.post('/jwt', (req, res) => {
            const email = req.body
            // create token
            const token = jwt.sign(email, process.env.SECRET_KEY, { expiresIn: '365d' })
            console.log(token)
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV == 'production',
                sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'strict'
            }).send({ success: true })
        })

        // clear jst token
        app.get('/logout', async (req, res) => {
            res.clearCookie('token', {
                maxAge: 0,
                secure: process.env.NODE_ENV == 'production',
                sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'strict'
            }).send({ success: true })
        })

        // post user in db
        app.post('/users', async (req, res) => {
            // console.log(req.body)
            const userInfo = req.body;
            const { email } = req.body;
            const query = { email }
            console.log(query)
            const existingUser = await userCollection.findOne(query)
            if (existingUser) {
                return res.send({ message: "User already exists", insertedId: null })
                // return res.send({ message: "User already exists", insertedId: existingUser._id })
            }
            const result = await userCollection.insertOne(userInfo);
            res.send(result);
        })

        // post task in db
        app.post('/tasks', verifyToken, async (req, res) => {
            // console.log(verifyToken)
            const newTask = req.body;
            const result = await taskCollection.insertOne(newTask);
            res.send(result)
        })

        // get all tasks from db by email
        app.get('/tasks/:email', verifyToken, async (req, res) => {
            const decodedEmail = req.user?.email
            const email = req.params.email
            if (decodedEmail !== email) {
                return res.status(403).send({ message: "Unauthorized access" })
            }
            try {
                const query = { email: email }
                const tasksData = await taskCollection.find(query).toArray()
                res.send(tasksData);

            } catch (error) {
                console.log(error)
                res.status(500).send({ message: "Server error" });
            }
        })


        // delete task from db
        app.delete('/tasks/:id', verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await taskCollection.deleteOne(query)
            res.send(result);
        })

        // update a task collection
        app.put('/tasks/:id', verifyToken, async (req, res) => {
            const id = req.params.id;
            const updateTask = req.body;
            const query = { _id: new ObjectId(id) };
            const updateData = {
                $set: updateTask,
                $currentDate: { lastModified: true }
            }
            const result = await taskCollection.updateOne(query, updateData);
            res.send(result);
        })





        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello from Task Management Application Server....')
})

app.listen(port, () => console.log(`Server running on port ${port}`))