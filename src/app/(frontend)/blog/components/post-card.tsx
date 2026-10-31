import Image from 'next/image';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { ROUTES } from '@/utils/constants/routes';
import type { ICmsPostSummary } from '@/utils/services/cms/types';

interface PostCardProps {
  post: ICmsPostSummary;
}

function PostCard({ post }: PostCardProps) {
  const { cover, category } = post;

  return (
    <Link href={`${ROUTES.blog}/${post.slug}`} className='group block'>
      <Card className='h-full overflow-hidden transition-shadow group-hover:shadow-md'>
        {cover?.url && (
          <Image
            src={cover.url}
            alt={cover.alt}
            width={cover.width || 800}
            height={cover.height || 450}
            sizes='(min-width: 768px) 33vw, 100vw'
            className='aspect-video w-full object-cover'
          />
        )}
        <CardHeader>
          {category && <p className='text-primary text-xs font-medium uppercase'>{category.title}</p>}
          <CardTitle>{post.title}</CardTitle>
          {post.excerpt && <CardDescription>{post.excerpt}</CardDescription>}
        </CardHeader>
        <CardContent />
      </Card>
    </Link>
  );
}

export { PostCard };
