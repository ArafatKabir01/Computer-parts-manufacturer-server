const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
const app = express()

//middleware

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@computerbuilder.xsiecyw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const partsCollection = client.db('computerBuild').collection('parts');
        app.get('/parts', async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts)
        })

        app.post('/parts', async(req,res)=>{
            const newProduct = req.body;
            const result = await partsCollection.insertOne(newProduct);
            res.send(result);
      
          })

          app.put('/parts/:id', async(req, res) =>{
            const id = req.params.id;
            const updatedProduct = req.body;
            console.log(req.body);
            const filter = {_id: ObjectId(id)};
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updatedProduct.quantity,
                    
                    }
                };
                const result = await partsCollection.updateOne(filter, updatedDoc, options);
                res.send(result);
    
            })

            app.get('/order/:id', async(req , res)=>{
                const id = req.params.id;
                const query ={_id: ObjectId(id)}
                const result = await partsCollection.findOne(query)
                res.send(result)
          
          
              })
    }
    finally {

    }
}
run().catch(console.dir)





app.get('/', (req, res) => {
    res.send('ok')
})
app.listen(port, console.log(port))