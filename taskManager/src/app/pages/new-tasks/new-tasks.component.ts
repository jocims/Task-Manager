import { Component, OnInit } from '@angular/core';
import { TaskService } from 'src/app/task.service';
import { Router } from '@angular/router';
import { Tasks } from 'src/app/models/tasks.model';

@Component({
  selector: 'app-new-tasks',
  templateUrl: './new-tasks.component.html',
  styleUrls: ['./new-tasks.component.scss']
})
export class NewTasksComponent implements OnInit {

  constructor(private taskService: TaskService, private router: Router) { }

  ngOnInit() {
  }

  createTasks(title: string) {
    this.taskService.createTasks(title).subscribe((tasks: Tasks) => {
      console.log(tasks);
      // Now we navigate to /tasks/task._id
      this.router.navigate([ '/tasks', tasks._id ]); 
    });
  }

}
