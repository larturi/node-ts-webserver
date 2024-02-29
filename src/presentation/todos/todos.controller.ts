import { Request, Response } from 'express'
import { CreateTodoDto, UpdateTodoDto } from '../../domain/dtos'
import { TodoRepository } from '../../domain/repositories/todo.repository'

export class TodosController {
  constructor(private readonly todoRepository: TodoRepository) {}

  public getTodos = async (req: Request, res: Response) => {
    const todos = await this.todoRepository.getAll()
    return res.json(todos)
  }

  public getTodoById = async (req: Request, res: Response) => {
    const id = +req.params.id

    try {
      const todo = await this.todoRepository.findById(id)
      return res.json(todo)
    } catch (error) {
      return res.status(404).json({ error: `Todo with id ${id} not found` })
    }
  }

  public createTodo = async (req: Request, res: Response) => {
    const [error, createTodoDto] = CreateTodoDto.create(req.body)

    if (error)
      return res.status(400).json({ error: `Text property is required` })

    const todo = await this.todoRepository.create(createTodoDto!)
    res.status(201).json(todo)
  }

  public updateTodo = async (req: Request, res: Response) => {
    const id = +req.params.id
    const [error, updateTodoDto] = UpdateTodoDto.create({ ...req.body, id })
    if (error) return res.status(400).json({ error })

    const updatedTodo = await this.todoRepository.updateById(updateTodoDto!)
    return res.json(updatedTodo)
  }

  public deleteTodo = async (req: Request, res: Response) => {
    const id = +req.params.id

    try {
      const deletedTodo = await this.todoRepository.deleteById(id)
      res.json(deletedTodo)
    } catch (error) {
      return res.status(404).json({ error: `Todo with id ${id} not found` })
    }
  }
}
