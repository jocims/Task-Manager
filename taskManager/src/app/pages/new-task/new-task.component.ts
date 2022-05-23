import { Component, OnInit } from '@angular/core';
import { TaskService } from 'src/app/task.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Task } from 'src/app/models/task.model';

@Component({
  selector: 'app-new-task',
  templateUrl: './new-task.component.html',
  styleUrls: ['./new-task.component.scss']
})
export class NewTaskComponent implements OnInit {

  constructor(private taskService: TaskService, private route: ActivatedRoute, private router: Router) { }

  tasksId: string;
  
  ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {
        this.tasksId = params['tasksId'];
      }
    )
  }

  createTask(title: string, deadline: Date, student: string ) {
    this.taskService.createTask(title, this.tasksId, deadline, student).subscribe((newTask: Task) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    })
  }

}
