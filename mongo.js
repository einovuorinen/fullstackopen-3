const mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator')

if ( process.argv.length<3 ) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2] //SUORITETAAN "node mongo.js <salasana>"

const url =
  `mongodb+srv://einovuorinen:${password}@cluster0-bhx23.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})
personSchema.plugin(uniqueValidator)

const Person = mongoose.model('Person', personSchema)

/*FOR TESTING
const person = new Person({
    name: 'Jaakko Vuorinen',
    number: '420-9996666',
})

person.save().then(response => {
    console.log(`added  number  to phonebook`);
    mongoose.connection.close();
})FOR TESTING*/

if ( process.argv.length==5 ) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
  })

  person.save().then(response => {
    console.log(`added ${person.name} number ${person.number} to phonebook`)
    mongoose.connection.close()
  })
}
else if (process.argv.length==3) {
  console.log('phonebook;')
  Person.find({}).then(x => {
    x.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
}
else {
  console.log('Give a maximum of 5 arguments.')
  mongoose.connection.close()
}