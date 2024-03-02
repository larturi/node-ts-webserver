import request from 'supertest'
import { testServer } from '../../test-server'
import { prisma } from '../../../src/data/postgres'

describe('Todo routes testing', () => {
  beforeAll(async () => {
    await testServer.start()
  })

  beforeEach(async () => {
    await prisma.todo.deleteMany()
  })

  afterAll(() => {
    testServer.close()
  })

  const todo1 = { text: 'Hola Mundo 1' }
  const todo2 = { text: 'Hola Mundo 2' }

  test('should return Todos [GET] /api/todos', async () => {
    await prisma.todo.createMany({
      data: [todo1, todo2]
    })

    const { body } = await request(testServer.app).get('/api/todos').expect(200)

    expect(body).toBeInstanceOf(Array)
    expect(body.length).toBe(2)
    expect(body[0].text).toBe(todo1.text)
    expect(body[1].text).toBe(todo2.text)
    expect(body[0].completedAt).toBeNull()
  })

  test('should return a Todo [GET] /api/todos/:id', async () => {
    const todo = await prisma.todo.create({ data: todo1 })

    const { body } = await request(testServer.app)
      .get(`/api/todos/${todo.id}`)
      .expect(200)

    expect(body).toEqual({
      id: todo.id,
      text: todo.text,
      completedAt: todo.completedAt
    })
  })

  test('should return a 404 NotFound [GET] /api/todos/:id', async () => {
    const todoId = 999
    const { body } = await request(testServer.app)
      .get(`/api/todos/${todoId}`)
      .expect(404)

    expect(body).toEqual({ error: `Todo with id ${todoId} not found` })
  })

  test('should return a new Todo [POST] /api/todo', async () => {
    const { body } = await request(testServer.app)
      .post('/api/todos')
      .send(todo1)
      .expect(201)

    expect(body).toEqual({
      id: expect.any(Number),
      text: todo1.text,
      completedAt: null
    })
  })

  test('should return a Error if text is not present [POST] /api/todo', async () => {
    const { body } = await request(testServer.app)
      .post('/api/todos')
      .send({})
      .expect(400)

    expect(body).toEqual({ error: 'Text property is required' })
  })

  test('should return a updated Todo [PUT] /api/todo/:id', async () => {
    const todo = await prisma.todo.create({ data: todo1 })

    const { body } = await request(testServer.app)
      .put(`/api/todos/${todo.id}`)
      .send({
        text: 'Updated!',
        completedAt: '2024-01-31T00:00:00.000Z'
      })
      .expect(200)

    expect(body).toEqual({
      id: expect.any(Number),
      text: 'Updated!',
      completedAt: '2024-01-31T00:00:00.000Z'
    })
  })

  test('should return a 404 if Todo not found [PUT] /api/todo/:id', async () => {
    const { body } = await request(testServer.app)
      .put(`/api/todos/9999999`)
      .send({
        text: 'Updated!',
        completedAt: '2024-01-31T00:00:00.000Z'
      })
      .expect(400)

    expect(body).toEqual({ error: 'Todo with id 9999999 not found' })
  })

  test('should return a updated Todo only the date [PUT] /api/todo/:id', async () => {
    const todo = await prisma.todo.create({ data: todo1 })

    const { body } = await request(testServer.app)
      .put(`/api/todos/${todo.id}`)
      .send({
        completedAt: '2024-01-31T00:00:00.000Z'
      })
      .expect(200)

    expect(body).toEqual({
      id: expect.any(Number),
      text: todo.text,
      completedAt: '2024-01-31T00:00:00.000Z'
    })
  })

  test('should return a updated Todo only the text [PUT] /api/todo/:id', async () => {
    const todo = await prisma.todo.create({ data: todo1 })

    const { body } = await request(testServer.app)
      .put(`/api/todos/${todo.id}`)
      .send({
        text: 'Updated!'
      })
      .expect(200)

    expect(body).toEqual({
      id: expect.any(Number),
      text: 'Updated!',
      completedAt: null
    })
  })
})
