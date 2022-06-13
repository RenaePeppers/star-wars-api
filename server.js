console.log('May Node be with you')
const express = require('express');
const bodyParser = require('body-parser')//Body-parser is a middleware. They help to tidy up the request object before we use them. Express lets us use middleware with the use method.
const app = express();                    //variable named app that runs express
const MongoClient = require('mongodb').MongoClient  //connect to mongodb throught mongoclient connect method
const connectionString = 'mongodb+srv://JRenaePeppers:Mookie123!@cluster0.zce9bce.mongodb.net/?retryWrites=true&w=majority'  //you got this from mongoDB.  get rid of <> around password and put in your mongodb password. this const is not in tutorial.  it makes the next line shorter
/* MongoClient.connect(connectionString, (err, client) => {  //this is after you put in const connectionString
    if (err) return console.error(err)
    console.log('Connected to Database')
  }) */  
  //we are replacing the previous paragraph with the following just because its more modern js with promis.then statements.  does same thing.
  
  MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database')
    const db = client.db('star-wars-quotes')
    const quotesCollection =db.collection('quotes') //this is in the CRUD -CREATE continued section of the tutorial. this must come before any .use, .get, .post

    app.set('view engine', 'ejs')//from the using ejs section allows us to render html with quotes

    app.use(bodyParser.urlencoded({ extended: true })) //The urlencoded method within body-parser tells body-parser to extract data from the <form> element and add them to the body property in the request object. now this object can be sent to a database

    app.use(express.static('public'))   //it wasn't clear in the tutorial where to put this line
    app.use(bodyParser.json())  //same here from the accepting put request section



    app.get('/', (req, res) => {
        quotesCollection.find().toArray() //this is in the (READ  operation) section. it allows to us read from the db. there is a mistake in the tutorial.  we changed to quotesCollection. this converts the object from the db that contains all the quotes into an array
          .then (results =>{
               console.log(results) //we had to reload the browser page to get the array to show up in the console.
               res.render('index.ejs', {quotes: results}) //she initially didn't include quotes:results, but then added it the second time
          })
          .catch(error=>console.error(error))
       // res.sendFile(__dirname + '/index.html')  //serves up the index.html page back to the browser from our server.  deleted when we got to ejs section
       
    })

    app.post('/quotes', (req, res) => {
        //console.log(req.body)  //do this to verify form and post are working/works with body parser stuff above.  should now show form inputs (app.use(bodyParser)) in an object that can be sent to a database
        quotesCollection.insertOne(req.body)  //this is in the CRUD -CREATE continued section of the tutorial
        .then(result => {
            console.log(result)
            res.redirect('/')  //this allows the browser to quit running forever and takes us back to where we can enter another quote
        })
        .catch(error => console.error(error))
      })

      app.put('/quotes', (req, res) => {  //this is from the accepting the put request
        quotesCollection.findOneAndUpdate(   //it isn't clear in the tutorial that is where you replace the console log
            { name: 'Yoda' },
            {
              $set: {
                name: req.body.name,
                quote: req.body.quote
              }
            },
            {
              upsert: true  //We can force MongoDB to create a new Darth Vadar quote if no Yoda quotes exist. We do this by setting upsert to true. upsert means: Insert a document if no documents can be updated.
            }
          )
            .then(result => {
                console.log(result)
                res.json('Success')
            })
            .catch(error => console.error(error))
      })

    app.delete('/quotes', (req, res) => {
       quotesCollection.deleteOne(
      {name: req.body.name}
       )
       .then(result =>{
        if (result.deletedCount === 0) {
          return res.json('No quote to delete')
        }
        res.json('Deleted Darth Vader quote')
         })
       .catch(error => console.error(error))
    })


      app.listen(3000, function() {            //create local server on port 3000 that browsers can connect to
        console.log('listening on 3000')  //express provides quicker way to create this than we've done before
    })     
  })
  .catch(error => console.error(error))


// Make sure you place body-parser before your CRUD handlers!
//app.get('/', function(req, res){do something})  this is much shorter way than we did last week
//app.get('/', function(req, res){
 //   res.send('Hello World')  //now it doesn't say cannot get
//})
//app.get('/', (req, res) => {     //arrow function is 'better/modern' way to write previous line.
 //   res.send('Hello World, you filthy animal')
//})   //I had to comment this app.get  in order for the next one to work.


