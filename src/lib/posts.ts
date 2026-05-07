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
  keywords: string | string[];
  excerpt: string;
  description?: string;
  tags?: string[];
  featured?: boolean;
}

export interface Post extends PostMeta {
  content: string;
  featured?: boolean;
}

export function getPostSlugs(): string[] {
  try {
    const fileNames = fs.readdirSync(postsDirectory);
    const slugs = fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map((fileName) => fileName.replace(/\.md$/, ''));
    return slugs;
  } catch {
    return [];
  }
}

function getSlugFromSlug(slug: string): string | null {
  try {
    const fileNames = fs.readdirSync(postsDirectory);
    for (const fileName of fileNames) {
      if (!fileName.endsWith('.md')) continue;
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);
      if (data.slug === slug) {
        return fileName.replace(/\.md$/, '');
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function getPostBySlug(slug: string): Post | null {
  try {
    if (!slug || !/^[a-zA-Z0-9-]+$/.test(slug)) {
      return null;
    }
    let fullPath = path.join(postsDirectory, `${slug}.md`);
    let content: string;
    let data: any;
    
    if (fs.existsSync(fullPath)) {
      const fc = fs.readFileSync(fullPath, 'utf8');
      const result = matter(fc);
      data = result.data;
      content = result.content;
    } else {
      const fileName = getSlugFromSlug(slug);
      if (!fileName) return null;
      fullPath = path.join(postsDirectory, `${fileName}.md`);
      const fc = fs.readFileSync(fullPath, 'utf8');
      const result = matter(fc);
      data = result.data;
      content = result.content;
    }

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
      description: data.description || '',
      tags: data.tags || [],
      featured: data.featured || false,
    };
  } catch {
    return null;
  }
}

export interface PostsFilter {
  category?: string;
  sort?: 'recent' | 'oldest';
  search?: string;
}

export function getAllPosts(filter?: PostsFilter): PostMeta[] {
  const slugs = getPostSlugs();
  let posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is Post => post !== null)
    .sort((a, b) => {
      // featured:true siempre primero, luego por fecha descendente
      const aFeatured = (a as any).featured ? 1 : 0;
      const bFeatured = (b as any).featured ? 1 : 0;
      if (bFeatured !== aFeatured) return bFeatured - aFeatured;
      return a.date < b.date ? 1 : -1;
    })
    .map(({ slug, title, date, author, category, readTime, image, keywords, excerpt, description, tags }) => ({
      slug,
      title,
      date,
      author,
      category,
      readTime,
      image,
      keywords,
      excerpt,
      description,
      tags,
    }));

  if (filter?.category && filter.category !== 'all') {
    posts = posts.filter(p => p.category === filter.category);
  }

  if (filter?.sort === 'oldest') {
    posts = posts.reverse();
  }

  if (filter?.search && filter.search.trim().length > 0) {
    const s = filter.search.toLowerCase();
    posts = posts.filter(p => 
      p.title.toLowerCase().includes(s) ||
      (p.excerpt && p.excerpt.toLowerCase().includes(s)) ||
      (Array.isArray(p.tags) && p.tags.length > 0 && p.tags.some((t: string) => t && t.toLowerCase().includes(s))) ||
      (typeof p.keywords === 'string' && p.keywords.length > 0 && p.keywords.toLowerCase().includes(s)) ||
      (Array.isArray(p.keywords) && p.keywords.length > 0 && p.keywords.some((k: string) => k && k.toLowerCase().includes(s)))
    );
  }

  return posts;
}

export interface PaginationOptions {
  skip?: number;
  category?: string;
  sort?: 'recent' | 'oldest';
  search?: string;
}

export function getPostsPagination(page: number = 1, perPage: number = 10, filter?: PaginationOptions): {
  posts: PostMeta[];
  totalPages: number;
  currentPage: number;
  featuredPosts: PostMeta[];
} {
  const allPosts = getAllPosts(filter ? {
    category: filter.category,
    sort: filter.sort,
    search: filter.search,
  } : undefined);
  const skip = filter?.skip || 0;
  const remainingPosts = allPosts.slice(skip);
  const totalPages = Math.max(1, Math.ceil(remainingPosts.length / perPage));
  const startIndex = (page - 1) * perPage;
  const posts = remainingPosts.slice(startIndex, startIndex + perPage);
  const featuredPosts = allPosts.slice(0, skip);

  return {
    posts,
    totalPages,
    currentPage: page,
    featuredPosts,
  };
}

export function getCategories(): string[] {
  const posts = getAllPosts();
  const categories = new Set(posts.map(p => p.category).filter(Boolean));
  return Array.from(categories).sort();
}

export function getPostsByCountry(countryName: string, limit: number = 3): PostMeta[] {
  const allPosts = getAllPosts();
  const name = countryName.toLowerCase();
  return allPosts
    .filter(p => 
      p.title.toLowerCase().includes(name) ||
      (p.keywords && Array.isArray(p.keywords) && p.keywords.some((k: string) => k.toLowerCase().includes(name))) ||
      (p.excerpt?.toLowerCase().includes(name))
    )
    .slice(0, limit);
}

export function getRelatedPosts(currentSlug: string, limit: number = 3): PostMeta[] {
  const allPosts = getAllPosts();
  const currentPost = getPostBySlug(currentSlug);
  
  if (!currentPost) return [];

  const currentTags = currentPost.tags || [];
  const currentCategory = currentPost.category;
  const currentKeywords = Array.isArray(currentPost.keywords)
    ? currentPost.keywords.map(k => k.toLowerCase())
    : currentPost.keywords?.split(',').map(k => k.trim().toLowerCase()) || [];

  const scored = allPosts
    .filter(p => p.slug !== currentSlug)
    .map(post => {
      let score = 0;
      
      if (post.category === currentCategory) score += 2;
      
      const postTags = post.tags || [];
      const postKeywords = Array.isArray(post.keywords) 
        ? post.keywords.map(k => k.toLowerCase()) 
        : post.keywords?.split(',').map(k => k.trim().toLowerCase()) || [];
      
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

export function getPostsByRisk(riskLevel: string, limit: number = 10): PostMeta[] {
  const allPosts = getAllPosts();
  const riskKeywords: Record<string, string[]> = {
    'alto': ['seguro', 'seguridad', 'zona riesgo', 'emergencia', 'evitar'],
    'medio': ['checklist', 'preparacion', 'consejos', 'requisitos'],
    'bajo': ['barato', 'economico', 'presupuesto', 'ahorrar'],
    'sin-riesgo': ['destinos', 'mejores', 'guia', 'turismo'],
  };
  
  const keywords = riskKeywords[riskLevel] || [];
  
  const getKeywordsArray = (kw: string | string[] | undefined): string[] => {
    if (Array.isArray(kw)) return kw;
    if (typeof kw === 'string') return kw.split(',').map(k => k.trim());
    return [];
  };

  return allPosts
    .filter(p => 
      keywords.some(k => {
        const pKeywords = getKeywordsArray(p.keywords);
        return pKeywords.some(pk => pk.toLowerCase().includes(k.toLowerCase())) ||
          p.title.toLowerCase().includes(k.toLowerCase()) ||
          p.tags?.some(t => t.toLowerCase().includes(k.toLowerCase()));
      })
    )
    .slice(0, limit);
}

export function getSeoClusterContent(countryName: string, riskLevel: string): {
  mainKeyword: string;
  longTailKeywords: string[];
  relatedTopics: string[];
} {
  const clusters: Record<string, { keywords: string[]; topics: string[] }> = {
    'alto': {
      keywords: [`seguro viaje ${countryName}`, `viajar seguro ${countryName}`, `recomendaciones ${countryName}`],
      topics: ['seguro obligatorio', 'emergencias', 'embajada', 'contacto consular'],
    },
    'medio': {
      keywords: [`requisitos entrada ${countryName}`, `visa ${countryName}`, `documentos ${countryName}`],
      topics: ['checklist', 'equipaje', 'presupuesto'],
    },
    'bajo': {
      keywords: [`viaje economico ${countryName}`, `que hacer ${countryName}`, `itinerario ${countryName}`],
      topics: ['turismo', 'destinos', 'presupuesto'],
    },
    'sin-riesgo': {
      keywords: [`mejores destinos ${countryName}`, `guia ${countryName}`, `turismo ${countryName}`],
      topics: ['que hacer', 'itinerario', 'recomendaciones'],
    },
  };
  
  const config = clusters[riskLevel] || clusters['sin-riesgo'];
  return {
    mainKeyword: `viajar a ${countryName}`,
    longTailKeywords: config.keywords,
    relatedTopics: config.topics,
  };
}
