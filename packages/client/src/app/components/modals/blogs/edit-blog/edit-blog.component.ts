import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Blog, EditBlog } from '@pulp-fiction/models/blogs';


import { BlogsService } from '../../../../services/content';
import { AlertsService } from '../../../../modules/alerts';
import { dividerHandler, imageHandler } from '../../../../util/quill';
import { getQuillHtml } from 'packages/client/src/app/util/functions';

@Component({
  selector: 'app-edit-blog',
  templateUrl: './edit-blog.component.html',
  styleUrls: ['./edit-blog.component.less']
})
export class EditBlogComponent implements OnInit {
  blogData: Blog;
  loading = false;

  editorFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'divider', 'link', 'blockquote', 'code', 'image',
    'align', 'center', 'right', 'justify',
    'list', 'bullet', 'ordered'
  ];

  editBlogForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
    body: new FormControl('', [Validators.required, Validators.minLength(3)]),
    published: new FormControl(false)
  });

  constructor(private blogService: BlogsService, private cdr: ChangeDetectorRef, private dialogRef: MatDialogRef<EditBlogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any, private snackbar: MatSnackBar) {
      this.blogData = this.data.blogData;
    }

  ngOnInit(): void {
    this.editBlogForm.setValue({
      title: this.blogData.title,
      body: this.blogData.body,
      published: this.blogData.published,
    });
  }

  /**
   * Required for QuillJS to work with validators.
   */
  triggerChangeDetection() {
    this.cdr.detectChanges();
  }

  /**
   * Gets the Quill Editor object after the editor's creation in the template HTML
   * 
   * @param event The editor object
   */
  onEditorCreated(event: any) {
    let toolbar = event.getModule('toolbar');
    toolbar.addHandler('divider', dividerHandler);
    toolbar.addHandler('image', imageHandler);
  }

  /**
   * Blog form getter.
   */
  get fields() { return this.editBlogForm.controls; }

  /**
   * Submits any new edits to the blog and closes the modal if those edits are successful.
   * 
   * @param blogId The blog we're editing
   */
  submitEdits(blogId: string) {
    this.loading = true;
    if (this.fields.title.invalid) {
      this.snackbar.open(`A title must be between 3 and 100 characters in length.`)
      this.loading = false;
      return;
    }
    if (this.fields.body.invalid) {
      this.snackbar.open(`Body text must be greater than 5 characters.`);
      this.loading = false;
      return;
    }

    const blogBody = this.blogData.usesNewEditor
      ? this.fields.body.value
      : getQuillHtml(document.querySelector("quill-editor"))

    const updatedBlogInfo: EditBlog = {
      _id: blogId,
      title: this.fields.title.value,
      body: blogBody,
      published: this.fields.published.value,
      usesNewEditor: true
    };

    this.blogService.editBlog(updatedBlogInfo).subscribe(() => {
      this.loading = false;
      this.dialogRef.close();
    }, err => {
      this.loading = false;
      this.snackbar.open(err);
    });
  }

  /**
   * Asks if the users actually wants to close the form if its contents have already been changed.
   * 
   * Otherwise, it closes the form immediately.
   */
  askCancel() {
    if (this.editBlogForm.dirty) {
      if (confirm('Are you sure? Any unsaved changes will be lost.')) {
        this.dialogRef.close();
      } else {
        return;
      }
    } else {
      this.dialogRef.close();
      return;
    }
  }
}
