import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants';
import { BlogRequest, BlogResponse, PagedResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class BlogService {
  constructor(private http: HttpClient) {}

  createBlog(payload: BlogRequest): Observable<BlogResponse> {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('content', payload.content);
    if (payload.image) {
      formData.append('image', payload.image);
    }
    return this.http.post<BlogResponse>(`${API_BASE_URL}/api/blogs`, formData);
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
      `${API_BASE_URL}/api/blogs?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}&title=${encodeURIComponent(title)}&authorUsername=${encodeURIComponent(authorUsername)}`
    );
  }

  deleteBlog(id: number): Observable<string> {
    return this.http.delete(`${API_BASE_URL}/api/blogs/${id}`, { responseType: 'text' });
  }
}
