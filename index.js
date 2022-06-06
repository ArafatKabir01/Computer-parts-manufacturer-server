const express = require('express');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
const app = express()

//middleware

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@computerbuilder.xsiecyw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}

async function run() {
    try {
        await client.connect();
        const partsCollection = client.db('computerBuild').collection('parts');
        const userCollection = client.db('computerBuild').collection('users');
        const reviewCollection = client.db('computerBuild').collection('reviews');
        app.get('/parts', async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts)
        })

        app.post('/parts', async (req, res) => {
            const newProduct = req.body;
            const result = await partsCollection.insertOne(newProduct);
            res.send(result);

        })

        app.put('/parts/:id', async (req, res) => {
            const id = req.params.id;
            const updatedProduct = req.body;
            console.log(req.body);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updatedProduct.quantity,

                }
            };
            const result = await partsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);

        })

        app.get('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await partsCollection.findOne(query)
            res.send(result)




        })
        // user part
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET)
            res.send({ result, token });
        })
        app.put('/user/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {
                const filter = { email: email };
                const updateDoc = {
                  $set: { role: 'admin' },
                };
                const result = await userCollection.updateOne(filter, updateDoc);
                res.send(result);
              }
              else{
                res.status(403).send({message: 'forbidden'});
              }

        })
        app.get('/admin/:email', async(req, res) =>{
            const email = req.params.email;
            const user = await userCollection.findOne({email: email});
            const isAdmin = user.role === 'admin';
            res.send({admin: isAdmin})
          })

       

        app.get('/user' ,verifyJWT, async(req , res)=>{
            // const query = {};
            // const cursor = userCollection.find(query);
            const users = await userCollection.find().toArray();
            res.send(users)


        })
        app.get('/reviews' , async(req , res)=>{
            const query = {};
            const cursor = reviewCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts)


        })
        app.post('/review', async(req,res)=>{
            const newProduct = req.body;
            const result = await reviewCollection.insertOne(newProduct);
            res.send(result);
      
          })
          app.delete('/allProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await partsCollection.deleteOne(query)
            res.send(result)


        })
 

    }
    finally {

    }
    async function order() {
        try {
            await client.connect();
            const orderCollection = client.db('partsOrder').collection('order');
            app.get('/orderParts', async (req, res) => {
                const query = {};
                const cursor = orderCollection.find(query);
                const order = await cursor.toArray();
                res.send(order)
            })

            //post
            app.post('/userorder', async (req, res) => {
                const newProduct = req.body;
                    const result = await orderCollection.insertOne(newProduct);
                    res.send(result);
                

            })
            app.get('/myorders', async (req, res) => {
                const email = req.query.email;
                const athoraization = req.headers.authorization
                console.log(athoraization)
                const query = { email: email }
                const orders = await orderCollection.find(query).toArray();
                res.send(orders)
            })
            //Delete
            app.delete('/orderParts/:id', async (req, res) => {
                const id = req.params.id;
                const query = { _id: ObjectId(id) }
                const result = await orderCollection.deleteOne(query)
                res.send(result)


            })



        }
        finally {

        }
    }
    order().catch(console.dir)
}
run().catch(console.dir)








app.get('/', (req, res) => {
    res.send('ok')
})
app.listen(port, console.log(port))
