import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { Task } from './models/task.model';
import {Student} from './models/student.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private webReqService: WebRequestService) { }

  getUser(id: string) {
    return this.webReqService.get(`student/${id}`);
  }
  
  getTasks() {
    return this.webReqService.get('tasks');
  }

  createTasks(title: string) {
    return this.webReqService.post('tasks', { title });
  }

  updateTasks(id: string, title: string) {
    // We want to send a web request to update a list
    return this.webReqService.patch(`tasks/${id}`, { title });
  }

  updateTask(tasksId: string, taskId: string, title: string) {
    // We want to send a web request to update a list
    return this.webReqService.patch(`tasks/${tasksId}/tasks/${taskId}`, { title });
  }

  deleteTask(tasksId: string, taskId: string) {
    return this.webReqService.delete(`tasks/${tasksId}/tasks/${taskId}`);
  }

  deleteTasks(id: string) {
    return this.webReqService.delete(`tasks/${id}`);
  }

  getTask(tasksId: string) {
    return this.webReqService.get(`tasks/${tasksId}/tasks`);
  }

  createTask(title: string, tasksId: string, deadline: Date, student: string) {
    // We want to send a web request to create a task
    return this.webReqService.post(`tasks/${tasksId}/tasks`, { title, deadline,student });
  }

  complete(task: Task) {
    return this.webReqService.patch(`tasks/${task._tasksId}/tasks/${task._id}`, {
      completed: !task.completed
    });
  }
}
