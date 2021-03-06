import { Component, OnInit } from '@angular/core';
import { Constants, Title } from '../../../shared';

import { FrontendUser } from '@pulp-fiction/models/users';
import { MessageThread } from '@pulp-fiction/models/messages';
import { PaginateResult } from '@pulp-fiction/models/util';
import { AuthService } from '../../../services/auth';
import { MessagesService } from '../../../services/content';

@Component({
  selector: 'port-conversations',
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.less']
})
export class ConversationsComponent implements OnInit {
  currentUser: FrontendUser;
  threads: PaginateResult<MessageThread>;

  pageNum: number = 1;

  constructor(private authService: AuthService, private messageService: MessagesService) {
    this.authService.currUser.subscribe(x => {this.currentUser = x;});
    // this.fetchData(this.pageNum);
  }

  ngOnInit(): void {
    Title.setTwoPartTitle(Constants.INBOX);
  }

  private fetchData(pageNum: number) {
    this.messageService.fetchUserThreads(pageNum).subscribe(threads => {
      this.threads = threads;
      this.pageNum = pageNum;
    });
  }
}