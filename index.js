const express = require('express')
const app = express()

const port = process.env.PORT || 5000
require('dotenv').config()
const cors = require('cors');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');




//middleware
app.use(cors())
app.use(express.json())




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cn4mz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
   
    // await client.connect();

    const userCollection = client.db("GameUser").collection("users");
    const quizCollection = client.db("GameUser").collection("quizzes");






    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h'
      });
      res.send({ token });
    });



    //middleware process
    const verifyToken = (req, res, next) => {
      console.log('inside verify token', req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized access' })
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next(); // bar
      });

    }




    //we check here that the requested user is actually the  token user or not  
    app.get('/users/admin/:email', verifyToken, async (req, res) => {

      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' })
      }
      const query = { email: email };
      const user = await userCollection.findOne(query)
      let admin = false;
      if (user) {
        admin = user?.role === 'user';

      }
      res.send({ user });
    })





app.post('/users', async(req, res) => {
    const user = req.body;
    console.log(user)
    const result = await userCollection.insertOne(user)
     res.send(result); 

 
})



// POST endpoint to add quiz (with better validation)
app.post("/quiz", verifyToken, async (req, res) => {
  try {
    const { question, options, answer } = req.body;
    
    // Validate the quiz data
    if (!question || !options || !answer) {
      return res.status(400).send({ message: "Missing required fields: question, options, answer" });
    }
    
    if (!Array.isArray(options)) {
      return res.status(400).send({ message: "Options must be an array" });
    }
    
    if (options.length < 2) {
      return res.status(400).send({ message: "Must have at least 2 options" });
    }
    
    if (!options.includes(answer)) {
      return res.status(400).send({ message: "Answer must be one of the options" });
    }
    
    const quiz = {
      question: question.trim(),
      options: options.map(opt => opt.trim()),
      answer: answer.trim(),
      createdAt: new Date()
    };
    
    const result = await quizCollection.insertOne(quiz);
    res.send({ success: true, result });
  } catch (error) {
    console.error("Error adding quiz:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});






// GET endpoint to retrieve random quiz (with better error handling)
app.get("/quiz", async (req, res) => {
  try {
    const quizzes = await quizCollection.find().toArray();
    
    if (quizzes.length === 0) {
      return res.status(404).send({ message: "No quiz found" });
    }
    
    const randomIndex = Math.floor(Math.random() * quizzes.length);
    const randomQuiz = quizzes[randomIndex];
    
    // Ensure the quiz has the correct structure
    const formattedQuiz = {
      _id: randomQuiz._id,
      question: randomQuiz.question,
      options: Array.isArray(randomQuiz.options) ? randomQuiz.options : [],
      answer: randomQuiz.answer
    };
    
    console.log("Sending quiz:", formattedQuiz);
    res.send(formattedQuiz);
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});



// GET endpoint to retrieve all quizzes (for debugging)
app.get("/quiz/all", async (req, res) => {
  try {
    const quizzes = await quizCollection.find().toArray();
    res.send(quizzes);
  } catch (error) {
    console.error("Error fetching all quizzes:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});






app.get("/quiz", async (req, res) => {
  try {
    const quizzes = await quizCollection.find().toArray();
    
    if (quizzes.length === 0) {
      return res.status(404).send({ message: "No quiz found" });
    }
    
    const randomIndex = Math.floor(Math.random() * quizzes.length);
    const randomQuiz = quizzes[randomIndex];
    
    // Ensure the quiz has the correct structure
    const formattedQuiz = {
      _id: randomQuiz._id,
      question: randomQuiz.question,
      options: Array.isArray(randomQuiz.options) ? randomQuiz.options : [],
      answer: randomQuiz.answer
    };
    
    console.log("Sending quiz:", formattedQuiz);
    res.send(formattedQuiz);
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});







// / GET endpoint to retrieve all quizzes (for debugging)
app.get("/quiz/all", async (req, res) => {
  try {
    const quizzes = await quizCollection.find().toArray();
    res.send(quizzes);
  } catch (error) {
    console.error("Error fetching all quizzes:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});




    
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
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
