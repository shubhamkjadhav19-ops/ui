import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants';
import { BlogRequest, BlogResponse, PagedResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class BlogService {
  constructor(private http: HttpClient) {}
  private get baseUrl(): string {
    // Avoid accidental double slashes if API_BASE_URL ends with `/`.
    return API_BASE_URL.replace(/\/+$/, '');
  }

  createBlog(payload: BlogRequest): Observable<BlogResponse> {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('content', payload.content);
    if (payload.image) {
      formData.append('image', payload.image);
    }
    return this.http.post<BlogResponse>(`${this.baseUrl}/api/blogs`, formData);
  }

  getBlogs(
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    sortDir = 'desc',
    title = '',
    authorUsername = ''
  ): Observable<PagedResponse<BlogResponse>> {
    return this.http.get<PagedResponse<BlogResponse>>(
      `${this.baseUrl}/api/blogs?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}&title=${encodeURIComponent(title)}&authorUsername=${encodeURIComponent(authorUsername)}`
    );
  }

  deleteBlog(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/api/blogs/${id}`, { responseType: 'text' });
  }
}
