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

  test('should return todos api/todos', async () => {
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

  test('should return a TODO api/todos/:id', async () => {
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

  test('should return a 404 NotFound api/todos/:id', async () => {
    const todoId = 999
    const { body } = await request(testServer.app)
      .get(`/api/todos/${todoId}`)
      .expect(404)

    expect(body).toEqual({ error: `Todo with id ${todoId} not found` })
  })
})
