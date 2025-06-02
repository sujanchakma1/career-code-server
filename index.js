const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 3000


app.use(express.json())
app.use(cors())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ra0uaai.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const jobsCollection = client.db('careerCode').collection('jobs')
    const applicationCollection = client.db('careerCode').collection('application')

    app.get('/jobs',async(req,res)=>{
       const cursor = jobsCollection.find()
       const result = await cursor.toArray()
       res.send(result)
    })
    app.get('/jobDetails/:id', async(req,res)=>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await jobsCollection.findOne(query)
      res.send(result)
    })
    app.post('/jobApplication/:id', async(req,res)=>{
      const application = req.body
      const result = await applicationCollection.insertOne(application)
      res.send(result)
    })
    app.get("/myApplication",async(req,res)=>{
      const email = req.query.email
      const query = {
        applicant: email
      }
      const result = await applicationCollection.find(query).toArray()
     
      for(const application of result){
        const jobId = application.jobId
        const jobQuery = {_id: new ObjectId (jobId)}
        const job = await jobsCollection.findOne(jobQuery)
        application.company = job.company 
        application.title = job.title
        application.company_logo = job.company_logo
        application.jobType = job.jobType
        application.location = job.location
        application.salaryRange = job.salaryRange
      }
       res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res)=>{
  res.send("Career code server running hot")
})

app.listen(port,()=>{
  console.log(`career code running on port: ${port}`)
})