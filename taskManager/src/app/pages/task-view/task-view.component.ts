import { Component, OnInit } from '@angular/core';
import { TaskService } from 'src/app/task.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Task } from 'src/app/models/task.model';
import { Tasks } from 'src/app/models/tasks.model';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {

  tasks: Tasks[];
  task: Task[];

  selectedTasksId: string;

  constructor(private taskService: TaskService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {
        if (params.tasksId) {
          this.selectedTasksId = params.tasksId;
          this.taskService.getTask(params.tasksId).subscribe((task: Task[]) => {
            this.task = task;
    
          })
        } else {
          this.task = undefined;
        }
      }
    )

    this.taskService.getTasks().subscribe((tasks: Tasks[]) => {
      this.tasks = tasks;
    })
    
  }


  onTaskClick(task: Task) {
    // we want to set the task to completed
    this.taskService.complete(task).subscribe(() => {
      // the task has been set to completed successfully
      console.log("Completed successully!");
      task.completed = !task.completed;
    })
  }

  onDeleteTasksClick() {
    this.taskService.deleteTasks(this.selectedTasksId).subscribe((res: any) => {
      this.router.navigate(['/tasks']);
      console.log(res);
    })
  }

  onDeleteTaskClick(id: string) {
    this.taskService.deleteTask(this.selectedTasksId, id).subscribe((res: any) => {
      this.task = this.task.filter(val => val._id !== id);
      console.log(res);
    })
  }

}
