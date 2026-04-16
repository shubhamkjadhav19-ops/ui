import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../services/blog.service';
import { BlogResponse } from '../models';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';
import { API_BASE_URL } from '../constants';

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="alert-modal-overlay" *ngIf="pendingDeleteId !== null">
      <div class="alert-modal">
        <h3>Confirm</h3>
        <div class="alert-modal-icon alert-modal-icon-warn">?</div>
        <p>Are you sure you want to delete this blog?</p>
        <div class="confirm-actions">
          <button class="secondary confirm-btn" (click)="cancelDelete()">Cancel</button>
          <button class="danger confirm-btn" (click)="confirmDelete()">Delete</button>
        </div>
      </div>
    </div>

    <div class="card app-card blog-hero">
      <img
        src="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=1600&q=80"
        alt="Travel notes and camera on a wooden table" />
    </div>

    <div class="card app-card">
      <h2>Create Blog</h2>
      <p class="muted">Write a new post and publish it instantly.</p>
      <input [(ngModel)]="title" placeholder="Title" />
      <div class="error" *ngIf="createSubmitted && title.trim().length < 3">
        Title must be at least 3 characters.
      </div>
      <textarea rows="4" [(ngModel)]="content" placeholder="Content"></textarea>
      <div class="error" *ngIf="createSubmitted && content.trim().length < 10">
        Content must be at least 10 characters.
      </div>
      <label class="muted" for="blogImage">Upload image</label>
      <input id="blogImage" type="file" accept="image/*" (change)="onImageSelected($event)" />
      <button [disabled]="creatingBlog" (click)="createBlog()">
        {{ creatingBlog ? 'Creating...' : 'Create' }}
      </button>
      <div class="success" *ngIf="successMessage">{{ successMessage }}</div>
      <div class="error" *ngIf="error">{{ error }}</div>
    </div>

    <div class="card app-card">
      <h2>All Blogs</h2>
      <div class="filter-row">
        <input [(ngModel)]="searchTitle" placeholder="Search by title" />
        <input [(ngModel)]="searchAuthorUsername" placeholder="Search by created user" />
        <button [disabled]="loadingBlogs" (click)="searchBlogs()">
          {{ loadingBlogs ? 'Searching...' : 'Search' }}
        </button>
      </div>
      <div class="muted" *ngIf="loadingBlogs">Loading blogs...</div>
      <div *ngIf="!blogs.length">No blogs found.</div>
      <div class="card blog-item app-card" *ngFor="let blog of blogs">
        <img
          class="blog-item-image"
          [src]="resolveImageUrl(blog.imageUrl, blog.id)"
          [alt]="blog.title" />
        <div class="blog-item-content">
          <h3>{{ blog.title }}</h3>
          <p>{{ blog.content }}</p>
          <small>By {{ blog.authorUsername }} | {{ blog.createdAt }}</small>
          <button
            *ngIf="canDelete(blog)"
            class="danger"
            [disabled]="deletingId === blog.id"
            (click)="deleteBlog(blog.id)">
            {{ deletingId === blog.id ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
      <div class="pagination-row">
        <button class="secondary pagination-btn" [disabled]="page === 0 || loadingBlogs" (click)="prevPage()">
          Previous
        </button>
        <div class="page-size-group">
          <label for="pageSize" class="muted">Page size</label>
          <select
            id="pageSize"
            [ngModel]="size"
            (ngModelChange)="onPageSizeChange($event)"
            [disabled]="loadingBlogs">
            <option [ngValue]="5">5</option>
            <option [ngValue]="10">10</option>
            <option [ngValue]="20">20</option>
          </select>
        </div>
        <span class="muted">Page {{ page + 1 }} of {{ totalPages || 1 }}</span>
        <button class="secondary pagination-btn" [disabled]="last || loadingBlogs" (click)="nextPage()">
          Next
        </button>
      </div>
    </div>
  `
})
export class BlogsComponent implements OnInit {
  title = '';
  content = '';
  searchTitle = '';
  searchAuthorUsername = '';
  blogs: BlogResponse[] = [];
  error = '';
  successMessage = '';
  createSubmitted = false;
  creatingBlog = false;
  selectedImage: File | null = null;
  loadingBlogs = false;
  deletingId: number | null = null;
  pendingDeleteId: number | null = null;
  page = 0;
  size = 5;
  totalPages = 0;
  last = true;
  currentUsername: string | null = null;

  constructor(
    private blogService: BlogService,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUsername = this.authService.getLoggedInUsername();
    this.loadBlogs();
  }

  createBlog(): void {
    this.createSubmitted = true;
    this.clearMessages();
    if (!this.isCreateFormValid()) {
      return;
    }

    this.creatingBlog = true;
    this.blogService.createBlog({ title: this.title, content: this.content, image: this.selectedImage }).subscribe({
      next: () => {
        this.creatingBlog = false;
        this.title = '';
        this.content = '';
        this.selectedImage = null;
        this.createSubmitted = false;
        this.toastService.showSuccess('Blog created successfully.');
        this.page = 0;
        this.loadBlogs();
      },
      error: () => {
        this.creatingBlog = false;
        this.error = 'Failed to create blog';
        this.toastService.showError('Failed to create blog.');
      }
    });
  }

  loadBlogs(): void {
    this.error = '';
    this.loadingBlogs = true;
    this.blogService.getBlogs(this.page, this.size, 'createdAt', 'desc', this.searchTitle, this.searchAuthorUsername).subscribe({
      next: (response) => {
        this.loadingBlogs = false;
        this.blogs = response.content;
        this.totalPages = response.totalPages;
        this.last = response.last;
      },
      error: () => {
        this.loadingBlogs = false;
        this.error = 'Failed to load blogs';
        this.toastService.showError('Failed to load blogs.');
      }
    });
  }

  searchBlogs(): void {
    this.page = 0;
    this.loadBlogs();
  }

  deleteBlog(id: number): void {
    this.pendingDeleteId = id;
  }

  confirmDelete(): void {
    if (this.pendingDeleteId === null) {
      return;
    }
    const id = this.pendingDeleteId;
    this.pendingDeleteId = null;
    this.deletingId = id;
    this.blogService.deleteBlog(id).subscribe({
      next: () => {
        this.deletingId = null;
        this.toastService.showSuccess('Blog deleted successfully.');
        if (this.page > 0 && this.blogs.length === 1) {
          this.page--;
        }
        this.loadBlogs();
      },
      error: () => {
        this.deletingId = null;
        this.toastService.showError('Delete failed. You can delete only your own blogs.');
      }
    });
  }

  cancelDelete(): void {
    this.pendingDeleteId = null;
  }

  canDelete(blog: BlogResponse): boolean {
    return !!this.currentUsername && blog.authorUsername === this.currentUsername;
  }

  nextPage(): void {
    if (!this.last) {
      this.page++;
      this.loadBlogs();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadBlogs();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.size = Number(newSize);
    this.page = 0;
    this.loadBlogs();
  }

  onImageSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedImage = target.files && target.files.length ? target.files[0] : null;
  }

  resolveImageUrl(imageUrl: string | null | undefined, id: number): string {
    if (imageUrl) {
      return imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`;
    }
    return `https://picsum.photos/seed/blog-${id}/900/500`;
  }

  private clearMessages(): void {
    this.error = '';
    this.successMessage = '';
  }

  private isCreateFormValid(): boolean {
    return this.title.trim().length >= 3 && this.content.trim().length >= 10;
  }
}
