import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  author: string;
  category: string;
  readTime: string;
  image: string;
  keywords: string;
  excerpt: string;
  tags?: string[];
}

export interface Post extends PostMeta {
  content: string;
}

export function getPostSlugs(): string[] {
  try {
    const fileNames = fs.readdirSync(postsDirectory);
    return fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map((fileName) => fileName.replace(/\.md$/, ''));
  } catch {
    return [];
  }
}

export function getPostBySlug(slug: string): Post | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      content,
      title: data.title || data.description || '',
      date: data.date || '',
      author: data.author || '',
      category: data.category || data.categories?.[0] || '',
      readTime: data.readTime || data.readingTime || '',
      image: data.image || data.coverImage || '',
      keywords: data.keywords || data.description || '',
      excerpt: data.excerpt || data.description || '',
      tags: data.tags || [],
    };
  } catch {
    return null;
  }
}

export interface PostsFilter {
  category?: string;
  sort?: 'recent' | 'oldest';
}

export function getAllPosts(filter?: PostsFilter): PostMeta[] {
  const slugs = getPostSlugs();
  let posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is Post => post !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map(({ slug, title, date, author, category, readTime, image, keywords, excerpt, tags }) => ({
      slug,
      title,
      date,
      author,
      category,
      readTime,
      image,
      keywords,
      excerpt,
      tags,
    }));

  if (filter?.category && filter.category !== 'all') {
    posts = posts.filter(p => p.category === filter.category);
  }

  if (filter?.sort === 'oldest') {
    posts = posts.reverse();
  }

  return posts;
}

export function getPostsPagination(page: number = 1, perPage: number = 10, filter?: PostsFilter): {
  posts: PostMeta[];
  totalPages: number;
  currentPage: number;
} {
  const allPosts = getAllPosts(filter);
  const totalPages = Math.ceil(allPosts.length / perPage);
  const startIndex = (page - 1) * perPage;
  const posts = allPosts.slice(startIndex, startIndex + perPage);

  return {
    posts,
    totalPages,
    currentPage: page,
  };
}

export function getCategories(): string[] {
  const posts = getAllPosts();
  const categories = new Set(posts.map(p => p.category).filter(Boolean));
  return Array.from(categories).sort();
}

export function getRelatedPosts(currentSlug: string, limit: number = 3): PostMeta[] {
  const allPosts = getAllPosts();
  const currentPost = getPostBySlug(currentSlug);
  
  if (!currentPost) return [];

  const currentTags = currentPost.tags || [];
  const currentCategory = currentPost.category;
  const currentKeywords = currentPost.keywords?.split(',').map(k => k.trim().toLowerCase()) || [];

  const scored = allPosts
    .filter(p => p.slug !== currentSlug)
    .map(post => {
      let score = 0;
      
      if (post.category === currentCategory) score += 2;
      
      const postTags = post.tags || [];
      const postKeywords = post.keywords?.split(',').map(k => k.trim().toLowerCase()) || [];
      
      const commonTags = currentTags.filter(t => postTags.includes(t));
      score += commonTags.length * 3;
      
      const commonKeywords = currentKeywords.filter(k => 
        postKeywords.some(pk => pk.includes(k) || k.includes(pk))
      );
      score += commonKeywords.length;

      return { post, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(s => s.post);
}
