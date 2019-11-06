require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

app.use(express.static('build'))

app.use(cors())

app.use(bodyParser.json())

morgan.token('body', function (req) { return JSON.stringify(req.body) })
app.use(morgan('tiny'))

app.get('/api/persons', (req, res, next) => {
  //res.json(persons)
  Person.find({}).then(persons => {
    res.json(persons)
  })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) response.json(person.toJSON())
    else response.status(404).end
  })
    .catch(error => next(error))
})

app.get('/info', (req, res, next) => {
  Person.find({}).then(persons => {
    res.send(`<p>The phonebook has info of ${persons.length} people</p><p>${new Date()}</p>`)
  })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  /*const id = Number(request.params.id)
  persons = persons.filter(x => x.id !== id)
  response.status(204).end()
  */
  Person.findByIdAndRemove(request.params.id)
    .then(response.status(204).end())
    .catch(error => next(error))
})

/*const generateId = () => {
  let id = 0
  while(true) {
  	const rane = Math.floor(Math.random()*1000 + 1)
  	if (!persons.map(x => x.id).includes(rane)){
  		id = rane
  		break
  	}
  }
  return id
}*/

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Person ({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then(savedPerson => savedPerson.toJSON())
    .then(savedAndFormattedPerson => {
      response.json(savedAndFormattedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const person = {
    name: request.body.name,
    number: request.body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => response.json(updatedPerson.toJSON()))
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// virheellisten pyyntöjen käsittely
app.use(errorHandler)