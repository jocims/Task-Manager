import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-edit-tasks',
  templateUrl: './edit-tasks.component.html',
  styleUrls: ['./edit-tasks.component.scss']
})
export class EditTasksComponent implements OnInit {

  constructor(private route: ActivatedRoute, private taskService: TaskService, private router: Router) { }

  tasksId: string;

  
  ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {
        this.tasksId = params.tasksId;
        console.log(params.tasksId);
      }
    )
  }

  updateList(title: string) {
    this.taskService.updateTasks(this.tasksId, title).subscribe(() => {
      this.router.navigate(['/tasks', this.tasksId]);
    })
  }

}
