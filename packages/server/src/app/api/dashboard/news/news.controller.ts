import { Controller, Request, UseGuards, Body, Param, Post, Put, Patch, Get } from '@nestjs/common';

import { RolesGuard } from '../../../guards';
import { NewsService } from '../../../db/news';
import { Roles } from '@pulp-fiction/models/users';
import { PostForm } from '@pulp-fiction/models/news';

@Controller('news')
export class NewsController {
    constructor (private newsService: NewsService) {}

    @UseGuards(RolesGuard([Roles.Admin, Roles.Moderator, Roles.Contributor]))
    @Put('create-post')
    async createPost(@Request() req: any, @Body() postInfo: PostForm) {
        return await this.newsService.createNewPost(req.user, postInfo);
    }

    @UseGuards(RolesGuard([Roles.Admin, Roles.Moderator, Roles.Contributor]))
    @Patch('edit-post/:postId')
    async editPost(@Request() req: any, @Param('postId') postId: string, @Body() postInfo: PostForm) {
        return await this.newsService.editPost(req.user, postId, postInfo);
    }

    @UseGuards(RolesGuard([Roles.Admin, Roles.Moderator, Roles.Contributor]))
    @Get('fetch-all/:pageNum')
    async fetchAll(@Request() _req: any, @Param('pageNum') pageNum: number) {
        return await this.newsService.fetchAllForDashboard(pageNum);
    }
}
